"use server";

import { db } from "@/server/db";
import { auth } from "@/server/auth";
import { revalidatePath } from "next/cache";
import type { EventStatus, RsvpStatus } from "@prisma/client";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required");
  }
  return session.user;
}

// ---------- Types ----------

export interface AlumniEventFormData {
  title: string;
  description?: string;
  location?: string;
  date: string;
  endDate?: string;
  status?: EventStatus;
  maxAttendees?: number;
  imageUrl?: string;
}

export interface EventFilters {
  status?: EventStatus;
  upcoming?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface RsvpFormData {
  alumniId?: string;
  name: string;
  email?: string;
  status?: RsvpStatus;
}

// ---------- Actions ----------

export async function createAlumniEvent(data: AlumniEventFormData) {
  await requireAdmin();

  const event = await db.alumniEvent.create({
    data: {
      title: data.title.trim(),
      description: data.description?.trim() || null,
      location: data.location?.trim() || null,
      date: new Date(data.date),
      endDate: data.endDate ? new Date(data.endDate) : null,
      status: data.status ?? "DRAFT",
      maxAttendees: data.maxAttendees ?? null,
      imageUrl: data.imageUrl?.trim() || null,
    },
  });

  revalidatePath("/admin/alumni/events");
  return event;
}

export async function getAlumniEvents(filters?: EventFilters) {
  await requireAdmin();

  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 50;
  const skip = (page - 1) * pageSize;

  const where: Record<string, unknown> = {};

  if (filters?.status) {
    where.status = filters.status;
  }

  if (filters?.upcoming) {
    where.date = { gte: new Date() };
  }

  if (filters?.search) {
    const search = filters.search.trim();
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { location: { contains: search, mode: "insensitive" } },
    ];
  }

  const [events, total] = await Promise.all([
    db.alumniEvent.findMany({
      where,
      include: {
        rsvps: true,
      },
      orderBy: { date: "desc" },
      skip,
      take: pageSize,
    }),
    db.alumniEvent.count({ where }),
  ]);

  return {
    events,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function updateAlumniEvent(id: string, data: Partial<AlumniEventFormData>) {
  await requireAdmin();

  const updateData: Record<string, unknown> = {};
  if (data.title !== undefined) updateData.title = data.title.trim();
  if (data.description !== undefined) updateData.description = data.description?.trim() || null;
  if (data.location !== undefined) updateData.location = data.location?.trim() || null;
  if (data.date !== undefined) updateData.date = new Date(data.date);
  if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.maxAttendees !== undefined) updateData.maxAttendees = data.maxAttendees ?? null;
  if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl?.trim() || null;

  const event = await db.alumniEvent.update({
    where: { id },
    data: updateData,
  });

  revalidatePath("/admin/alumni/events");
  return event;
}

export async function rsvpToEvent(eventId: string, data: RsvpFormData) {
  await requireAdmin();

  // Upsert based on eventId + email
  if (data.email) {
    const existing = await db.eventRsvp.findUnique({
      where: { eventId_email: { eventId, email: data.email } },
    });

    if (existing) {
      const rsvp = await db.eventRsvp.update({
        where: { id: existing.id },
        data: {
          name: data.name.trim(),
          status: data.status ?? "ATTENDING",
          alumniId: data.alumniId || null,
        },
      });
      revalidatePath("/admin/alumni/events");
      return rsvp;
    }
  }

  const rsvp = await db.eventRsvp.create({
    data: {
      eventId,
      alumniId: data.alumniId || null,
      name: data.name.trim(),
      email: data.email?.trim() || null,
      status: data.status ?? "ATTENDING",
    },
  });

  // Update engagement score if alumniId is provided and attending
  if (data.alumniId && (data.status === "ATTENDING" || !data.status)) {
    await db.alumni.update({
      where: { id: data.alumniId },
      data: { engagementScore: { increment: 10 } },
    });
  }

  revalidatePath("/admin/alumni/events");
  return rsvp;
}

export async function getEventRsvps(eventId: string) {
  await requireAdmin();

  const rsvps = await db.eventRsvp.findMany({
    where: { eventId },
    orderBy: { createdAt: "desc" },
  });

  return rsvps;
}

export async function getEventStats() {
  await requireAdmin();

  const now = new Date();
  const [total, upcoming, published, totalRsvps] = await Promise.all([
    db.alumniEvent.count(),
    db.alumniEvent.count({ where: { date: { gte: now }, status: "PUBLISHED" } }),
    db.alumniEvent.count({ where: { status: "PUBLISHED" } }),
    db.eventRsvp.count({ where: { status: "ATTENDING" } }),
  ]);

  return { total, upcoming, published, totalRsvps };
}

export async function deleteAlumniEvent(id: string) {
  await requireAdmin();

  await db.alumniEvent.delete({ where: { id } });
  revalidatePath("/admin/alumni/events");
  return { success: true };
}
