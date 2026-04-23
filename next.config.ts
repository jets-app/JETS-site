import type { NextConfig } from "next";

// Security headers applied to every response. CSP is intentionally NOT included
// here yet — it ships in a follow-up commit after each external integration
// (Stripe.js, Vercel Blob, Resend) has been verified against the policy.
const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    // 2 years, includeSubDomains so app.* + jetscollege.org both hardened, preload eligible
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", ".prisma/client", "bcryptjs"],
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  images: {
    remotePatterns: [
      { protocol: "https" as const, hostname: "www.jetsschool.org" },
    ],
  },
  async headers() {
    return [
      // Apply baseline security headers everywhere
      { source: "/:path*", headers: securityHeaders },
      // Never cache authed API responses
      {
        source: "/api/:path*",
        headers: [{ key: "Cache-Control", value: "no-store, max-age=0" }],
      },
    ];
  },
};

export default nextConfig;
