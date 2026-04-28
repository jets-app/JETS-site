"use server";

import { db } from "@/server/db";
import { auth } from "@/server/auth";
import { revalidatePath } from "next/cache";
import type { ApplicationStatus } from "@prisma/client";
import { isStaff } from "@/lib/roles";

// ---------- Helpers ----------

// Misnamed historically — actually allows any staff role (admin/principal/
// secretary/reviewer). Kept the name to avoid touching every call site.
async function requireAdmin() {
  const session = await auth();
  if (!session?.user || !isStaff(session.user.role)) {
    throw new Error("Unauthorized: Staff access required");
  }
  return session.user;
}

function generateReferenceNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `JETS-${year}-${random}`;
}

// ---------- Create Manual Application ----------

interface CreateManualApplicationData {
  // Student
  studentFirstName: string;
  studentLastName: string;
  studentDob: string;
  studentEmail?: string;
  studentPhone?: string;
  studentAddress?: string;
  // Parent
  parentName: string;
  parentEmail: string;
  parentPhone?: string;
  // Application
  academicYear: string;
  status: ApplicationStatus;
  applicationFeePaid: boolean;
  notes?: string;
}

export async function createManualApplication(data: CreateManualApplicationData) {
  const adminUser = await requireAdmin();

  // Find or create parent user
  let parent = await db.user.findUnique({
    where: { email: data.parentEmail },
  });

  if (!parent) {
    parent = await db.user.create({
      data: {
        email: data.parentEmail,
        name: data.parentName,
        role: "PARENT",
        phone: data.parentPhone ?? null,
        status: "ACTIVE",
      },
    });
  }

  // Generate unique reference number
  let referenceNumber = generateReferenceNumber();
  let exists = await db.application.findUnique({
    where: { referenceNumber },
    select: { id: true },
  });
  while (exists) {
    referenceNumber = generateReferenceNumber();
    exists = await db.application.findUnique({
      where: { referenceNumber },
      select: { id: true },
    });
  }

  // Create application and student in a transaction
  const application = await db.$transaction(async (tx) => {
    const app = await tx.application.create({
      data: {
        referenceNumber,
        status: data.status,
        academicYear: data.academicYear,
        parentId: parent!.id,
        applicationFeePaid: data.applicationFeePaid,
        currentStep: 1,
        completionPct: 0,
        submittedAt: data.status !== "DRAFT" ? new Date() : null,
      },
    });

    await tx.student.create({
      data: {
        applicationId: app.id,
        firstName: data.studentFirstName,
        lastName: data.studentLastName,
        dateOfBirth: new Date(data.studentDob),
        email: data.studentEmail || null,
        phone: data.studentPhone || null,
        addressLine1: data.studentAddress || null,
      },
    });

    // Add a note about manual creation
    await tx.applicationNote.create({
      data: {
        applicationId: app.id,
        authorId: adminUser.id!,
        content: `Application manually created by admin${data.notes ? `. Notes: ${data.notes}` : ""}`,
        isInternal: true,
      },
    });

    return app;
  });

  revalidatePath("/admin/applications");
  revalidatePath("/admin/dashboard");

  return { applicationId: application.id };
}

// ---------- Update Application Details ----------

interface UpdateApplicationDetailsData {
  applicationFeePaid?: boolean;
  applicationFeeAmount?: number;
  academicYear?: string;
  essay?: string;
  interviewNotes?: string;
}

export async function updateApplicationDetails(
  applicationId: string,
  data: UpdateApplicationDetailsData
) {
  await requireAdmin();

  const application = await db.application.findUnique({
    where: { id: applicationId },
    select: { id: true },
  });

  if (!application) {
    throw new Error("Application not found");
  }

  await db.application.update({
    where: { id: applicationId },
    data,
  });

  revalidatePath(`/admin/applications/${applicationId}`);
  return { success: true };
}

// ---------- Update Student Info ----------

interface UpdateStudentInfoData {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  preferredName?: string;
  dateOfBirth?: string;
  gender?: string;
  email?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export async function updateStudentInfo(
  studentId: string,
  data: UpdateStudentInfoData
) {
  await requireAdmin();

  const student = await db.student.findUnique({
    where: { id: studentId },
    select: { id: true, applicationId: true },
  });

  if (!student) {
    throw new Error("Student not found");
  }

  const updateData: Record<string, unknown> = { ...data };
  if (data.dateOfBirth) {
    updateData.dateOfBirth = new Date(data.dateOfBirth);
  }

  await db.student.update({
    where: { id: studentId },
    data: updateData,
  });

  revalidatePath(`/admin/applications/${student.applicationId}`);
  return { success: true };
}

// ---------- Update Parent Info ----------

interface UpdateParentInfoData {
  name?: string;
  email?: string;
  phone?: string;
}

export async function updateParentInfo(
  userId: string,
  data: UpdateParentInfoData
) {
  await requireAdmin();

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  await db.user.update({
    where: { id: userId },
    data,
  });

  revalidatePath("/admin/applications");
  return { success: true };
}
