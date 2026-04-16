"use server";

import { db } from "@/server/db";
import { auth } from "@/server/auth";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session.user;
}

export async function getEnrollmentFunnelReport(academicYear?: string) {
  await requireAdmin();

  const settings = await db.systemSettings.findFirst();
  const year = academicYear ?? settings?.currentAcademicYear ?? "2026-2027";

  const counts = await db.application.groupBy({
    by: ["status"],
    where: { academicYear: year },
    _count: { status: true },
  });

  const statusMap: Record<string, number> = {};
  for (const item of counts) {
    statusMap[item.status] = item._count.status;
  }

  const total = Object.values(statusMap).reduce((a, b) => a + b, 0);

  const funnel = [
    { stage: "Submitted", count: total - (statusMap.DRAFT ?? 0), pct: 100 },
    {
      stage: "Office Review",
      count:
        (statusMap.OFFICE_REVIEW ?? 0) +
        (statusMap.PRINCIPAL_REVIEW ?? 0) +
        (statusMap.INTERVIEW_SCHEDULED ?? 0) +
        (statusMap.INTERVIEW_COMPLETED ?? 0) +
        (statusMap.ACCEPTED ?? 0) +
        (statusMap.DOCUMENTS_PENDING ?? 0) +
        (statusMap.ENROLLED ?? 0),
      pct: 0,
    },
    {
      stage: "Interview",
      count:
        (statusMap.INTERVIEW_SCHEDULED ?? 0) +
        (statusMap.INTERVIEW_COMPLETED ?? 0) +
        (statusMap.ACCEPTED ?? 0) +
        (statusMap.DOCUMENTS_PENDING ?? 0) +
        (statusMap.ENROLLED ?? 0),
      pct: 0,
    },
    {
      stage: "Accepted",
      count:
        (statusMap.ACCEPTED ?? 0) +
        (statusMap.DOCUMENTS_PENDING ?? 0) +
        (statusMap.ENROLLED ?? 0),
      pct: 0,
    },
    { stage: "Enrolled", count: statusMap.ENROLLED ?? 0, pct: 0 },
  ];

  const submitted = funnel[0].count || 1;
  for (const step of funnel) {
    step.pct = Math.round((step.count / submitted) * 100);
  }

  return { funnel, statusMap, total, academicYear: year };
}

export async function getFinancialReport(academicYear?: string) {
  await requireAdmin();

  const settings = await db.systemSettings.findFirst();
  const year = academicYear ?? settings?.currentAcademicYear ?? "2026-2027";

  const [payments, invoices, appFeesPaid, appFeesTotal] = await Promise.all([
    db.payment.aggregate({
      where: { status: "SUCCEEDED" },
      _sum: { amount: true },
      _count: true,
    }),
    db.invoice.aggregate({
      _sum: { total: true, amountPaid: true },
      _count: true,
    }),
    db.payment.aggregate({
      where: { type: "APPLICATION_FEE", status: "SUCCEEDED" },
      _sum: { amount: true },
      _count: true,
    }),
    db.payment.aggregate({
      where: { type: "TUITION", status: "SUCCEEDED" },
      _sum: { amount: true },
      _count: true,
    }),
  ]);

  const totalCollected = (payments._sum.amount ?? 0) / 100;
  const totalInvoiced = (invoices._sum.total ?? 0) / 100;
  const totalPaid = (invoices._sum.amountPaid ?? 0) / 100;
  const outstanding = totalInvoiced - totalPaid;
  const appFees = (appFeesPaid._sum.amount ?? 0) / 100;
  const tuitionCollected = (appFeesTotal._sum.amount ?? 0) / 100;

  const invoicesByStatus = await db.invoice.groupBy({
    by: ["status"],
    _count: { status: true },
    _sum: { total: true },
  });

  const invoiceBreakdown = invoicesByStatus.map((s) => ({
    status: s.status,
    count: s._count.status,
    amount: (s._sum.total ?? 0) / 100,
  }));

  return {
    totalCollected,
    totalInvoiced,
    outstanding,
    appFees,
    tuitionCollected,
    paymentCount: payments._count,
    invoiceCount: invoices._count,
    invoiceBreakdown,
    academicYear: year,
  };
}

export async function getApplicationTimelineReport(academicYear?: string) {
  await requireAdmin();

  const settings = await db.systemSettings.findFirst();
  const year = academicYear ?? settings?.currentAcademicYear ?? "2026-2027";

  const apps = await db.application.findMany({
    where: { academicYear: year },
    select: {
      createdAt: true,
      status: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const monthly: Record<string, { total: number; submitted: number; accepted: number; enrolled: number }> = {};

  for (const app of apps) {
    const key = `${app.createdAt.getFullYear()}-${String(app.createdAt.getMonth() + 1).padStart(2, "0")}`;
    if (!monthly[key]) {
      monthly[key] = { total: 0, submitted: 0, accepted: 0, enrolled: 0 };
    }
    monthly[key].total++;
    if (app.status !== "DRAFT") monthly[key].submitted++;
    if (app.status === "ACCEPTED" || app.status === "DOCUMENTS_PENDING" || app.status === "ENROLLED") {
      monthly[key].accepted++;
    }
    if (app.status === "ENROLLED") monthly[key].enrolled++;
  }

  return {
    timeline: Object.entries(monthly).map(([month, data]) => ({
      month,
      ...data,
    })),
    academicYear: year,
  };
}

export async function getRecommendationReport() {
  await requireAdmin();

  const [total, completed, pending, expired] = await Promise.all([
    db.recommendation.count(),
    db.recommendation.count({ where: { status: "COMPLETED" } }),
    db.recommendation.count({ where: { status: { in: ["PENDING", "SENT", "VIEWED"] } } }),
    db.recommendation.count({ where: { status: "EXPIRED" } }),
  ]);

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { total, completed, pending, expired, completionRate };
}

export async function getDonorReport() {
  await requireAdmin();

  const [totalDonors, totalDonations, donationSum, recentDonations] = await Promise.all([
    db.donor.count(),
    db.donation.count(),
    db.donation.aggregate({ _sum: { amount: true } }),
    db.donation.findMany({
      include: { donor: { select: { firstName: true, lastName: true } } },
      orderBy: { donatedAt: "desc" },
      take: 10,
    }),
  ]);

  const totalRaised = (donationSum._sum.amount ?? 0) / 100;

  const byCampaign = await db.donation.groupBy({
    by: ["campaign"],
    _sum: { amount: true },
    _count: true,
  });

  return {
    totalDonors,
    totalDonations,
    totalRaised,
    recentDonations: recentDonations.map((d) => ({
      id: d.id,
      donor: `${d.donor.firstName} ${d.donor.lastName}`,
      amount: d.amount / 100,
      date: d.donatedAt.toISOString(),
      campaign: d.campaign,
    })),
    byCampaign: byCampaign.map((c) => ({
      campaign: c.campaign ?? "General",
      amount: (c._sum.amount ?? 0) / 100,
      count: c._count,
    })),
  };
}
