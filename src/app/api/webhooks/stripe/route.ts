import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/server/db";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const applicationId = session.metadata?.applicationId;
    const type = session.metadata?.type;

    if (applicationId && type === "application_fee") {
      await db.application.update({
        where: { id: applicationId },
        data: { applicationFeePaid: true },
      });

      await db.payment.create({
        data: {
          applicationId,
          type: "APPLICATION_FEE",
          status: "SUCCEEDED",
          amount: session.amount_total ?? 0,
          stripePaymentIntentId: session.payment_intent as string,
          stripeCheckoutSessionId: session.id,
          paidAt: new Date(),
        },
      });
    }
  }

  return NextResponse.json({ received: true });
}
