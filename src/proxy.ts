import NextAuth from "next-auth";
import { authConfig } from "@/server/auth.config";
import { NextResponse, type NextRequest } from "next/server";

// Use a lightweight auth config for proxy that doesn't import db
const { auth } = NextAuth({
  ...authConfig,
  providers: [], // No providers needed in proxy - just checking JWT
});

const APP_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/dashboard",
  "/portal",
  "/admin",
  "/review",
];
const PUBLIC_PATHS = [
  "/about",
  "/programs",
  "/faculty",
  "/contact",
  "/inquire",
  "/v1",
  "/v2",
];

function matchesPath(path: string, list: string[]) {
  return list.some((p) => path === p || path.startsWith(p + "/"));
}

// Next.js 16 requires "proxy" as the export name (replaces "middleware")
export async function proxy(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const path = request.nextUrl.pathname;

  // Skip routing for api, next internals, files with extensions, tokenized routes
  const isAuthenticatable =
    !path.startsWith("/api/") &&
    !path.startsWith("/_next/") &&
    !path.startsWith("/d/") &&
    !path.startsWith("/r/") &&
    !path.includes(".");

  if (isAuthenticatable) {
    const isAppHost = host.startsWith("app.") || host.includes("jets-crm.vercel.app");
    const isMarketingHost = host === "jetscollege.org" || host === "www.jetscollege.org";

    // On jetscollege.org, redirect CRM paths to app.jetscollege.org
    if (isMarketingHost && matchesPath(path, APP_PATHS)) {
      const url = new URL(request.url);
      url.host = "app.jetscollege.org";
      url.protocol = "https:";
      return NextResponse.redirect(url);
    }

    // On app.jetscollege.org, redirect public marketing paths to jetscollege.org
    if (isAppHost && matchesPath(path, PUBLIC_PATHS)) {
      const url = new URL(request.url);
      url.host = "jetscollege.org";
      url.protocol = "https:";
      return NextResponse.redirect(url);
    }

    // On app host, root should go to /login
    if (isAppHost && path === "/") {
      const url = new URL(request.url);
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  return (auth as any)(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
