// Browser-side Sentry init. Loaded on every page that hits the client.
// SDK auto-detects user data on errors (component name, route, etc.) but
// scrubs sensitive form fields by default.
import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    // Lower volume in production: sample 10% of normal traffic for tracing,
    // 100% of errors. Errors are always reported.
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    // Don't send personal data or stack frames from third-party scripts unless
    // they're clearly relevant.
    sendDefaultPii: false,
    // Common noise we don't need
    ignoreErrors: [
      "ResizeObserver loop limit exceeded",
      "Non-Error promise rejection captured",
      "NetworkError when attempting to fetch resource.",
      "AbortError",
    ],
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
  });
}
