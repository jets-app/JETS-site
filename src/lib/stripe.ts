import Stripe from "stripe";

// .trim() guards against a stray newline/whitespace in the Vercel env var,
// which Node rejects when building the Authorization header (ERR_INVALID_CHAR).
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!.trim(), {
  apiVersion: "2026-03-25.dahlia",
});
