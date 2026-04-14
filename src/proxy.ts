import NextAuth from "next-auth";
import { authConfig } from "@/server/auth.config";
import type { NextRequest } from "next/server";

// Use a lightweight auth config for proxy that doesn't import db
const { auth } = NextAuth({
  ...authConfig,
  providers: [], // No providers needed in proxy - just checking JWT
});

// Next.js 16 requires "proxy" as the export name (replaces "middleware")
export async function proxy(request: NextRequest) {
  return (auth as any)(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
