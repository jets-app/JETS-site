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
  // safety net.
  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object;
    const applicationId = intent.metadata?.applicationId;
    const type = intent.metadata?.type;

    if (applicationId && type === "application_fee") {
      await markApplicationFeePaid({
        applicationId,
        amount: intent.amount,
        paymentIntentId: intent.id,
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
