// Node.js (server actions, route handlers, RSC) Sentry init. Captures
// exceptions thrown in server-side code, including the Stripe webhook,
// payment intent confirmation, and any unhandled promise rejection.
import * as Sentry from "@sentry/nextjs";

const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    sendDefaultPii: false,
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
    // Don't bother reporting common Next.js redirects — they aren't errors.
    ignoreErrors: ["NEXT_REDIRECT", "NEXT_NOT_FOUND"],
  });
}
