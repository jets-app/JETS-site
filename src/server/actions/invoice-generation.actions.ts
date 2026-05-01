"use server";

import { db } from "@/server/db";
import { auth } from "@/server/auth";
import { revalidatePath } from "next/cache";
import { chargeInvoice } from "./auto-pay.actions";

function isAdmin(role?: string | null) {
  return role === "ADMIN" || role === "PRINCIPAL";
}

async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;
  const last = await db.invoice.findFirst({
    where: { invoiceNumber: { startsWith: prefix } },
    orderBy: { invoiceNumber: "desc" },
    select: { invoiceNumber: true },
  });
  let next = 1;
  if (last) {
    const parts = last.invoiceNumber.split("-");
    const n = parseInt(parts[2], 10);
    if (!isNaN(n)) next = n + 1;
  }
  return `${prefix}${String(next).padStart(4, "0")}`;
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
}
function monthLabel(d: Date) {
  return d.toLocaleString("en-US", { month: "long", year: "numeric" });
}

// ==================== Generate Monthly Invoices ====================
// Creates a tuition invoice for each ENROLLED application for the upcoming
// month if one doesn't already exist. Auto-invoice generation runs 3 days
// before the end of the current month.
export async function generateMonthlyInvoices(targetMonth?: Date) {
  const session = await auth();
  if (!session?.user?.id || !isAdmin(session.user.role)) {
    return { error: "Admin access required." };
  }

  const baseDate = targetMonth ?? new Date();
  // Target = the month following baseDate
  const target = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 1);
  const monthStart = startOfMonth(target);
  const monthEnd = endOfMonth(target);
  const dueDate = new Date(target.getFullYear(), target.getMonth(), 1);

  const enrolled = await db.application.findMany({
    where: {
      status: "ENROLLED",
      // Skip students whose tuition plan was locked at contract signing — all
      // their invoices were generated upfront. The cron only fills in for
      // students still on the legacy "ad-hoc monthly" path (TuitionAssessment).
      tuitionPlanLockedAt: null,
    },
    include: {
      student: { select: { firstName: true, lastName: true } },
    },
  });

  // Pull tuition assessments separately (relation not declared on Application)
  const tuitionMap = new Map<string, number>();
  const assessments = await db.tuitionAssessment.findMany({
    where: { applicationId: { in: enrolled.map((a) => a.id) } },
  });
  for (const a of assessments) {
    const annual =
      a.adminAdjustedAmount ?? a.recommendedContribution ?? 1500000;
    tuitionMap.set(a.applicationId, Math.round(annual / 10));
  }

  let created = 0;
  let skipped = 0;

  for (const app of enrolled) {
    const monthly = tuitionMap.get(app.id) ?? 150000; // default $1,500/mo

    // Already have an invoice in this month for this app?
    const existing = await db.invoice.findFirst({
      where: {
        applicationId: app.id,
        dueDate: { gte: monthStart, lte: monthEnd },
      },
    });
    if (existing) {
      skipped++;
      continue;
    }

    const studentName = app.student
      ? `${app.student.firstName} ${app.student.lastName}`
      : "Student";

    await db.invoice.create({
      data: {
        invoiceNumber: await generateInvoiceNumber(),
        applicationId: app.id,
        parentId: app.parentId,
        lineItems: [
          {
            description: `Monthly tuition — ${monthLabel(target)} — ${studentName}`,
            quantity: 1,
            unitAmount: monthly,
            amount: monthly,
          },
        ],
        subtotal: monthly,
        tax: 0,
        total: monthly,
        amountPaid: 0,
        status: "sent",
        dueDate,
      },
    });
    created++;
  }

  revalidatePath("/admin/billing");
  revalidatePath("/portal/payments");
  return {
    success: true,
    created,
    skipped,
    monthLabel: monthLabel(target),
    message: `Generated ${created} invoices for ${monthLabel(target)} (${skipped} already existed).`,
  };
}

// ==================== Process Auto-Pay for Invoice ====================
export async function processAutoPayForInvoice(invoiceId: string) {
  const session = await auth();
  if (!session?.user?.id || !isAdmin(session.user.role)) {
    return { error: "Admin access required." };
  }

  const invoice = await db.invoice.findUnique({ where: { id: invoiceId } });
  if (!invoice) return { error: "Invoice not found." };
  if (invoice.status === "paid") return { error: "Already paid." };

  const settings = await db.autoPaySettings.findUnique({
    where: { userId: invoice.parentId },
  });
  if (!settings?.enabled) {
    return { error: "Auto-pay is not enabled for this parent." };
  }

  let methodId = settings.paymentMethodId;
  if (!methodId) {
    const def = await db.paymentMethod.findFirst({
      where: { userId: invoice.parentId, isDefault: true },
    });
    methodId = def?.id ?? null;
  }
  if (!methodId) {
    return { error: "No payment method on file for this parent." };
  }

  return chargeInvoice(invoiceId, methodId);
}

// ==================== Run End-of-Month Job ====================
// Manual trigger for admins. Generates invoices for the upcoming month and
// runs auto-pay across any due invoices for parents with auto-pay enabled.
export async function runEndOfMonthJob() {
  const session = await auth();
  if (!session?.user?.id || !isAdmin(session.user.role)) {
    return { error: "Admin access required." };
  }

  const genResult = await generateMonthlyInvoices();
  if ("error" in genResult) return genResult;

  // Process auto-pay for any unpaid invoices due within the next 7 days
  const now = new Date();
  const window = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7);
  const dueSoon = await db.invoice.findMany({
    where: {
      status: { in: ["draft", "sent", "overdue"] },
      dueDate: { lte: window },
    },
  });

  let charged = 0;
  let failed = 0;
  for (const inv of dueSoon) {
    const settings = await db.autoPaySettings.findUnique({
      where: { userId: inv.parentId },
    });
    if (!settings?.enabled) continue;
    const result = await processAutoPayForInvoice(inv.id);
    if ("success" in result && result.success) charged++;
    else failed++;
  }

  revalidatePath("/admin/billing");
  return {
    success: true,
    invoicesCreated: genResult.created,
    autoCharged: charged,
    autoFailed: failed,
    message: `Created ${genResult.created} invoices and auto-charged ${charged} (${failed} failed/skipped).`,
  };
}

// ==================== Send Reminders (mock) ====================
export async function sendOverdueReminders() {
  const session = await auth();
  if (!session?.user?.id || !isAdmin(session.user.role)) {
    return { error: "Admin access required." };
  }
  const overdue = await db.invoice.findMany({
    where: { status: { not: "paid" }, dueDate: { lt: new Date() } },
  });
  // Mock: just return count. Real impl would email parents.
  return {
    success: true,
    count: overdue.length,
    message: `Reminder emails queued for ${overdue.length} overdue invoices.`,
  };
}
