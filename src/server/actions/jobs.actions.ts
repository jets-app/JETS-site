"use server";

import { db } from "@/server/db";
import { auth } from "@/server/auth";
import { revalidatePath } from "next/cache";
import type { JobStatus, JobType } from "@prisma/client";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required");
  }
  return session.user;
}

// ---------- Types ----------

export interface JobPostingFormData {
  title: string;
  company: string;
  description: string;
  location?: string;
  type?: JobType;
  trade?: string;
  salary?: string;
  contactEmail?: string;
  contactPhone?: string;
  applyUrl?: string;
  postedById?: string;
  expiresAt?: string;
}

export interface JobFilters {
  status?: JobStatus;
  trade?: string;
  type?: JobType;
  search?: string;
  page?: number;
  pageSize?: number;
}

// ---------- Actions ----------

export async function createJobPosting(data: JobPostingFormData) {
  await requireAdmin();

  const job = await db.jobPosting.create({
    data: {
      title: data.title.trim(),
      company: data.company.trim(),
      description: data.description.trim(),
      location: data.location?.trim() || null,
      type: data.type ?? "FULL_TIME",
      trade: data.trade?.trim() || null,
      salary: data.salary?.trim() || null,
      contactEmail: data.contactEmail?.trim() || null,
      contactPhone: data.contactPhone?.trim() || null,
      applyUrl: data.applyUrl?.trim() || null,
      postedById: data.postedById || null,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    },
  });

  revalidatePath("/admin/alumni/jobs");
  return job;
}

export async function getJobPostings(filters?: JobFilters) {
  await requireAdmin();

  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 50;
  const skip = (page - 1) * pageSize;

  const where: Record<string, unknown> = {};

  if (filters?.status) {
    where.status = filters.status;
  }

  if (filters?.trade) {
    where.trade = { contains: filters.trade, mode: "insensitive" };
  }

  if (filters?.type) {
    where.type = filters.type;
  }

  if (filters?.search) {
    const search = filters.search.trim();
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { company: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { trade: { contains: search, mode: "insensitive" } },
    ];
  }

  const [jobs, total] = await Promise.all([
    db.jobPosting.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    db.jobPosting.count({ where }),
  ]);

  return {
    jobs,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function updateJobPosting(id: string, data: Partial<JobPostingFormData>) {
  await requireAdmin();

  const updateData: Record<string, unknown> = {};
  if (data.title !== undefined) updateData.title = data.title.trim();
  if (data.company !== undefined) updateData.company = data.company.trim();
  if (data.description !== undefined) updateData.description = data.description.trim();
  if (data.location !== undefined) updateData.location = data.location?.trim() || null;
  if (data.type !== undefined) updateData.type = data.type;
  if (data.trade !== undefined) updateData.trade = data.trade?.trim() || null;
  if (data.salary !== undefined) updateData.salary = data.salary?.trim() || null;
  if (data.contactEmail !== undefined) updateData.contactEmail = data.contactEmail?.trim() || null;
  if (data.contactPhone !== undefined) updateData.contactPhone = data.contactPhone?.trim() || null;
  if (data.applyUrl !== undefined) updateData.applyUrl = data.applyUrl?.trim() || null;
  if (data.expiresAt !== undefined) updateData.expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;

  const job = await db.jobPosting.update({
    where: { id },
    data: updateData,
  });

  revalidatePath("/admin/alumni/jobs");
  return job;
}

export async function closeJobPosting(id: string) {
  await requireAdmin();

  const job = await db.jobPosting.update({
    where: { id },
    data: { status: "CLOSED" },
  });

  revalidatePath("/admin/alumni/jobs");
  return job;
}

export async function getJobStats() {
  await requireAdmin();

  const [total, active, closed] = await Promise.all([
    db.jobPosting.count(),
    db.jobPosting.count({ where: { status: "ACTIVE" } }),
    db.jobPosting.count({ where: { status: "CLOSED" } }),
  ]);

  return { total, active, closed };
}
