"use server";

import { db } from "@/server/db";
import { auth } from "@/server/auth";
import { stripe } from "@/lib/stripe";
import { revalidatePath } from "next/cache";
import type { PaymentMethodType } from "@prisma/client";
import { getOrCreateStripeCustomer } from "@/server/stripe-customer";

// ==================== Constants ====================
// Processing fees are passed through to the parent on top of the invoice
// total so JETS receives the full invoice amount in its bank account.
const CARD_FEE_PCT = 0.03; // 3%
const ACH_FEE_CENTS = 50; // $0.50 flat

function calcProcessingFee(
  amountCents: number,
  type: "CREDIT_CARD" | "BANK_ACCOUNT"
): number {
  if (type === "CREDIT_CARD") return Math.round(amountCents * CARD_FEE_PCT);
  return ACH_FEE_CENTS;
}

// ==================== Auth helper ====================
async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) return { error: "You must be logged in." as const };
  return { session };
}

function isAdmin(role?: string | null) {
  return role === "ADMIN" || role === "PRINCIPAL";
}

// ==================== Auto-Pay Settings ====================
export async function getAutoPaySettings(userId?: string) {
  const check = await requireUser();
  if ("error" in check) return { error: check.error };
  const targetId =
    isAdmin(check.session.user.role) && userId ? userId : check.session.user.id;

  let settings = await db.autoPaySettings.findUnique({
    where: { userId: targetId },
  });
  if (!settings) {
    // Initialize as enabled by default
    settings = await db.autoPaySettings.create({
      data: { userId: targetId, enabled: true },
    });
  }
  return { settings };
}

/**
 * Autopay is mandatory while enrolled — parents can switch which saved card
 * funds it, but they can't disable it. The `enabled` argument is ignored at
 * the action layer and forced to true. (Kept on the function signature so
 * existing call sites don't break.)
 */
export async function updateAutoPaySettings(
  _enabled: boolean,
  paymentMethodId?: string | null,
) {
  const check = await requireUser();
  if ("error" in check) return { error: check.error };
  const userId = check.session.user.id;

  const existing = await db.autoPaySettings.findUnique({ where: { userId } });
  const data = {
    enabled: true,
    paymentMethodId:
      paymentMethodId === undefined
        ? existing?.paymentMethodId ?? null
        : paymentMethodId,
  };

  const settings = existing
    ? await db.autoPaySettings.update({ where: { userId }, data })
    : await db.autoPaySettings.create({ data: { userId, ...data } });

  revalidatePath("/portal/payments");
  revalidatePath("/portal/payments/autopay");
  revalidatePath("/admin/billing");
  return { success: true, settings };
}

// ==================== Payment Methods ====================
export async function getPaymentMethods(userId?: string) {
  const check = await requireUser();
  if ("error" in check) return { error: check.error };
  const targetId =
    isAdmin(check.session.user.role) && userId ? userId : check.session.user.id;

  const methods = await db.paymentMethod.findMany({
    where: { userId: targetId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
  return { methods };
}

/**
 * Step 1 of saving a card: create a Stripe Setup Intent for this user. The
 * client takes the returned client_secret and uses Stripe Elements to collect
 * the card details, which Stripe then attaches to the customer + returns a
 * payment_method ID. Stripe's `setup_intent.succeeded` webhook persists the
 * resulting PaymentMethod row in our DB.
 *
 * Card numbers never touch our servers — they go straight from the parent's
 * browser to Stripe.
 */
export async function createSetupIntent() {
  const check = await requireUser();
  if ("error" in check) return { error: check.error };
  const userId = check.session.user.id;

  try {
    const customerId = await getOrCreateStripeCustomer(userId);
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ["card"],
      // Off-session for autopay — required for charging without re-prompting later
      usage: "off_session",
      metadata: { jetsUserId: userId, type: "save_card" },
    });
    return { success: true, clientSecret: setupIntent.client_secret };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to start card setup";
    console.error("[createSetupIntent]", err);
    return { error: message };
  }
}

export async function deletePaymentMethod(id: string) {
  const check = await requireUser();
  if ("error" in check) return { error: check.error };
  const userId = check.session.user.id;

  const method = await db.paymentMethod.findUnique({ where: { id } });
  if (!method) return { error: "Payment method not found." };
  if (method.userId !== userId && !isAdmin(check.session.user.role)) {
    return { error: "Access denied." };
  }

  // Autopay is mandatory — block deleting the last saved method. Parent must
  // add a replacement card first, then delete the old one.
  const remainingCount = await db.paymentMethod.count({
    where: { userId: method.userId, NOT: { id } },
  });
  if (remainingCount === 0) {
    return {
      error:
        "You must keep at least one payment method on file for tuition autopay. Add a new card first, then delete this one.",
    };
  }

  // Detach from Stripe customer too so a deleted card can't be charged later.
  // Best-effort: a stale or already-detached PM shouldn't block local cleanup.
  if (method.stripePaymentMethodId) {
    await stripe.paymentMethods
      .detach(method.stripePaymentMethodId)
      .catch((e) => console.warn("[deletePaymentMethod] detach failed:", e));
  }

  await db.paymentMethod.delete({ where: { id } });

  // If this was default, promote another to default if any
  if (method.isDefault) {
    const next = await db.paymentMethod.findFirst({
      where: { userId: method.userId },
      orderBy: { createdAt: "desc" },
    });
    if (next) {
      await db.paymentMethod.update({
        where: { id: next.id },
        data: { isDefault: true },
      });
    }
  }

  // Clear auto-pay reference if pointed here
  await db.autoPaySettings.updateMany({
    where: { userId: method.userId, paymentMethodId: id },
    data: { paymentMethodId: null },
  });

  revalidatePath("/portal/payments");
  revalidatePath("/portal/payments/methods");
  revalidatePath("/portal/payments/autopay");
  return { success: true };
}

export async function setDefaultPaymentMethod(id: string) {
  const check = await requireUser();
  if ("error" in check) return { error: check.error };
  const userId = check.session.user.id;

  const method = await db.paymentMethod.findUnique({ where: { id } });
  if (!method) return { error: "Payment method not found." };
  if (method.userId !== userId && !isAdmin(check.session.user.role)) {
    return { error: "Access denied." };
  }

  await db.$transaction([
    db.paymentMethod.updateMany({
      where: { userId: method.userId },
      data: { isDefault: false },
    }),
    db.paymentMethod.update({
      where: { id },
      data: { isDefault: true },
    }),
  ]);

  revalidatePath("/portal/payments");
  revalidatePath("/portal/payments/methods");
  revalidatePath("/portal/payments/autopay");
  return { success: true };
}

// ==================== Charge Invoice (real Stripe) ====================
/**
 * Charges a tuition invoice against a saved Stripe payment method. Used by:
 *   - Parent clicking "Pay now" on an unpaid invoice
 *   - Admin clicking "Run Auto-Pay" on an overdue invoice
 *   - Daily autopay cron when the invoice's due date hits and autopay is on
 *
 * The actual `invoice.update({status: paid})` happens in the
 * `payment_intent.succeeded` webhook (not here) so the DB only marks paid
 * after Stripe confirms the funds. This function returns succeeded if the
 * Payment Intent transitions to `succeeded` synchronously (most cards), or
 * `pending` if it's still processing (rare, e.g. some 3DS flows).
 */
export async function chargeInvoice(
  invoiceId: string,
  paymentMethodId: string,
) {
  const check = await requireUser();
  if ("error" in check) return { error: check.error };

  const invoice = await db.invoice.findUnique({ where: { id: invoiceId } });
  if (!invoice) return { error: "Invoice not found." };

  const method = await db.paymentMethod.findUnique({
    where: { id: paymentMethodId },
  });
  if (!method) return { error: "Payment method not found." };

  // Permission: parent who owns invoice, owner of method, or admin
  const userId = check.session.user.id;
  const admin = isAdmin(check.session.user.role);
  if (!admin && invoice.parentId !== userId) return { error: "Access denied." };
  if (!admin && method.userId !== userId) return { error: "Access denied." };

  if (invoice.status === "paid") return { error: "Invoice is already paid." };

  if (!method.stripePaymentMethodId) {
    return {
      error:
        "This saved card was created before Stripe was wired up. Please remove it and add a new one.",
    };
  }

  const remaining = invoice.total - invoice.amountPaid;
  if (remaining <= 0) return { error: "Nothing to charge." };

  const fee = calcProcessingFee(remaining, method.type);
  const totalCharged = remaining + fee;
  const methodLabel = `${method.brand ?? "Card"} •••• ${method.last4}`;

  try {
    // Resolve the parent's Stripe customer (creates one if missing)
    const customerId = await getOrCreateStripeCustomer(invoice.parentId);

    const intent = await stripe.paymentIntents.create({
      amount: totalCharged,
      currency: "usd",
      customer: customerId,
      payment_method: method.stripePaymentMethodId,
      payment_method_types: ["card"],
      // off_session = no parent in the loop. Stripe requires off_session +
      // confirm:true together so the charge attempts immediately. If 3DS is
      // required, the SDK throws a `payment_intent.requires_action` error
      // and we surface it cleanly so the parent can complete the challenge.
      off_session: true,
      confirm: true,
      description: `JETS Tuition — Invoice ${invoice.invoiceNumber}`,
      metadata: {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        parentId: invoice.parentId,
        type: "tuition_invoice",
        // The webhook reads these to credit the right invoice + log the right fee
        processingFee: String(fee),
      },
    });

    // Don't update DB here — the webhook handler is the source of truth.
    // We optimistically record the in-flight charge so the UI shows pending.
    await db.invoice.update({
      where: { id: invoiceId },
      data: {
        status:
          intent.status === "succeeded"
            ? invoice.status // webhook will flip to "paid"
            : "processing",
      },
    });

    revalidatePath("/admin/billing");
    revalidatePath("/portal/payments");
    return {
      success: true,
      paymentIntentId: intent.id,
      status: intent.status,
      message:
        intent.status === "succeeded"
          ? `Charge submitted. ${methodLabel} will be debited $${(totalCharged / 100).toFixed(2)}.`
          : `Charge ${intent.status}. We'll email you once it settles.`,
    };
  } catch (err) {
    // Stripe.errors.StripeCardError, StripeAuthenticationError, etc.
    const stripeErr = err as {
      type?: string;
      code?: string;
      message?: string;
      raw?: { code?: string; payment_intent?: { id?: string } };
    };
    const decline =
      stripeErr.code === "card_declined" ||
      stripeErr.raw?.code === "card_declined";
    const friendlyMessage =
      decline
        ? `${methodLabel} was declined by the issuer. Please update your card or use a different one.`
        : stripeErr.message ?? "Charge failed.";

    // Mark the invoice as failed-charge so admins can see + retry
    await db.invoice
      .update({
        where: { id: invoiceId },
        data: { status: "failed" },
      })
      .catch(() => {});

    console.error(
      `[chargeInvoice] failed for invoice ${invoice.invoiceNumber}:`,
      stripeErr,
    );

    return { error: friendlyMessage };
  }
}
