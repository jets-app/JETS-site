"use server";

import { db } from "@/server/db";
import { auth } from "@/server/auth";
import { revalidatePath } from "next/cache";
import type { ApplicationStatus, ApplicationType } from "@prisma/client";
import { triggerStatusNotifications } from "@/server/notifications";
import { recordAudit } from "@/server/security/audit-log";
import { isStaff, isFounder } from "@/lib/roles";

// ---------- Helpers ----------

/**
 * For sensitive ops only: archive, unarchive, delete, billing, system settings.
 * Most reads + normal status changes use requireStaff() instead so principals
 * and secretaries can do their day-to-day work.
 *
 * Recognizes founders by email even if the JWT role is stale — prevents
 * lock-out when the cookie was minted before a role/founder change.
 */
async function requireAdmin() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized: Admin access required");
  }
  if (session.user.role === "ADMIN" || isFounder(session.user.email ?? null)) {
    return session.user;
  }
  throw new Error("Unauthorized: Admin access required");
}

/** Any staff role (admin/principal/secretary/reviewer). */
async function requireStaff() {
  const session = await auth();
  if (!session?.user || !isStaff(session.user.role)) {
    throw new Error("Unauthorized: Staff access required");
  }
  return session.user;
}

// Valid status transitions for NEW applications (full pipeline)
const STATUS_TRANSITIONS_NEW: Record<ApplicationStatus, ApplicationStatus[]> = {
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

// Simplified transitions for REAPPLICATION: Submitted → Principal Review → Enrollment Docs → Enrolled
const STATUS_TRANSITIONS_REAPPLY: Record<ApplicationStatus, ApplicationStatus[]> = {
  DRAFT: ["SUBMITTED", "WITHDRAWN"],
  SUBMITTED: ["PRINCIPAL_REVIEW", "WITHDRAWN"],
  OFFICE_REVIEW: ["PRINCIPAL_REVIEW", "REJECTED", "WITHDRAWN"],
  PRINCIPAL_REVIEW: ["DOCUMENTS_PENDING", "REJECTED", "WITHDRAWN"],
  INTERVIEW_SCHEDULED: ["DOCUMENTS_PENDING", "REJECTED", "WITHDRAWN"],
  INTERVIEW_COMPLETED: ["DOCUMENTS_PENDING", "REJECTED", "WITHDRAWN"],
  ACCEPTED: ["DOCUMENTS_PENDING", "ENROLLED", "WITHDRAWN"],
  DOCUMENTS_PENDING: ["ENROLLED", "WITHDRAWN"],
  SCHOLARSHIP_REVIEW: ["ACCEPTED", "WITHDRAWN"],
  ENROLLED: ["WITHDRAWN"],
  REJECTED: ["PRINCIPAL_REVIEW"],
  WAITLISTED: ["ACCEPTED", "REJECTED", "WITHDRAWN"],
  WITHDRAWN: ["SUBMITTED"],
};

function getTransitionsFor(
  type: ApplicationType,
  status: ApplicationStatus,
): ApplicationStatus[] {
  const map = type === "REAPPLICATION" ? STATUS_TRANSITIONS_REAPPLY : STATUS_TRANSITIONS_NEW;
  return map[status] ?? [];
}

// Kept for any legacy callers: defaults to NEW-app transitions
const STATUS_TRANSITIONS = STATUS_TRANSITIONS_NEW;

// ---------- Actions ----------

export interface ApplicationFilters {
  search?: string;
  status?: ApplicationStatus;
  academicYear?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  includeArchived?: boolean;
}

export async function getAllApplications(filters?: ApplicationFilters) {
  await requireStaff();

  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 20;
  const skip = (page - 1) * pageSize;

  const where: Record<string, unknown> = {};

  if (!filters?.includeArchived) {
    where.archivedAt = null;
  }

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
  await requireStaff();

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
  const user = await requireStaff();

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
  const user = await requireStaff();

  const application = await db.application.findUnique({
    where: { id: applicationId },
    select: { id: true, status: true, referenceNumber: true, type: true },
  });

  if (!application) {
    throw new Error("Application not found");
  }

  // ADMINs can override the normal pipeline (skip steps, jump backwards) for
  // edge cases. Non-admins (e.g. PRINCIPAL) are still bound by the transition
  // map so they can't accidentally enroll someone who hasn't been accepted.
  const allowedTransitions = getTransitionsFor(application.type, application.status);
  const isAdmin = user.role === "ADMIN";
  if (!isAdmin && !allowedTransitions.includes(newStatus)) {
    throw new Error(
      `Invalid status transition from ${application.status} to ${newStatus}`
    );
  }
  const isOverride = isAdmin && !allowedTransitions.includes(newStatus);

  const [updatedApplication] = await db.$transaction([
    db.application.update({
      where: { id: applicationId },
      data: { status: newStatus },
    }),
    db.applicationNote.create({
      data: {
        applicationId,
        authorId: user.id!,
        content: isOverride
          ? `Status changed from ${application.status} to ${newStatus} (admin override — skipped normal flow)`
          : `Status changed from ${application.status} to ${newStatus}`,
        isInternal: true,
      },
    }),
  ]);

  recordAudit({
    actorId: user.id!,
    action: "application.status.changed",
    entityType: "Application",
    entityId: applicationId,
    before: { status: application.status },
    after: { status: newStatus },
  }).catch(console.error);

  revalidatePath(`/admin/applications/${applicationId}`);
  revalidatePath("/admin/applications");
  revalidatePath("/admin/dashboard");

  triggerStatusNotifications(applicationId, newStatus).catch(console.error);

  return updatedApplication;
}

export async function getApplicationStats() {
  await requireStaff();

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
  await requireStaff();

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
  await requireStaff();

  const years = await db.application.findMany({
    select: { academicYear: true },
    distinct: ["academicYear"],
    orderBy: { academicYear: "desc" },
  });

  return years.map((y) => y.academicYear);
}

export async function getValidTransitions(
  currentStatus: ApplicationStatus,
  type: ApplicationType = "NEW",
): Promise<ApplicationStatus[]> {
  return getTransitionsFor(type, currentStatus);
}

export async function archiveApplication(applicationId: string) {
  const user = await requireAdmin();
  await db.application.update({
    where: { id: applicationId },
    data: { archivedAt: new Date() },
  });
  recordAudit({
    actorId: user.id!,
    action: "application.archived",
    entityType: "Application",
    entityId: applicationId,
  }).catch(console.error);
  revalidatePath("/admin/applications");
  revalidatePath("/admin/applications/pipeline");
  return { success: true };
}

export async function unarchiveApplication(applicationId: string) {
  const user = await requireAdmin();
  await db.application.update({
    where: { id: applicationId },
    data: { archivedAt: null },
  });
  recordAudit({
    actorId: user.id!,
    action: "application.unarchived",
    entityType: "Application",
    entityId: applicationId,
  }).catch(console.error);
  revalidatePath("/admin/applications");
  return { success: true };
}

export async function deleteApplication(applicationId: string) {
  const user = await requireAdmin();
  // Capture a snapshot before destruction so the audit row is meaningful
  const snapshot = await db.application.findUnique({
    where: { id: applicationId },
    select: { id: true, referenceNumber: true, status: true, parentId: true },
  });
  await db.application.delete({ where: { id: applicationId } });
  recordAudit({
    actorId: user.id!,
    action: "application.deleted",
    entityType: "Application",
    entityId: applicationId,
    before: snapshot,
  }).catch(console.error);
  revalidatePath("/admin/applications");
  revalidatePath("/admin/applications/pipeline");
  return { success: true };
}

export async function getApplicationsByStatus(academicYear?: string) {
  await requireStaff();

  const settings = await db.systemSettings.findFirst();
  const year = academicYear ?? settings?.currentAcademicYear ?? "2026-2027";

  const applications = await db.application.findMany({
    where: { academicYear: year },
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
      recommendations: {
        select: { status: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const grouped: Record<string, typeof applications> = {};
  for (const app of applications) {
    if (!grouped[app.status]) grouped[app.status] = [];
    grouped[app.status].push(app);
  }

  return { grouped, academicYear: year };
}

export async function moveApplicationStatus(
  applicationId: string,
  newStatus: ApplicationStatus
) {
  const user = await requireStaff();

  const application = await db.application.findUnique({
    where: { id: applicationId },
    select: { id: true, status: true, type: true },
  });

  if (!application) {
    throw new Error("Application not found");
  }

  const allowedTransitions = getTransitionsFor(application.type, application.status);
  if (!allowedTransitions.includes(newStatus)) {
    return {
      success: false,
      error: `Cannot move from ${application.status} to ${newStatus}`,
    };
  }

  await db.$transaction([
    db.application.update({
      where: { id: applicationId },
      data: { status: newStatus },
    }),
    db.applicationNote.create({
      data: {
        applicationId,
        authorId: user.id!,
        content: `Status changed from ${application.status} to ${newStatus} (via pipeline board)`,
        isInternal: true,
      },
    }),
  ]);

  revalidatePath("/admin/applications");
  revalidatePath("/admin/applications/pipeline");

  triggerStatusNotifications(applicationId, newStatus).catch(console.error);

  return { success: true };
}
