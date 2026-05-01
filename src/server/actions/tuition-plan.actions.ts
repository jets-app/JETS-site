"use server";

import { db } from "@/server/db";
import { auth } from "@/server/auth";
import { revalidatePath } from "next/cache";
import {
  computeTuitionSchedule,
  netTuition,
  type PaymentPlan,
} from "@/lib/tuition-plan";
import { isStaff } from "@/lib/roles";

async function requireStaff() {
  const session = await auth();
  if (!session?.user || !isStaff(session.user.role)) {
    return { error: "Staff access required." as const };
  }
  return { session };
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

// ==================== Admin: set tuition pricing ====================

export interface TuitionPricingInput {
  applicationId: string;
  totalCents?: number;
  scholarshipCents?: number;
  /** null = clear override (revert to 10% of net). */
  depositCents?: number | null;
  /** null = clear override (revert to 9). */
  installmentCount?: number | null;
}

/**
 * Admin sets per-student tuition. If the contract has already been signed
 * (tuitionPlanLockedAt is set), this also voids unpaid invoices and clears
 * the lock — the parent must re-sign the contract.
 */
export async function setStudentTuition(input: TuitionPricingInput) {
  const check = await requireStaff();
  if ("error" in check) return { error: check.error };

  const app = await db.application.findUnique({
    where: { id: input.applicationId },
  });
  if (!app) return { error: "Application not found." };

  const data: Record<string, unknown> = {};
  if (input.totalCents !== undefined)
    data.tuitionTotalCents = Math.max(0, Math.round(input.totalCents));
  if (input.scholarshipCents !== undefined)
    data.tuitionScholarshipCents = Math.max(0, Math.round(input.scholarshipCents));
  if (input.depositCents !== undefined)
    data.tuitionDepositCents =
      input.depositCents === null
        ? null
        : Math.max(0, Math.round(input.depositCents));
  if (input.installmentCount !== undefined)
    data.tuitionInstallmentCount =
      input.installmentCount === null
        ? null
        : Math.max(1, Math.round(input.installmentCount));

  // If the plan is locked and the underlying numbers changed, void any
  // unpaid invoices and force a re-sign.
  const wasLocked = !!app.tuitionPlanLockedAt;
  const numbersChanged =
    data.tuitionTotalCents !== undefined ||
    data.tuitionScholarshipCents !== undefined ||
    data.tuitionDepositCents !== undefined ||
    data.tuitionInstallmentCount !== undefined;

  let revoked = 0;

  if (wasLocked && numbersChanged) {
    // Void any unpaid + non-deposit-paid tuition invoices for this app.
    const toVoid = await db.invoice.findMany({
      where: {
        applicationId: input.applicationId,
        status: { in: ["draft", "sent", "partially_paid"] },
      },
      select: { id: true },
    });
    if (toVoid.length > 0) {
      await db.invoice.updateMany({
        where: { id: { in: toVoid.map((i) => i.id) } },
        data: { status: "void" },
      });
      revoked = toVoid.length;
    }
    data.tuitionPaymentPlan = null;
    data.tuitionPlanLockedAt = null;
  }

  await db.application.update({
    where: { id: app.id },
    data,
  });

  revalidatePath(`/admin/applications/${app.id}`);
  revalidatePath("/admin/billing");
  revalidatePath("/portal/payments");

  return {
    success: true,
    requiresResign: wasLocked && numbersChanged,
    invoicesVoided: revoked,
  };
}

// ==================== Lock plan + generate invoices ====================

/**
 * Called from the contract-signing flow. Sets the plan, generates all
 * invoices upfront, and stamps tuitionPlanLockedAt so the cron skips this
 * student for the year.
 *
 * Returns the deposit invoice id so the signer can be redirected to pay.
 */
export async function lockTuitionPlan(input: {
  applicationId: string;
  plan: PaymentPlan;
  signedAt?: Date;
}) {
  const app = await db.application.findUnique({
    where: { id: input.applicationId },
  });
  if (!app) return { error: "Application not found." };
  if (app.tuitionPlanLockedAt) {
    return { error: "Plan already locked. Admin must adjust tuition first." };
  }

  const signedAt = input.signedAt ?? new Date();
  const net = netTuition({
    totalCents: app.tuitionTotalCents,
    scholarshipCents: app.tuitionScholarshipCents,
  });
  if (net <= 0) {
    // Nothing to bill — just mark locked so we don't keep prompting.
    await db.application.update({
      where: { id: app.id },
      data: { tuitionPaymentPlan: input.plan, tuitionPlanLockedAt: signedAt },
    });
    return { success: true, depositInvoiceId: null };
  }

  const schedule = computeTuitionSchedule(
    input.plan,
    {
      totalCents: app.tuitionTotalCents,
      scholarshipCents: app.tuitionScholarshipCents,
      depositCents: app.tuitionDepositCents,
      installmentCount: app.tuitionInstallmentCount,
    },
    signedAt,
  );

  if (schedule.length === 0) {
    return { error: "Schedule produced no invoices — check tuition values." };
  }

  // Create all invoices in a transaction. Each is its own row with one line
  // item; status is "sent" so the cron and reminders pick them up correctly.
  const created = await db.$transaction(async (tx) => {
    const ids: string[] = [];
    for (const line of schedule) {
      const invoiceNumber = await generateInvoiceNumber();
      const inv = await tx.invoice.create({
        data: {
          invoiceNumber,
          applicationId: app.id,
          parentId: app.parentId,
          lineItems: [
            {
              description: line.description,
              quantity: 1,
              unitAmount: line.amount,
              amount: line.amount,
              category: line.category,
            },
          ],
          subtotal: line.amount,
          tax: 0,
          total: line.amount,
          amountPaid: 0,
          status: "sent",
          dueDate: line.dueDate,
        },
      });
      ids.push(inv.id);
    }
    await tx.application.update({
      where: { id: app.id },
      data: {
        tuitionPaymentPlan: input.plan,
        tuitionPlanLockedAt: signedAt,
      },
    });
    return ids;
  });

  revalidatePath("/admin/billing");
  revalidatePath("/portal/payments");

  return { success: true, depositInvoiceId: created[0] ?? null };
}
