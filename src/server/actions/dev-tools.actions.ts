"use server";

import { db } from "@/server/db";
import { auth } from "@/server/auth";
import { isFullAdmin } from "@/lib/roles";
import bcrypt from "bcryptjs";

async function requireFounder() {
  const session = await auth();
  if (!session?.user || !isFullAdmin(session.user.role)) {
    return { error: "Admin access required." as const };
  }
  return { session };
}

/**
 * Creates a fully-formed test parent + student at INTERVIEW_COMPLETED status,
 * ready for the office to send acceptance email + enrollment docs. Founder-
 * only. Returns the parent's login credentials.
 */
export async function createTestStudent(input: {
  baseEmail: string;
  studentFirstName?: string;
  studentLastName?: string;
}) {
  const check = await requireFounder();
  if ("error" in check) return { error: check.error };

  const baseEmail = input.baseEmail.trim().toLowerCase();
  const [local, domain] = baseEmail.split("@");
  if (!local || !domain) return { error: "Invalid email." };

  // Find a free + alias slot
  let alias = `${local}+jetstest1@${domain}`;
  for (let i = 1; i < 50; i++) {
    alias = `${local}+jetstest${i}@${domain}`;
    const existing = await db.user.findUnique({ where: { email: alias } });
    if (!existing) break;
  }

  const password = `TestParent${Math.floor(Math.random() * 9000) + 1000}!`;
  const passwordHash = await bcrypt.hash(password, 10);

  const parentName = "Test Parent";
  const parent = await db.user.create({
    data: {
      email: alias,
      name: parentName,
      passwordHash,
      role: "PARENT",
      status: "ACTIVE",
      emailVerified: new Date(),
      phone: "+15555550100",
    },
  });

  // Generate a reference number that won't collide.
  const year = new Date().getFullYear();
  const prefix = `JETS-${year}-`;
  const last = await db.application.findFirst({
    where: { referenceNumber: { startsWith: prefix } },
    orderBy: { referenceNumber: "desc" },
    select: { referenceNumber: true },
  });
  let nextNum = 1;
  if (last) {
    const tail = last.referenceNumber.slice(prefix.length);
    const n = parseInt(tail, 10);
    if (!isNaN(n)) nextNum = n + 1;
  }
  const referenceNumber = `${prefix}${String(nextNum).padStart(4, "0")}`;

  const settings = await db.systemSettings.findUnique({
    where: { id: "settings" },
    select: { currentAcademicYear: true },
  });
  const academicYear = settings?.currentAcademicYear ?? "2026-2027";

  const studentFirst = input.studentFirstName?.trim() || "Test";
  const studentLast = input.studentLastName?.trim() || "Student";

  const application = await db.application.create({
    data: {
      referenceNumber,
      status: "INTERVIEW_COMPLETED",
      academicYear,
      parentId: parent.id,
      applicationFeePaid: true,
      applicationFeeAmount: 50000,
      currentStep: 10,
      completionPct: 100,
      submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
      interviewStatus: "COMPLETED",
      interviewDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      interviewEndsAt: new Date(
        Date.now() - 1000 * 60 * 60 * 24 * 2 + 1000 * 60 * 30,
      ),
      interviewNotes:
        "Test student created by dev tools. Strong candidate — ready for office decision.",
      fatherInfo: { firstName: "Test", lastName: "Father", phone: "+15555550101" },
      motherInfo: { firstName: "Test", lastName: "Mother", phone: "+15555550102" },
      essay: "Sample essay text for testing.",
    },
  });

  await db.student.create({
    data: {
      applicationId: application.id,
      firstName: studentFirst,
      lastName: studentLast,
      dateOfBirth: new Date("2009-06-15"),
    },
  });

  return {
    success: true,
    application: {
      id: application.id,
      referenceNumber,
      academicYear,
      studentName: `${studentFirst} ${studentLast}`,
    },
    parent: {
      email: alias,
      password,
      name: parentName,
    },
  };
}
