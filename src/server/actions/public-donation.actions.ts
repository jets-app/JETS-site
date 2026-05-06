"use server";

import { db } from "@/server/db";
import { stripe } from "@/lib/stripe";
import { rateLimitPublicToken } from "@/server/security/rate-limit";

export interface PublicDonationInput {
  amountCents: number;
  frequency: "ONE_TIME" | "MONTHLY";
  purpose: string;
  inHonorOf?: string;
  donor: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  anonymous?: boolean;
  notes?: string;
}

const MIN_DONATION_CENTS = 500; // $5 minimum

/**
 * Public action — creates a Donor (or finds an existing one by email),
 * starts a Stripe Customer + Payment/Setup Intent depending on frequency,
 * and returns the clientSecret so the browser can confirm payment.
 *
 * Recurring (MONTHLY): we create a Stripe Subscription via SetupIntent →
 * customer signs the card → Subscription is created server-side after the
 * webhook confirms the payment method is on file.
 *
 * One-time: standard PaymentIntent flow.
 */
export async function startPublicDonation(input: PublicDonationInput) {
  // Rate-limit by IP — donation form is public, easy abuse vector.
  const rl = await rateLimitPublicToken();
  if (!rl.ok) {
    return { error: "Too many requests. Please wait a moment and try again." };
  }

  const amount = Math.round(input.amountCents);
  if (!Number.isFinite(amount) || amount < MIN_DONATION_CENTS) {
    return { error: `Minimum donation is $${(MIN_DONATION_CENTS / 100).toFixed(2)}.` };
  }

  const email = input.donor.email.trim().toLowerCase();
  const firstName = input.donor.firstName.trim();
  const lastName = input.donor.lastName.trim();
  if (!email.includes("@") || !firstName || !lastName) {
    return { error: "Please fill in your name and a valid email." };
  }

  // Find or create Donor by email.
  let donor = await db.donor.findFirst({ where: { email } });
  if (!donor) {
    donor = await db.donor.create({
      data: {
        firstName,
        lastName,
        email,
        phone: input.donor.phone?.trim() || null,
        address: input.donor.address?.trim() || null,
        city: input.donor.city?.trim() || null,
        state: input.donor.state?.trim() || null,
        zipCode: input.donor.zipCode?.trim() || null,
      },
    });
  } else {
    // Lightly update contact info if they filled in newer fields.
    const update: Record<string, unknown> = {};
    if (firstName && firstName !== donor.firstName) update.firstName = firstName;
    if (lastName && lastName !== donor.lastName) update.lastName = lastName;
    if (input.donor.phone && !donor.phone) update.phone = input.donor.phone.trim();
    if (input.donor.address && !donor.address) update.address = input.donor.address.trim();
    if (input.donor.city && !donor.city) update.city = input.donor.city.trim();
    if (input.donor.state && !donor.state) update.state = input.donor.state.trim();
    if (input.donor.zipCode && !donor.zipCode) update.zipCode = input.donor.zipCode.trim();
    if (Object.keys(update).length > 0) {
      donor = await db.donor.update({ where: { id: donor.id }, data: update });
    }
  }

  // Get or create Stripe Customer.
  let stripeCustomerId = donor.stripeCustomerId;
  if (!stripeCustomerId) {
    const cust = await stripe.customers.create({
      email,
      name: `${firstName} ${lastName}`,
      metadata: { jetsDonorId: donor.id },
    });
    stripeCustomerId = cust.id;
    await db.donor.update({
      where: { id: donor.id },
      data: { stripeCustomerId },
    });
  }

  const noteFromHonor = input.inHonorOf?.trim()
    ? `In honor of: ${input.inHonorOf.trim()}`
    : "";
  const combinedNotes = [noteFromHonor, input.notes?.trim()]
    .filter(Boolean)
    .join("\n");

  if (input.frequency === "MONTHLY") {
    // Monthly recurring — set up a SetupIntent to save the card, then we
    // create the Subscription server-side after webhook confirms it's saved.
    const setupIntent = await stripe.setupIntents.create({
      customer: stripeCustomerId,
      automatic_payment_methods: { enabled: true },
      metadata: {
        type: "donation_recurring_setup",
        jetsDonorId: donor.id,
        amountCents: String(amount),
        purpose: input.purpose,
        anonymous: input.anonymous ? "true" : "false",
        notes: combinedNotes.slice(0, 500),
      },
    });

    // Create the Donation row in PENDING state — webhook will mark it active
    // once the subscription succeeds.
    const donation = await db.donation.create({
      data: {
        donorId: donor.id,
        amount,
        frequency: "MONTHLY",
        method: "stripe",
        purpose: input.purpose,
        notes: combinedNotes || null,
      },
    });

    return {
      success: true,
      clientSecret: setupIntent.client_secret,
      mode: "setup" as const,
      donationId: donation.id,
    };
  }

  // One-time PaymentIntent.
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: "usd",
    customer: stripeCustomerId,
    automatic_payment_methods: { enabled: true },
    description: `Donation to JETS School — ${input.purpose}`,
    metadata: {
      type: "donation_one_time",
      jetsDonorId: donor.id,
      purpose: input.purpose,
      anonymous: input.anonymous ? "true" : "false",
      notes: combinedNotes.slice(0, 500),
    },
  });

  // Create Donation row up front; webhook updates it to paid on success.
  const donation = await db.donation.create({
    data: {
      donorId: donor.id,
      amount,
      frequency: "ONE_TIME",
      method: "stripe",
      purpose: input.purpose,
      stripePaymentIntentId: paymentIntent.id,
      notes: combinedNotes || null,
    },
  });

  return {
    success: true,
    clientSecret: paymentIntent.client_secret,
    mode: "payment" as const,
    donationId: donation.id,
  };
}
