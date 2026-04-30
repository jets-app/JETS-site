import { db } from "@/server/db";
import { stripe } from "@/lib/stripe";

/**
 * Returns the Stripe Customer ID for a JETS user, creating one in Stripe
 * the first time it's needed. Idempotent: subsequent calls return the
 * stored ID without hitting Stripe.
 */
export async function getOrCreateStripeCustomer(userId: string): Promise<string> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, stripeCustomerId: true },
  });
  if (!user) throw new Error(`User ${userId} not found`);
  if (user.stripeCustomerId) return user.stripeCustomerId;

  const customer = await stripe.customers.create({
    email: user.email,
    name: user.name,
    metadata: { jetsUserId: user.id },
  });

  await db.user.update({
    where: { id: user.id },
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
}
