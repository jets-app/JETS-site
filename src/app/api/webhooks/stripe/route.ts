import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/server/db";
import { triggerStatusNotifications } from "@/server/notifications";

export async function POST(req: NextRequest) {
  // Fail-closed if the webhook secret isn't configured — otherwise Stripe
  // events from anyone could be accepted.
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[stripe-webhook] STRIPE_WEBHOOK_SECRET not configured");
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 500 },
    );
  }

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Legacy Stripe Checkout flow (kept for backward compatibility — not used
  // by the current inline Payment Element flow).
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const applicationId = session.metadata?.applicationId;
    const type = session.metadata?.type;

    if (applicationId && type === "application_fee") {
      await markApplicationFeePaid({
        applicationId,
        amount: session.amount_total ?? 0,
        paymentIntentId: session.payment_intent as string,
        checkoutSessionId: session.id,
      });
    }
  }

  // Inline Payment Element flow — fires after stripe.confirmPayment(). The
  // client also calls confirmApplicationFeePaid() server action to update the
  // DB, but a parent who closes the browser mid-flow would otherwise have a
  // successful charge that never updates the application. This webhook is the
  // safety net for application fees AND the source of truth for tuition
  // invoices charged via off-session autopay.
  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object;
    const type = intent.metadata?.type;

    if (intent.metadata?.applicationId && type === "application_fee") {
      await markApplicationFeePaid({
        applicationId: intent.metadata.applicationId,
        amount: intent.amount,
        paymentIntentId: intent.id,
      });
    } else if (intent.metadata?.invoiceId && type === "tuition_invoice") {
      // Receipt URL lives on the underlying Charge, not the PaymentIntent.
      // Look it up if we have a latest_charge ID — best effort, falls back
      // to the Stripe dashboard if the lookup fails.
      let receiptUrl: string | null = null;
      if (typeof intent.latest_charge === "string") {
        try {
          const charge = await stripe.charges.retrieve(intent.latest_charge);
          receiptUrl = charge.receipt_url ?? null;
        } catch (e) {
          console.warn("[stripe-webhook] failed to fetch charge:", e);
        }
      }
      await markTuitionInvoicePaid({
        invoiceId: intent.metadata.invoiceId,
        amount: intent.amount,
        processingFee: parseInt(intent.metadata.processingFee ?? "0", 10),
        paymentIntentId: intent.id,
        receiptUrl,
      });
    }
  }

  // Charge declined / 3DS failed / etc.
  if (event.type === "payment_intent.payment_failed") {
    const intent = event.data.object;
    if (intent.metadata?.invoiceId && intent.metadata?.type === "tuition_invoice") {
      await markTuitionInvoiceFailed({
        invoiceId: intent.metadata.invoiceId,
        paymentIntentId: intent.id,
        failureMessage:
          intent.last_payment_error?.message ?? "Charge declined.",
      });
    }
  }

  // SetupIntent for saving a card — create the PaymentMethod row in our DB
  // with the real Stripe payment_method ID populated.
  if (event.type === "setup_intent.succeeded") {
    const setup = event.data.object;
    if (setup.metadata?.type === "save_card" && setup.payment_method) {
      await persistSavedCard({
        userId: setup.metadata.jetsUserId!,
        stripePaymentMethodId: setup.payment_method as string,
      });
    }
  }

  return NextResponse.json({ received: true });
}

/**
 * Idempotent: if the fee is already marked paid (likely because the client
 * server action got there first), this is a no-op. Otherwise it marks the
 * application paid + creates the Payment row + fires status notifications.
 */
async function markApplicationFeePaid(args: {
  applicationId: string;
  amount: number;
  paymentIntentId: string;
  checkoutSessionId?: string;
}) {
  const application = await db.application.findUnique({
    where: { id: args.applicationId },
    select: { id: true, applicationFeePaid: true, type: true },
  });
  if (!application || application.applicationFeePaid) return;

  await db.$transaction([
    db.payment.create({
      data: {
        applicationId: args.applicationId,
        type: "APPLICATION_FEE",
        status: "SUCCEEDED",
        amount: args.amount,
        description: "Application fee (Stripe webhook)",
        stripePaymentIntentId: args.paymentIntentId,
        stripeCheckoutSessionId: args.checkoutSessionId,
        paidAt: new Date(),
      },
    }),
    db.application.update({
      where: { id: args.applicationId },
      data: {
        applicationFeePaid: true,
        // Reapplications jump to principal review the moment the fee is settled
        status:
          application.type === "REAPPLICATION" ? "PRINCIPAL_REVIEW" : undefined,
      },
    }),
  ]);

  if (application.type === "REAPPLICATION") {
    triggerStatusNotifications(args.applicationId, "SUBMITTED").catch(
      console.error,
    );
    triggerStatusNotifications(args.applicationId, "PRINCIPAL_REVIEW").catch(
      console.error,
    );
  }
}

/**
 * Tuition invoice paid → mark invoice paid, create Payment row, send receipt.
 * Idempotent: if a Payment row with the same Stripe Payment Intent ID already
 * exists (e.g. webhook retried) we skip the duplicate work.
 */
async function markTuitionInvoicePaid(args: {
  invoiceId: string;
  amount: number;
  processingFee: number;
  paymentIntentId: string;
  receiptUrl: string | null;
}) {
  const existingPayment = await db.payment.findUnique({
    where: { stripePaymentIntentId: args.paymentIntentId },
  });
  if (existingPayment) return;

  const invoice = await db.invoice.findUnique({
    where: { id: args.invoiceId },
  });
  if (!invoice) {
    console.error(`[stripe-webhook] tuition invoice ${args.invoiceId} not found`);
    return;
  }

  const parent = await db.user.findUnique({
    where: { id: invoice.parentId },
    select: { id: true, email: true, name: true, phone: true },
  });

  await db.$transaction([
    db.invoice.update({
      where: { id: invoice.id },
      data: {
        amountPaid: invoice.total,
        status: "paid",
        paidAt: new Date(),
        processingFee: args.processingFee,
      },
    }),
    db.payment.create({
      data: {
        applicationId: invoice.applicationId,
        type: "TUITION",
        status: "SUCCEEDED",
        amount: args.amount,
        description: `Invoice ${invoice.invoiceNumber} (Stripe webhook)`,
        stripePaymentIntentId: args.paymentIntentId,
        stripeReceiptUrl: args.receiptUrl,
        paidAt: new Date(),
      },
    }),
    db.autoPaySettings.updateMany({
      where: { userId: invoice.parentId },
      data: { lastChargedAt: new Date() },
    }),
  ]);

  // Receipt to parent — best effort
  if (parent) {
    void sendTuitionReceipt({
      to: parent.email,
      phone: parent.phone,
      name: parent.name,
      invoiceNumber: invoice.invoiceNumber,
      amount: args.amount,
      receiptUrl: args.receiptUrl,
    });
  }
}

/**
 * Tuition invoice charge failed (declined card, expired, etc.) → flag the
 * invoice and notify the parent so they can update their card.
 */
async function markTuitionInvoiceFailed(args: {
  invoiceId: string;
  paymentIntentId: string;
  failureMessage: string;
}) {
  const invoice = await db.invoice.findUnique({
    where: { id: args.invoiceId },
  });
  if (!invoice) return;
  if (invoice.status === "paid") return; // belt and suspenders

  await db.invoice.update({
    where: { id: invoice.id },
    data: { status: "failed" },
  });

  const parent = await db.user.findUnique({
    where: { id: invoice.parentId },
    select: { email: true, name: true, phone: true },
  });
  if (parent) {
    void sendChargeFailedNotice({
      to: parent.email,
      phone: parent.phone,
      name: parent.name,
      invoiceNumber: invoice.invoiceNumber,
      reason: args.failureMessage,
    });
  }
}

/**
 * SetupIntent succeeded → fetch the underlying payment method from Stripe so
 * we have brand/last4/exp, and create a PaymentMethod row in our DB.
 * Idempotent: re-running with the same stripePaymentMethodId is a no-op.
 */
async function persistSavedCard(args: {
  userId: string;
  stripePaymentMethodId: string;
}) {
  const existing = await db.paymentMethod.findUnique({
    where: { stripePaymentMethodId: args.stripePaymentMethodId },
  });
  if (existing) return;

  const pm = await stripe.paymentMethods.retrieve(args.stripePaymentMethodId);
  const card = pm.card;
  if (!card) {
    console.warn(`[stripe-webhook] setup_intent.succeeded for non-card PM ${pm.id}`);
    return;
  }

  const existingCount = await db.paymentMethod.count({
    where: { userId: args.userId },
  });

  const created = await db.paymentMethod.create({
    data: {
      userId: args.userId,
      type: "CREDIT_CARD",
      last4: card.last4,
      brand: card.brand,
      expiryMonth: card.exp_month,
      expiryYear: card.exp_year,
      stripePaymentMethodId: pm.id,
      isDefault: existingCount === 0,
    },
  });

  if (existingCount === 0) {
    // Wire this card up for autopay since it's the first one
    await db.autoPaySettings.upsert({
      where: { userId: args.userId },
      create: { userId: args.userId, enabled: true, paymentMethodId: created.id },
      update: { paymentMethodId: created.id },
    });
  }
}

async function sendTuitionReceipt(args: {
  to: string;
  phone: string | null;
  name: string;
  invoiceNumber: string;
  amount: number;
  receiptUrl: string | null;
}) {
  const { sendEmail } = await import("@/server/email");
  const { sendSMS } = await import("@/server/sms");
  const formattedAmount = `$${(args.amount / 100).toFixed(2)}`;
  const receiptLink = args.receiptUrl
    ? `<p style="margin-top:16px;"><a href="${args.receiptUrl}">View Stripe receipt</a></p>`
    : "";

  await sendEmail({
    to: args.to,
    subject: `Receipt — JETS Tuition Invoice ${args.invoiceNumber}`,
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;padding:20px;">
        <div style="text-align:center;padding:20px 0;border-bottom:2px solid #A30018;">
          <h1 style="color:#A30018;font-size:24px;margin:0;">JETS School</h1>
        </div>
        <div style="padding:30px 0;line-height:1.6;color:#333;">
          <p>Hi ${args.name},</p>
          <p>We've received your tuition payment of <strong>${formattedAmount}</strong> for invoice <strong>${args.invoiceNumber}</strong>. Thank you.</p>
          ${receiptLink}
        </div>
      </div>
    `,
  }).catch((e) => console.error("[receipt email] failed:", e));

  if (args.phone) {
    await sendSMS({
      to: args.phone,
      body: `JETS School: Payment received — ${formattedAmount} for invoice ${args.invoiceNumber}. Thank you. Reply STOP to opt out.`,
    }).catch((e) => console.error("[receipt sms] failed:", e));
  }
}

async function sendChargeFailedNotice(args: {
  to: string;
  phone: string | null;
  name: string;
  invoiceNumber: string;
  reason: string;
}) {
  const { sendEmail } = await import("@/server/email");
  const { sendSMS } = await import("@/server/sms");
  const portalUrl = process.env.AUTH_URL ?? "https://app.jetscollege.org";

  await sendEmail({
    to: args.to,
    subject: `Action needed: Tuition payment for invoice ${args.invoiceNumber} couldn't be processed`,
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;padding:20px;">
        <div style="text-align:center;padding:20px 0;border-bottom:2px solid #A30018;">
          <h1 style="color:#A30018;font-size:24px;margin:0;">JETS School</h1>
        </div>
        <div style="padding:30px 0;line-height:1.6;color:#333;">
          <p>Hi ${args.name},</p>
          <p>We tried to charge your saved card for tuition invoice <strong>${args.invoiceNumber}</strong> but the charge didn't go through.</p>
          <p style="background:#fef7f7;border-left:4px solid #A30018;padding:10px 14px;font-size:0.9em;">
            <strong>Reason:</strong> ${args.reason}
          </p>
          <p>Please update your payment method or pay the invoice directly:</p>
          <p style="text-align:center;margin:20px 0;">
            <a href="${portalUrl}/portal/payments" style="background:#A30018;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;">
              Update payment
            </a>
          </p>
          <p style="font-size:0.9em;color:#666;">If we can't collect within 10 days, a $50 late fee may apply per the tuition contract.</p>
        </div>
      </div>
    `,
  }).catch((e) => console.error("[charge-failed email] failed:", e));

  if (args.phone) {
    await sendSMS({
      to: args.phone,
      body: `JETS School: Tuition charge for invoice ${args.invoiceNumber} failed. Please update your payment: ${portalUrl}/portal/payments. Reply STOP to opt out.`,
    }).catch((e) => console.error("[charge-failed sms] failed:", e));
  }
}
