import type { NextConfig } from "next";

// Content Security Policy — shipped in Report-Only mode first so we can
// observe violations without blocking real traffic. After ~1 week of clean
// reports we flip to enforce mode by changing the header name.
//
// Allowlist rationale:
//  - script-src: self + Stripe.js (payments). 'unsafe-inline' kept because
//    Next.js still emits inline hydration scripts; will tighten via nonces later.
//  - style-src: self + 'unsafe-inline' (Tailwind/Next inject inline styles)
//  - frame-src: Stripe (Payment Element 3DS frames) + Vimeo (homepage video)
//  - connect-src: self + Stripe API + Vimeo
//  - img-src/font-src: liberal (data: + https:) for inline images in templates
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://js.stripe.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https:",
  "connect-src 'self' https://api.stripe.com https://*.vimeo.com",
  "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://player.vimeo.com",
  "frame-ancestors 'self'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
].join("; ");

// Security headers applied to every response.
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
  // Report-Only header — violations get logged but pages still render. Flip to
  // "Content-Security-Policy" (without -Report-Only) to enforce.
  { key: "Content-Security-Policy-Report-Only", value: csp },
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
