"use server";

import { db } from "@/server/db";
import { auth } from "@/server/auth";
import { isStaff } from "@/lib/roles";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || !isStaff(session.user.role)) {
    throw new Error("Unauthorized: Staff access required");
  }
  return session.user;
}

export interface EnrolledFilters {
  search?: string;
  academicYear?: string;
}

export async function getEnrolledStudents(filters?: EnrolledFilters) {
  await requireAdmin();

  const settings = await db.systemSettings.findFirst();
  const academicYear =
    filters?.academicYear ?? settings?.currentAcademicYear ?? "2026-2027";

  const where: Record<string, unknown> = {
    status: "ENROLLED",
    academicYear,
  };

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
      { parent: { name: { contains: search, mode: "insensitive" } } },
    ];
  }

  const applications = await db.application.findMany({
    where,
    include: {
      student: true,
      parent: {
        select: { id: true, name: true, email: true, phone: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  // Attach tuition/balance/next due info via invoices
  const appIds = applications.map((a) => a.id);
  const invoices = await db.invoice.findMany({
    where: { applicationId: { in: appIds } },
    select: {
      id: true,
      applicationId: true,
      total: true,
      amountPaid: true,
      status: true,
      dueDate: true,
    },
  });

  const invoicesByApp = new Map<string, typeof invoices>();
  for (const inv of invoices) {
    if (!inv.applicationId) continue;
    if (!invoicesByApp.has(inv.applicationId))
      invoicesByApp.set(inv.applicationId, []);
    invoicesByApp.get(inv.applicationId)!.push(inv);
  }

  const enriched = applications.map((app) => {
    const apps = invoicesByApp.get(app.id) ?? [];
    const totalBilled = apps.reduce((s, i) => s + i.total, 0);
    const totalPaid = apps.reduce((s, i) => s + i.amountPaid, 0);
    const balance = totalBilled - totalPaid;
    const now = new Date();
    const upcoming = apps
      .filter((i) => i.status !== "paid" && i.dueDate >= now)
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())[0];
    const overdue = apps.some(
      (i) => i.status !== "paid" && i.dueDate < now
    );
    return {
      ...app,
      tuition: {
        totalBilled,
        totalPaid,
        balance,
        nextDueDate: upcoming?.dueDate ?? null,
        nextDueAmount: upcoming
          ? upcoming.total - upcoming.amountPaid
          : null,
        overdue,
        status: overdue
          ? "overdue"
          : balance === 0 && totalBilled > 0
          ? "paid"
          : "current",
      },
    };
  });

  return enriched;
}

export async function getSchoolYearStats() {
  await requireAdmin();

  const settings = await db.systemSettings.findFirst();
  const academicYear = settings?.currentAcademicYear ?? "2026-2027";

  const enrolled = await db.application.findMany({
    where: { status: "ENROLLED", academicYear },
    select: { id: true, parentId: true },
  });
  const enrolledCount = enrolled.length;
  const appIds = enrolled.map((e) => e.id);

  const [invoices, payments] = await Promise.all([
    db.invoice.findMany({
      where: { applicationId: { in: appIds } },
      select: {
        id: true,
        total: true,
        amountPaid: true,
        status: true,
        dueDate: true,
      },
    }),
    db.payment.findMany({
      where: {
        applicationId: { in: appIds },
        status: "SUCCEEDED",
        type: "TUITION",
      },
      orderBy: { paidAt: "desc" },
      take: 10,
      include: {
        application: {
          include: {
            student: { select: { firstName: true, lastName: true } },
          },
        },
      },
    }),
  ]);

  const now = new Date();
  const totalBilled = invoices.reduce((s, i) => s + i.total, 0);
  const totalPaid = invoices.reduce((s, i) => s + i.amountPaid, 0);
  const outstanding = totalBilled - totalPaid;
  const overdueCount = invoices.filter(
    (i) => i.status !== "paid" && i.dueDate < now
  ).length;

  const upcoming = invoices
    .filter((i) => i.status !== "paid" && i.dueDate >= now)
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
    .slice(0, 5);

  const tuitionCollected = payments.reduce((s, p) => s + p.amount, 0);

  return {
    academicYear,
    enrolledCount,
    tuitionCollected: totalPaid,
    outstanding,
    overdueCount,
    upcoming,
    recentPayments: payments,
  };
}

export async function getStudentDetail(applicationId: string) {
  await requireAdmin();

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
      scholarship: true,
      payments: { orderBy: { createdAt: "desc" } },
      documents: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!application) throw new Error("Student not found");

  const invoices = await db.invoice.findMany({
    where: { applicationId },
    orderBy: { createdAt: "desc" },
  });

  const totalBilled = invoices.reduce((s, i) => s + i.total, 0);
  const totalPaid = invoices.reduce((s, i) => s + i.amountPaid, 0);

  return {
    application,
    invoices,
    tuition: {
      totalBilled,
      totalPaid,
      balance: totalBilled - totalPaid,
      scholarshipAmount: application.scholarship?.approvedAmount ?? 0,
    },
  };
}

export async function getFamilies() {
  await requireAdmin();

  const settings = await db.systemSettings.findFirst();
  const academicYear = settings?.currentAcademicYear ?? "2026-2027";

  const enrolled = await db.application.findMany({
    where: { status: "ENROLLED", academicYear },
    include: {
      student: {
        select: { firstName: true, lastName: true, photoUrl: true },
      },
      parent: {
        select: { id: true, name: true, email: true, phone: true },
      },
    },
  });

  // Group by parent
  const familyMap = new Map<
    string,
    {
      parent: (typeof enrolled)[number]["parent"];
      students: (typeof enrolled)[number][];
    }
  >();

  for (const app of enrolled) {
    const key = app.parent.id;
    if (!familyMap.has(key)) {
      familyMap.set(key, { parent: app.parent, students: [] });
    }
    familyMap.get(key)!.students.push(app);
  }

  const familyIds = Array.from(familyMap.keys());
  const invoices = await db.invoice.findMany({
    where: { parentId: { in: familyIds } },
    select: { parentId: true, total: true, amountPaid: true },
  });

  const balanceByParent = new Map<string, { billed: number; paid: number }>();
  for (const inv of invoices) {
    const b = balanceByParent.get(inv.parentId) ?? { billed: 0, paid: 0 };
    b.billed += inv.total;
    b.paid += inv.amountPaid;
    balanceByParent.set(inv.parentId, b);
  }

  return Array.from(familyMap.values()).map((f) => {
    const b = balanceByParent.get(f.parent.id) ?? { billed: 0, paid: 0 };
    return {
      parent: f.parent,
      students: f.students,
      totalBilled: b.billed,
      totalPaid: b.paid,
      balance: b.billed - b.paid,
    };
  });
}

export async function getStudentRecords() {
  await requireAdmin();

  const settings = await db.systemSettings.findFirst();
  const academicYear = settings?.currentAcademicYear ?? "2026-2027";

  const enrolled = await db.application.findMany({
    where: { status: "ENROLLED", academicYear },
    include: {
      student: true,
      parent: { select: { name: true, email: true, phone: true } },
      documents: {
        where: {
          status: { in: ["COMPLETED", "PARTIALLY_SIGNED"] },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return enrolled.map((app) => {
    const medicalDoc = app.documents.find((d) =>
      d.title.toLowerCase().includes("medical")
    );
    const handbookDoc = app.documents.find((d) =>
      d.title.toLowerCase().includes("handbook")
    );
    const emergency = app.emergencyContact as
      | Record<string, unknown>
      | null
      | undefined;
    return {
      application: app,
      student: app.student,
      parent: app.parent,
      documentsCount: app.documents.length,
      hasMedicalForm: !!medicalDoc,
      hasHandbook: !!handbookDoc,
      hasEmergencyContact: !!emergency && Object.keys(emergency).length > 0,
      medicalDoc,
      handbookDoc,
    };
  });
}
