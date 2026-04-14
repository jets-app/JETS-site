"use server";

import { db } from "@/server/db";
import { auth } from "@/server/auth";
import { revalidatePath } from "next/cache";

// ==================== Types ====================
export interface TuitionSummary {
  totalTuition: number;
  scholarship: number;
  netTuition: number;
  paid: number;
  balance: number;
  monthlyAmount: number | null;
  installmentCount: number;
}

// ==================== Auth helper ====================
async function verifyOwnershipOrAdmin(applicationId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "You must be logged in." as const };

  const application = await db.application.findUnique({
    where: { id: applicationId },
    select: { id: true, parentId: true },
  });
  if (!application) return { error: "Application not found." as const };

  const isAdmin =
    session.user.role === "ADMIN" || session.user.role === "PRINCIPAL";
  if (application.parentId !== session.user.id && !isAdmin) {
    return { error: "Access denied." as const };
  }

  return { session, application };
}

// ==================== Get Tuition Summary ====================
export async function getTuitionSummary(applicationId: string) {
  const check = await verifyOwnershipOrAdmin(applicationId);
  if ("error" in check) return { error: check.error };

  try {
    const [assessment, scholarship, invoices] = await Promise.all([
      db.tuitionAssessment.findUnique({ where: { applicationId } }),
      db.scholarshipApplication.findUnique({ where: { applicationId } }),
      db.invoice.findMany({
        where: { applicationId },
        orderBy: { dueDate: "asc" },
      }),
    ]);

    const totalInvoiced = invoices.reduce((s, i) => s + i.total, 0);
    const totalTuition =
      assessment?.adminAdjustedAmount ??
      assessment?.recommendedContribution ??
      totalInvoiced;

    const scholarshipAmount =
      scholarship?.status === "APPROVED"
        ? scholarship.approvedAmount ?? 0
        : 0;

    const netTuition = Math.max(0, totalTuition - scholarshipAmount);
    const paid = invoices.reduce((s, i) => s + i.amountPaid, 0);
    // Balance reflects what's actually due (invoiced) minus what's been paid
    const balance = Math.max(0, totalInvoiced - paid);

    const monthlyAmount =
      invoices.length > 0 ? Math.round(totalInvoiced / invoices.length) : null;

    const summary: TuitionSummary = {
      totalTuition,
      scholarship: scholarshipAmount,
      netTuition,
      paid,
      balance,
      monthlyAmount,
      installmentCount: invoices.length,
    };

    return { summary };
  } catch (error) {
    console.error("Error loading tuition summary:", error);
    return { error: "Failed to load tuition summary." };
  }
}

// ==================== Get Monthly Invoices ====================
export async function getMonthlyInvoices(applicationId: string) {
  const check = await verifyOwnershipOrAdmin(applicationId);
  if ("error" in check) return { error: check.error };

  try {
    const invoices = await db.invoice.findMany({
      where: { applicationId },
      orderBy: { dueDate: "asc" },
    });

    const now = new Date();
    const enriched = invoices.map((inv) => ({
      ...inv,
      displayStatus:
        inv.status !== "paid" && inv.dueDate < now ? "overdue" : inv.status,
    }));

    return { invoices: enriched };
  } catch (error) {
    console.error("Error loading invoices:", error);
    return { error: "Failed to load invoices." };
  }
}

// ==================== Pay Invoice (Mock) ====================
export async function payInvoice(
  invoiceId: string,
  paymentMethod: { type: "card" | "bank"; last4?: string } = { type: "card" }
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "You must be logged in." };

  try {
    const invoice = await db.invoice.findUnique({
      where: { id: invoiceId },
    });
    if (!invoice) return { error: "Invoice not found." };

    const isAdmin =
      session.user.role === "ADMIN" || session.user.role === "PRINCIPAL";
    if (invoice.parentId !== session.user.id && !isAdmin) {
      return { error: "Access denied." };
    }

    if (invoice.status === "paid") {
      return { error: "This invoice is already paid." };
    }

    const remaining = invoice.total - invoice.amountPaid;
    if (remaining <= 0) {
      return { error: "No balance to pay on this invoice." };
    }

    const methodLabel =
      paymentMethod.type === "bank"
        ? `Bank account${paymentMethod.last4 ? ` ending ${paymentMethod.last4}` : ""}`
        : `Credit card${paymentMethod.last4 ? ` ending ${paymentMethod.last4}` : ""}`;

    await db.$transaction([
      db.invoice.update({
        where: { id: invoiceId },
        data: {
          amountPaid: invoice.total,
          status: "paid",
          paidAt: new Date(),
        },
      }),
      db.payment.create({
        data: {
          applicationId: invoice.applicationId,
          type: "TUITION",
          status: "SUCCEEDED",
          amount: remaining,
          description: `Payment for invoice ${invoice.invoiceNumber} (${methodLabel}) — test mode`,
          paidAt: new Date(),
        },
      }),
    ]);

    revalidatePath("/portal/payments");
    revalidatePath("/admin/billing");
    return {
      success: true,
      message: `Payment of $${(remaining / 100).toFixed(2)} processed (test mode).`,
    };
  } catch (error) {
    console.error("Error paying invoice:", error);
    return { error: "Failed to process payment." };
  }
}

// ==================== Save Payment Method (Mock) ====================
// Since we don't have a PaymentMethod model yet, we store a mock success
// and return the masked details for UI display via returned data only.
// Persisted list is kept client-side / session-only for now.
export async function savePaymentMethod(
  type: "card" | "bank",
  details: Record<string, string>
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "You must be logged in." };

  try {
    if (type === "card") {
      const cardNumber = (details.cardNumber ?? "").replace(/\s+/g, "");
      if (cardNumber.length < 4) {
        return { error: "Invalid card number." };
      }
      const last4 = cardNumber.slice(-4);
      return {
        success: true,
        method: {
          type: "card" as const,
          last4,
          name: details.name ?? "Card",
          expiry: details.expiry ?? "",
          label: `Visa •••• ${last4}`,
        },
        message: "Card added (test mode).",
      };
    } else {
      const accountNumber = (details.accountNumber ?? "").replace(/\s+/g, "");
      if (accountNumber.length < 4) {
        return { error: "Invalid account number." };
      }
      const last4 = accountNumber.slice(-4);
      return {
        success: true,
        method: {
          type: "bank" as const,
          last4,
          name: details.name ?? "Bank",
          routing: details.routingNumber ?? "",
          label: `Bank •••• ${last4}`,
        },
        message: "Bank account added (test mode).",
      };
    }
  } catch (error) {
    console.error("Error saving payment method:", error);
    return { error: "Failed to save payment method." };
  }
}
