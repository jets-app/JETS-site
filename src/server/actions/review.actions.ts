"use server";

import { db } from "@/server/db";
import { auth } from "@/server/auth";
import { revalidatePath } from "next/cache";
import type { ApplicationStatus } from "@prisma/client";

function revalidateApplicationViews(applicationId: string) {
  revalidatePath(`/admin/applications/${applicationId}`);
  revalidatePath(`/review/${applicationId}`);
  revalidatePath("/admin/applications");
  revalidatePath("/admin/dashboard");
  revalidatePath("/review");
  revalidatePath("/portal/dashboard");
}

// ---------- Helpers ----------

async function requireReviewer() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized: Login required");
  }
  const role = session.user.role;
  if (
    role !== "PRINCIPAL" &&
    role !== "REVIEWER" &&
    role !== "ADMIN" &&
    role !== "SECRETARY"
  ) {
    throw new Error("Unauthorized: Reviewer access required");
  }
  return session.user;
}

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required");
  }
  return session.user;
}

async function requireAdminOrPrincipal() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized: Login required");
  }
  const role = session.user.role;
  if (role !== "ADMIN" && role !== "PRINCIPAL" && role !== "SECRETARY") {
    throw new Error("Unauthorized: Admin or Principal access required");
  }
  return session.user;
}

async function getApplicationOrThrow(
  applicationId: string,
  expectedStatuses?: ApplicationStatus[]
) {
  const application = await db.application.findUnique({
    where: { id: applicationId },
    select: {
      id: true,
      status: true,
      referenceNumber: true,
      interviewStatus: true,
    },
  });

  if (!application) {
    throw new Error("Application not found");
  }

  if (
    expectedStatuses &&
    !expectedStatuses.includes(application.status)
  ) {
    throw new Error(
      `Invalid action: application is in ${application.status} status. Expected: ${expectedStatuses.join(", ")}`
    );
  }

  return application;
}

// ---------- Office Actions ----------

export async function beginOfficeReview(applicationId: string) {
  const user = await requireAdmin();
  const application = await getApplicationOrThrow(applicationId, ["SUBMITTED"]);

  const [updated] = await db.$transaction([
    db.application.update({
      where: { id: applicationId },
      data: { status: "OFFICE_REVIEW" },
    }),
    db.applicationNote.create({
      data: {
        applicationId,
        authorId: user.id!,
        content: "Status changed from SUBMITTED to OFFICE_REVIEW",
        isInternal: true,
      },
    }),
  ]);

  revalidateApplicationViews(applicationId);
  return updated;
}

export async function forwardToPrincipals(
  applicationId: string,
  comments?: string
) {
  const user = await requireAdmin();
  const application = await getApplicationOrThrow(applicationId, [
    "OFFICE_REVIEW",
  ]);

  const [updated] = await db.$transaction([
    db.application.update({
      where: { id: applicationId },
      data: { status: "PRINCIPAL_REVIEW" },
    }),
    db.applicationReview.create({
      data: {
        applicationId,
        reviewerId: user.id!,
        department: "office",
        decision: "APPROVED",
        comments: comments?.trim() || "Forwarded to principals for review",
      },
    }),
    db.applicationNote.create({
      data: {
        applicationId,
        authorId: user.id!,
        content: `Status changed from OFFICE_REVIEW to PRINCIPAL_REVIEW${comments ? `. Office comments: ${comments}` : ""}`,
        isInternal: true,
      },
    }),
  ]);

  revalidateApplicationViews(applicationId);
  return updated;
}

export async function sendToDocuments(applicationId: string) {
  const user = await requireAdmin();
  const application = await getApplicationOrThrow(applicationId, ["ACCEPTED"]);

  const [updated] = await db.$transaction([
    db.application.update({
      where: { id: applicationId },
      data: { status: "DOCUMENTS_PENDING" },
    }),
    db.applicationNote.create({
      data: {
        applicationId,
        authorId: user.id!,
        content:
          "Status changed from ACCEPTED to DOCUMENTS_PENDING. Enrollment documents sent.",
        isInternal: true,
      },
    }),
  ]);

  revalidateApplicationViews(applicationId);
  return updated;
}

// ---------- Principal / Reviewer Actions ----------

export async function moveToInterview(
  applicationId: string,
  comments?: string
) {
  const user = await requireAdminOrPrincipal();
  const application = await getApplicationOrThrow(applicationId, [
    "PRINCIPAL_REVIEW",
  ]);

  const [updated] = await db.$transaction([
    db.application.update({
      where: { id: applicationId },
      data: {
        status: "INTERVIEW_SCHEDULED",
        interviewStatus: "SCHEDULED",
      },
    }),
    db.applicationReview.create({
      data: {
        applicationId,
        reviewerId: user.id!,
        department: "principal",
        decision: "APPROVED",
        comments:
          comments?.trim() || "Application approved. Moving to interview.",
      },
    }),
    db.applicationNote.create({
      data: {
        applicationId,
        authorId: user.id!,
        content: `Status changed from PRINCIPAL_REVIEW to INTERVIEW_SCHEDULED. Interview scheduled.${comments ? ` Comments: ${comments}` : ""}`,
        isInternal: true,
      },
    }),
  ]);

  // TODO: Send email to parent with Calendly link
  // The Calendly URL is shown in the UI for now

  revalidateApplicationViews(applicationId);
  return updated;
}

export async function markInterviewCompleted(
  applicationId: string,
  notes?: string
) {
  const user = await requireAdminOrPrincipal();
  const application = await getApplicationOrThrow(applicationId, [
    "INTERVIEW_SCHEDULED",
  ]);

  const [updated] = await db.$transaction([
    db.application.update({
      where: { id: applicationId },
      data: {
        status: "INTERVIEW_COMPLETED",
        interviewStatus: "COMPLETED",
        interviewNotes: notes?.trim() || null,
      },
    }),
    db.applicationNote.create({
      data: {
        applicationId,
        authorId: user.id!,
        content: `Status changed from INTERVIEW_SCHEDULED to INTERVIEW_COMPLETED.${notes ? ` Interview notes: ${notes}` : ""}`,
        isInternal: true,
      },
    }),
  ]);

  revalidateApplicationViews(applicationId);
  return updated;
}

export async function acceptStudent(
  applicationId: string,
  comments?: string
) {
  const user = await requireAdminOrPrincipal();
  const application = await getApplicationOrThrow(applicationId, [
    "INTERVIEW_COMPLETED",
  ]);

  const [updated] = await db.$transaction([
    db.application.update({
      where: { id: applicationId },
      data: { status: "ACCEPTED" },
    }),
    db.applicationReview.create({
      data: {
        applicationId,
        reviewerId: user.id!,
        department: "principal",
        decision: "APPROVED",
        comments: comments?.trim() || "Student accepted after interview.",
      },
    }),
    db.applicationNote.create({
      data: {
        applicationId,
        authorId: user.id!,
        content: `Status changed from INTERVIEW_COMPLETED to ACCEPTED.${comments ? ` Comments: ${comments}` : ""}`,
        isInternal: true,
      },
    }),
  ]);

  revalidateApplicationViews(applicationId);
  return updated;
}

export async function rejectStudent(
  applicationId: string,
  comments?: string
) {
  const user = await requireAdminOrPrincipal();

  // Can reject from any review stage
  const application = await getApplicationOrThrow(applicationId, [
    "PRINCIPAL_REVIEW",
    "INTERVIEW_SCHEDULED",
    "INTERVIEW_COMPLETED",
    "OFFICE_REVIEW",
  ]);

  const [updated] = await db.$transaction([
    db.application.update({
      where: { id: applicationId },
      data: { status: "REJECTED" },
    }),
    db.applicationReview.create({
      data: {
        applicationId,
        reviewerId: user.id!,
        department: user.role === "ADMIN" ? "office" : "principal",
        decision: "REJECTED",
        comments: comments?.trim() || "Application rejected.",
      },
    }),
    db.applicationNote.create({
      data: {
        applicationId,
        authorId: user.id!,
        content: `Status changed from ${application.status} to REJECTED.${comments ? ` Reason: ${comments}` : ""}`,
        isInternal: true,
      },
    }),
  ]);

  revalidateApplicationViews(applicationId);
  return updated;
}

export async function requestMoreInfo(
  applicationId: string,
  comments?: string
) {
  const user = await requireAdminOrPrincipal();

  const application = await getApplicationOrThrow(applicationId, [
    "PRINCIPAL_REVIEW",
    "INTERVIEW_SCHEDULED",
    "INTERVIEW_COMPLETED",
  ]);

  const [updated] = await db.$transaction([
    db.application.update({
      where: { id: applicationId },
      data: { status: "OFFICE_REVIEW" },
    }),
    db.applicationReview.create({
      data: {
        applicationId,
        reviewerId: user.id!,
        department: "principal",
        decision: "NEEDS_INFO",
        comments:
          comments?.trim() ||
          "More information requested. Sent back to office.",
      },
    }),
    db.applicationNote.create({
      data: {
        applicationId,
        authorId: user.id!,
        content: `Status changed from ${application.status} to OFFICE_REVIEW. More information requested.${comments ? ` Details: ${comments}` : ""}`,
        isInternal: true,
      },
    }),
  ]);

  revalidateApplicationViews(applicationId);
  return updated;
}

// ---------- Query Actions ----------

export async function getReviewsForApplication(applicationId: string) {
  await requireReviewer();

  const reviews = await db.applicationReview.findMany({
    where: { applicationId },
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
  });

  return reviews;
}

export async function getApplicationsForReview() {
  await requireReviewer();

  const applications = await db.application.findMany({
    where: {
      status: {
        in: [
          "PRINCIPAL_REVIEW",
          "INTERVIEW_SCHEDULED",
          "INTERVIEW_COMPLETED",
        ],
      },
    },
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
    orderBy: { updatedAt: "desc" },
  });

  return applications;
}

export async function getReviewTimeline(applicationId: string) {
  await requireReviewer();

  const [reviews, notes] = await Promise.all([
    db.applicationReview.findMany({
      where: { applicationId },
      include: {
        reviewer: {
          select: { id: true, name: true, role: true },
        },
      },
      orderBy: { createdAt: "asc" },
    }),
    db.applicationNote.findMany({
      where: {
        applicationId,
        content: { startsWith: "Status changed" },
      },
      include: {
        author: {
          select: { id: true, name: true, role: true },
        },
      },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  // Merge and sort chronologically
  const timeline = [
    ...reviews.map((r) => ({
      id: r.id,
      type: "review" as const,
      date: r.createdAt,
      userName: r.reviewer.name,
      userRole: r.reviewer.role,
      department: r.department,
      decision: r.decision,
      comments: r.comments,
    })),
    ...notes.map((n) => ({
      id: n.id,
      type: "status_change" as const,
      date: n.createdAt,
      userName: n.author.name,
      userRole: n.author.role,
      department: null,
      decision: null,
      comments: n.content,
    })),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return timeline;
}

export async function getReviewDashboardStats() {
  await requireReviewer();

  const settings = await db.systemSettings.findFirst();
  const academicYear = settings?.currentAcademicYear ?? "2026-2027";

  const [toReview, interviewsPending, acceptedThisYear] = await Promise.all([
    db.application.count({
      where: {
        academicYear,
        status: "PRINCIPAL_REVIEW",
      },
    }),
    db.application.count({
      where: {
        academicYear,
        status: {
          in: ["INTERVIEW_SCHEDULED", "INTERVIEW_COMPLETED"],
        },
      },
    }),
    db.application.count({
      where: {
        academicYear,
        status: "ACCEPTED",
      },
    }),
  ]);

  return { toReview, interviewsPending, acceptedThisYear, academicYear };
}

export async function getApplicationForReview(applicationId: string) {
  await requireReviewer();

  const application = await db.application.findUnique({
    where: { id: applicationId },
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
        where: { isInternal: true },
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
    },
  });

  if (!application) {
    throw new Error("Application not found");
  }

  // Only allow access to applications in reviewable statuses (or already decided)
  const reviewableStatuses: ApplicationStatus[] = [
    "PRINCIPAL_REVIEW",
    "INTERVIEW_SCHEDULED",
    "INTERVIEW_COMPLETED",
    "ACCEPTED",
    "REJECTED",
  ];

  if (!reviewableStatuses.includes(application.status)) {
    throw new Error(
      "This application is not currently available for review"
    );
  }

  return application;
}
