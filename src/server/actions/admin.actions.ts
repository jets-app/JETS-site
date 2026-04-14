"use server";

import { db } from "@/server/db";
import { auth } from "@/server/auth";
import { revalidatePath } from "next/cache";
import type { ApplicationStatus } from "@prisma/client";

// ---------- Helpers ----------

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required");
  }
  return session.user;
}

// Valid status transitions map
const STATUS_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  DRAFT: ["SUBMITTED", "WITHDRAWN"],
  SUBMITTED: ["OFFICE_REVIEW", "WITHDRAWN"],
  OFFICE_REVIEW: [
    "PRINCIPAL_REVIEW",
    "SUBMITTED",
    "REJECTED",
    "WITHDRAWN",
  ],
  PRINCIPAL_REVIEW: [
    "INTERVIEW_SCHEDULED",
    "OFFICE_REVIEW",
    "REJECTED",
    "WITHDRAWN",
  ],
  INTERVIEW_SCHEDULED: [
    "INTERVIEW_COMPLETED",
    "PRINCIPAL_REVIEW",
    "REJECTED",
    "WITHDRAWN",
  ],
  INTERVIEW_COMPLETED: [
    "ACCEPTED",
    "WAITLISTED",
    "REJECTED",
    "SCHOLARSHIP_REVIEW",
    "WITHDRAWN",
  ],
  ACCEPTED: ["DOCUMENTS_PENDING", "ENROLLED", "WITHDRAWN"],
  DOCUMENTS_PENDING: ["ENROLLED", "ACCEPTED", "WITHDRAWN"],
  SCHOLARSHIP_REVIEW: [
    "ACCEPTED",
    "WAITLISTED",
    "REJECTED",
    "WITHDRAWN",
  ],
  ENROLLED: ["WITHDRAWN"],
  REJECTED: ["OFFICE_REVIEW"],
  WAITLISTED: ["ACCEPTED", "REJECTED", "WITHDRAWN"],
  WITHDRAWN: ["SUBMITTED"],
};

// ---------- Actions ----------

export interface ApplicationFilters {
  search?: string;
  status?: ApplicationStatus;
  academicYear?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export async function getAllApplications(filters?: ApplicationFilters) {
  await requireAdmin();

  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 20;
  const skip = (page - 1) * pageSize;

  const where: Record<string, unknown> = {};

  if (filters?.status) {
    where.status = filters.status;
  }

  if (filters?.academicYear) {
    where.academicYear = filters.academicYear;
  }

  if (filters?.search) {
    const search = filters.search.trim();
    where.OR = [
      { referenceNumber: { contains: search, mode: "insensitive" } },
      {
        student: {
          OR: [
            { firstName: { contains: search, mode: "insensitive" } },
            { lastName: { contains: search, mode: "insensitive" } },
          ],
        },
      },
      {
        parent: {
          name: { contains: search, mode: "insensitive" },
        },
      },
    ];
  }

  const orderBy: Record<string, string> = {};
  if (filters?.sortBy) {
    orderBy[filters.sortBy] = filters.sortOrder ?? "desc";
  } else {
    orderBy.createdAt = "desc";
  }

  const [applications, total] = await Promise.all([
    db.application.findMany({
      where,
      include: {
        student: {
          select: {
            firstName: true,
            lastName: true,
            photoUrl: true,
          },
        },
        parent: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy,
      skip,
      take: pageSize,
    }),
    db.application.count({ where }),
  ]);

  return {
    applications,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

export async function getApplicationDetail(id: string) {
  await requireAdmin();

  const application = await db.application.findUnique({
    where: { id },
    include: {
      student: true,
      parent: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      recommendations: {
        orderBy: { sentAt: "desc" },
      },
      reviews: {
        include: {
          reviewer: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      notes: {
        include: {
          author: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      payments: {
        orderBy: { createdAt: "desc" },
      },
      scholarship: true,
      documents: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!application) {
    throw new Error("Application not found");
  }

  return application;
}

export async function addApplicationNote(
  applicationId: string,
  content: string
) {
  const user = await requireAdmin();

  if (!content.trim()) {
    throw new Error("Note content cannot be empty");
  }

  const application = await db.application.findUnique({
    where: { id: applicationId },
    select: { id: true },
  });

  if (!application) {
    throw new Error("Application not found");
  }

  const note = await db.applicationNote.create({
    data: {
      applicationId,
      authorId: user.id!,
      content: content.trim(),
      isInternal: true,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          role: true,
        },
      },
    },
  });

  revalidatePath(`/admin/applications/${applicationId}`);
  return note;
}

export async function updateApplicationStatus(
  applicationId: string,
  newStatus: ApplicationStatus
) {
  const user = await requireAdmin();

  const application = await db.application.findUnique({
    where: { id: applicationId },
    select: { id: true, status: true, referenceNumber: true },
  });

  if (!application) {
    throw new Error("Application not found");
  }

  const allowedTransitions = STATUS_TRANSITIONS[application.status];
  if (!allowedTransitions?.includes(newStatus)) {
    throw new Error(
      `Invalid status transition from ${application.status} to ${newStatus}`
    );
  }

  const [updatedApplication] = await db.$transaction([
    db.application.update({
      where: { id: applicationId },
      data: { status: newStatus },
    }),
    db.applicationNote.create({
      data: {
        applicationId,
        authorId: user.id!,
        content: `Status changed from ${application.status} to ${newStatus}`,
        isInternal: true,
      },
    }),
  ]);

  revalidatePath(`/admin/applications/${applicationId}`);
  revalidatePath("/admin/applications");
  revalidatePath("/admin/dashboard");
  return updatedApplication;
}

export async function getApplicationStats() {
  await requireAdmin();

  const settings = await db.systemSettings.findFirst();
  const academicYear = settings?.currentAcademicYear ?? "2026-2027";

  const counts = await db.application.groupBy({
    by: ["status"],
    where: { academicYear },
    _count: { status: true },
  });

  const statusMap: Record<string, number> = {};
  for (const item of counts) {
    statusMap[item.status] = item._count.status;
  }

  return { statusMap, academicYear };
}

export async function getDashboardStats() {
  await requireAdmin();

  const settings = await db.systemSettings.findFirst();
  const academicYear = settings?.currentAcademicYear ?? "2026-2027";

  const [total, pending, accepted, enrolled, recentApplications] =
    await Promise.all([
      db.application.count({ where: { academicYear } }),
      db.application.count({
        where: {
          academicYear,
          status: {
            in: ["SUBMITTED", "OFFICE_REVIEW", "PRINCIPAL_REVIEW"],
          },
        },
      }),
      db.application.count({
        where: {
          academicYear,
          status: "ACCEPTED",
        },
      }),
      db.application.count({
        where: {
          academicYear,
          status: "ENROLLED",
        },
      }),
      db.application.findMany({
        where: { academicYear },
        include: {
          student: {
            select: { firstName: true, lastName: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  return {
    total,
    pending,
    accepted,
    enrolled,
    academicYear,
    recentApplications,
  };
}

export async function getAcademicYears() {
  await requireAdmin();

  const years = await db.application.findMany({
    select: { academicYear: true },
    distinct: ["academicYear"],
    orderBy: { academicYear: "desc" },
  });

  return years.map((y) => y.academicYear);
}

export async function getValidTransitions(
  currentStatus: ApplicationStatus
): Promise<ApplicationStatus[]> {
  return STATUS_TRANSITIONS[currentStatus] ?? [];
}
