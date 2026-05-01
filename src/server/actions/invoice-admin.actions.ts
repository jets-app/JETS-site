"use server";

import { db } from "@/server/db";
import { auth } from "@/server/auth";
import { stripe } from "@/lib/stripe";
import { isFounder } from "@/lib/roles";
import { revalidatePath } from "next/cache";

async function requireBilling() {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not signed in." };
  const role = session.user.role;
  // Only ADMIN, PRINCIPAL, SECRETARY (and the founder) can mutate invoices.
  // Reviewers can read, not write.
  if (
    role !== "ADMIN" &&
    role !== "PRINCIPAL" &&
    role !== "SECRETARY" &&
    !isFounder(session.user.email ?? null)
  ) {
    return { error: "Permission denied." };
  }
  return { session };
}

/**
 * Admin marks an invoice paid manually (cash, check, wire transfer, etc.).
 * Records a Payment row with type=MANUAL so the audit trail is intact.
 */
export async function markInvoicePaidManually(input: {
  invoiceId: string;
  method: "cash" | "check" | "wire" | "other";
  reference?: string;
}) {
  const check = await requireBilling();
  if ("error" in check) return { error: check.error };

  const invoice = await db.invoice.findUnique({
    where: { id: input.invoiceId },
  });
  if (!invoice) return { error: "Invoice not found." };
  if (invoice.status === "paid") return { error: "Already paid." };
  if (invoice.status === "void") return { error: "Cannot pay a voided invoice." };

  const remaining = invoice.total - invoice.amountPaid;
  if (remaining <= 0) return { error: "Nothing owed." };

  const description = `Marked paid manually (${input.method}${
    input.reference ? ` — ${input.reference}` : ""
  })`;

  await db.$transaction([
    db.invoice.update({
      where: { id: invoice.id },
      data: {
        amountPaid: invoice.total,
        status: "paid",
        paidAt: new Date(),
        paymentMethodType: input.method, // cash | check | wire | other
        // Clear any pending wire flag — admin reconciliation completes the cycle.
        wirePendingAt: null,
      },
    }),
    db.payment.create({
      data: {
        applicationId: invoice.applicationId,
        type: "TUITION",
        status: "SUCCEEDED",
        amount: remaining,
        description,
        paidAt: new Date(),
      },
    }),
  ]);

  revalidatePath("/admin/billing");
  revalidatePath("/portal/payments");
  return { success: true };
}

/**
 * Admin voids an invoice (mistake, duplicate, withdrawal). Status → "void"
 * so it's excluded from autopay + late fee processing. Doesn't refund any
 * prior payments — use refund for that.
 */
export async function voidInvoice(input: {
  invoiceId: string;
  reason?: string;
}) {
  const check = await requireBilling();
  if ("error" in check) return { error: check.error };

  const invoice = await db.invoice.findUnique({
    where: { id: input.invoiceId },
  });
  if (!invoice) return { error: "Invoice not found." };
  if (invoice.status === "paid") {
    return {
      error:
        "This invoice is already paid. Refund it instead of voiding so the paper trail is clean.",
    };
  }
  if (invoice.status === "void") return { error: "Already voided." };

  await db.invoice.update({
    where: { id: invoice.id },
    data: { status: "void" },
  });

  // Note the reason in a Payment row (negative amount as audit trail)
  if (input.reason) {
    await db.payment.create({
      data: {
        applicationId: invoice.applicationId,
        type: "OTHER",
        status: "SUCCEEDED",
        amount: 0,
        description: `Invoice ${invoice.invoiceNumber} voided — ${input.reason}`,
        paidAt: new Date(),
      },
    });
  }

  revalidatePath("/admin/billing");
  revalidatePath("/portal/payments");
  return { success: true };
}

/**
 * Refund a paid invoice via Stripe. Handles full and partial refunds.
 *
 *   amountCents: optional. If omitted, refunds the full original charge.
 *   reason: required for the audit trail.
 *
 * Stripe processes the refund asynchronously; we mark the DB immediately so
 * the admin sees it, and trust Stripe's webhook (`charge.refunded`) to
 * reconcile if the refund later fails.
 */
export async function refundInvoice(input: {
  invoiceId: string;
  reason: string;
  amountCents?: number;
}) {
  const check = await requireBilling();
  if ("error" in check) return { error: check.error };

  const invoice = await db.invoice.findUnique({
    where: { id: input.invoiceId },
  });
  if (!invoice) return { error: "Invoice not found." };
  if (invoice.status !== "paid") {
    return { error: "Only paid invoices can be refunded." };
  }

  // Look up the Stripe Payment Intent recorded against this invoice
  const payment = await db.payment.findFirst({
    where: {
      applicationId: invoice.applicationId,
      type: "TUITION",
      status: "SUCCEEDED",
      stripePaymentIntentId: { not: null },
    },
    orderBy: { paidAt: "desc" },
  });
  if (!payment?.stripePaymentIntentId) {
    return {
      error:
        "This invoice has no Stripe charge to refund — was it marked paid manually? Issue a refund outside the system and record it as a manual adjustment.",
    };
  }

  const refundAmount = input.amountCents ?? payment.amount;
  if (refundAmount <= 0) return { error: "Refund amount must be positive." };
  if (refundAmount > payment.amount) {
    return {
      error: `Refund amount can't exceed the original charge of $${(
        payment.amount / 100
      ).toFixed(2)}.`,
    };
  }

  try {
    await stripe.refunds.create({
      payment_intent: payment.stripePaymentIntentId,
      amount: refundAmount,
      reason: "requested_by_customer",
      metadata: {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        adminReason: input.reason,
      },
    });

    await db.$transaction([
      db.invoice.update({
        where: { id: invoice.id },
        data: {
          refundedAt: new Date(),
          refundedAmount: refundAmount,
          refundReason: input.reason,
          // Mark refunded if fully refunded; partial refunds keep status=paid
          status: refundAmount >= payment.amount ? "refunded" : "paid",
        },
      }),
      db.payment.create({
        data: {
          applicationId: invoice.applicationId,
          type: "OTHER",
          status: "REFUNDED",
          amount: -refundAmount, // negative = refund
          description: `Refund for invoice ${invoice.invoiceNumber} — ${input.reason}`,
          stripePaymentIntentId: payment.stripePaymentIntentId,
          paidAt: new Date(),
        },
      }),
    ]);

    revalidatePath("/admin/billing");
    revalidatePath("/portal/payments");
    return {
      success: true,
      message: `Refunded $${(refundAmount / 100).toFixed(2)} via Stripe.`,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Refund failed.";
    console.error("[refundInvoice]", err);
    return { error: message };
  }
}
