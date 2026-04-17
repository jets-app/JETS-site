"use server";

import { db } from "@/server/db";
import { auth } from "@/server/auth";
import { revalidatePath } from "next/cache";
import type { MentorshipStatus } from "@prisma/client";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required");
  }
  return session.user;
}

// ---------- Types ----------

export interface MentorProfileFormData {
  trades: string[];
  bio?: string;
  maxMentees?: number;
  isAvailable?: boolean;
}

export interface MentorFilters {
  trade?: string;
  isAvailable?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface MenteeFormData {
  menteeName: string;
  menteeEmail?: string;
  menteePhone?: string;
  trade?: string;
  notes?: string;
}

// ---------- Actions ----------

export async function createMentorProfile(alumniId: string, data: MentorProfileFormData) {
  await requireAdmin();

  // Check alumni exists
  const alumni = await db.alumni.findUnique({ where: { id: alumniId } });
  if (!alumni) throw new Error("Alumni not found");

  // Check if already a mentor
  const existing = await db.mentorProfile.findUnique({ where: { alumniId } });
  if (existing) throw new Error("This alumni already has a mentor profile");

  const profile = await db.mentorProfile.create({
    data: {
      alumniId,
      trades: data.trades,
      bio: data.bio?.trim() || null,
      maxMentees: data.maxMentees ?? 2,
      isAvailable: data.isAvailable ?? true,
    },
  });

  // Update engagement score
  await db.alumni.update({
    where: { id: alumniId },
    data: { engagementScore: { increment: 20 } },
  });

  revalidatePath("/admin/alumni/mentors");
  return profile;
}

export async function getMentors(filters?: MentorFilters) {
  await requireAdmin();

  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 50;
  const skip = (page - 1) * pageSize;

  const where: Record<string, unknown> = {};

  if (filters?.isAvailable !== undefined) {
    where.isAvailable = filters.isAvailable;
  }

  if (filters?.trade) {
    where.trades = { has: filters.trade };
  }

  const [mentors, total] = await Promise.all([
    db.mentorProfile.findMany({
      where,
      include: {
        alumni: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    db.mentorProfile.count({ where }),
  ]);

  // If search filter, filter in memory (alumni name search)
  let filtered = mentors;
  if (filters?.search) {
    const search = filters.search.toLowerCase();
    filtered = mentors.filter(
      (m) =>
        m.alumni.firstName.toLowerCase().includes(search) ||
        m.alumni.lastName.toLowerCase().includes(search)
    );
  }

  return {
    mentors: filtered,
    total: filters?.search ? filtered.length : total,
    page,
    pageSize,
  };
}

export async function requestMentor(mentorId: string, data: MenteeFormData) {
  await requireAdmin();

  const mentor = await db.mentorProfile.findUnique({
    where: { id: mentorId },
  });
  if (!mentor) throw new Error("Mentor not found");

  const match = await db.mentorshipMatch.create({
    data: {
      mentorId: mentor.alumniId,
      menteeName: data.menteeName.trim(),
      menteeEmail: data.menteeEmail?.trim() || null,
      menteePhone: data.menteePhone?.trim() || null,
      trade: data.trade?.trim() || null,
      notes: data.notes?.trim() || null,
      status: "PENDING",
    },
  });

  revalidatePath("/admin/alumni/mentors");
  return match;
}

export async function updateMentorshipStatus(id: string, status: MentorshipStatus) {
  await requireAdmin();

  const updateData: Record<string, unknown> = { status };

  if (status === "ACTIVE") {
    updateData.startedAt = new Date();
  } else if (status === "COMPLETED" || status === "CANCELLED") {
    updateData.endedAt = new Date();
  }

  const match = await db.mentorshipMatch.update({
    where: { id },
    data: updateData,
  });

  revalidatePath("/admin/alumni/mentors");
  return match;
}

export async function getMentorshipMatches(filters?: { mentorId?: string; status?: MentorshipStatus }) {
  await requireAdmin();

  const where: Record<string, unknown> = {};
  if (filters?.mentorId) where.mentorId = filters.mentorId;
  if (filters?.status) where.status = filters.status;

  const matches = await db.mentorshipMatch.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return matches;
}

export async function updateMentorProfile(id: string, data: Partial<MentorProfileFormData>) {
  await requireAdmin();

  const updateData: Record<string, unknown> = {};
  if (data.trades !== undefined) updateData.trades = data.trades;
  if (data.bio !== undefined) updateData.bio = data.bio?.trim() || null;
  if (data.maxMentees !== undefined) updateData.maxMentees = data.maxMentees;
  if (data.isAvailable !== undefined) updateData.isAvailable = data.isAvailable;

  const profile = await db.mentorProfile.update({
    where: { id },
    data: updateData,
  });

  revalidatePath("/admin/alumni/mentors");
  return profile;
}

export async function getMentorStats() {
  await requireAdmin();

  const [totalMentors, availableMentors, totalMatches, activeMatches, pendingMatches] = await Promise.all([
    db.mentorProfile.count(),
    db.mentorProfile.count({ where: { isAvailable: true } }),
    db.mentorshipMatch.count(),
    db.mentorshipMatch.count({ where: { status: "ACTIVE" } }),
    db.mentorshipMatch.count({ where: { status: "PENDING" } }),
  ]);

  return { totalMentors, availableMentors, totalMatches, activeMatches, pendingMatches };
}
