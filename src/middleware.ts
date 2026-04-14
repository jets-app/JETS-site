import NextAuth from "next-auth";
import { authConfig } from "@/server/auth.config";

// Use a lightweight auth config for middleware that doesn't import db
const { auth } = NextAuth({
  ...authConfig,
  providers: [], // No providers needed in middleware - just checking JWT
});

export default auth;

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
