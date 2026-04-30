import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { chargeInvoice } from "@/server/actions/auto-pay.actions";

export const runtime = "nodejs";
// Charges can take a couple seconds each; allow up to 5 min for the batch
export const maxDuration = 300;

/**
 * Daily autopay run. Finds every invoice whose due date is today (or already
 * past due and not yet paid) where the parent has autopay enabled with a
 * saved card, and attempts to charge it via Stripe.
 *
 * Idempotent: only invoices in `unpaid`/`sent` status are picked up. Once
 * `chargeInvoice` succeeds the invoice flips to `processing` (then `paid`
 * via webhook), so the next run won't double-charge.
 */
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json(
      { error: "CRON_SECRET not configured" },
      { status: 500 },
    );
  }
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const stats = { attempted: 0, succeeded: 0, failed: 0, skipped: 0 };
  const errors: string[] = [];

  // All invoices due today or earlier, not yet paid, with an active parent
  const dueInvoices = await db.invoice.findMany({
    where: {
      status: { in: ["unpaid", "sent"] },
      dueDate: { lte: now },
      amountPaid: { lt: db.invoice.fields.total },
    },
    select: {
      id: true,
      invoiceNumber: true,
      parentId: true,
    },
  });

  for (const inv of dueInvoices) {
    stats.attempted++;
    const settings = await db.autoPaySettings.findUnique({
      where: { userId: inv.parentId },
    });
    if (!settings?.enabled || !settings.paymentMethodId) {
      stats.skipped++;
      continue;
    }

    try {
      // We can't call the server action directly because it does session auth.
      // Instead, replicate the safe path: lookup method, attempt charge via
      // chargeInvoice's Stripe path.
      const result = await runAutopayCharge(inv.id, settings.paymentMethodId);
      if (result.error) {
        stats.failed++;
        errors.push(`${inv.invoiceNumber}: ${result.error}`);
      } else {
        stats.succeeded++;
      }
    } catch (e) {
      stats.failed++;
      errors.push(
        `${inv.invoiceNumber}: ${e instanceof Error ? e.message : String(e)}`,
      );
    }
  }

  console.log("[cron/autopay]", { stats, errors });
  return NextResponse.json({ stats, errors });
}

/**
 * Wraps chargeInvoice but skips the session-based permission check (the cron
 * IS the system, not a user). Otherwise identical logic.
 */
async function runAutopayCharge(invoiceId: string, paymentMethodId: string) {
  const { stripe } = await import("@/lib/stripe");
  const { getOrCreateStripeCustomer } = await import(
    "@/server/stripe-customer"
  );

  const invoice = await db.invoice.findUnique({ where: { id: invoiceId } });
  if (!invoice) return { error: "Invoice not found." };

  const method = await db.paymentMethod.findUnique({
    where: { id: paymentMethodId },
  });
  if (!method) return { error: "Payment method not found." };
  if (!method.stripePaymentMethodId) {
    return { error: "Saved card has no Stripe ID — needs re-saving by parent." };
  }
  if (invoice.status === "paid") return { error: "Already paid." };

  const remaining = invoice.total - invoice.amountPaid;
  if (remaining <= 0) return { error: "Nothing to charge." };
  const fee = method.type === "CREDIT_CARD" ? Math.round(remaining * 0.03) : 50;
  const totalCharged = remaining + fee;

  try {
    const customerId = await getOrCreateStripeCustomer(invoice.parentId);
    await stripe.paymentIntents.create({
      amount: totalCharged,
      currency: "usd",
      customer: customerId,
      payment_method: method.stripePaymentMethodId,
      payment_method_types: ["card"],
      off_session: true,
      confirm: true,
      description: `JETS Tuition (autopay) — Invoice ${invoice.invoiceNumber}`,
      metadata: {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        parentId: invoice.parentId,
        type: "tuition_invoice",
        processingFee: String(fee),
        autopay: "true",
      },
    });
    await db.invoice.update({
      where: { id: invoice.id },
      data: { status: "processing" },
    });
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await db.invoice
      .update({ where: { id: invoice.id }, data: { status: "failed" } })
      .catch(() => {});
    return { error: message };
  }
}
