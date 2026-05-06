import type { NextAuthConfig } from "next-auth";

// This config is used by BOTH middleware (Edge) and server (Node.js)
// Do NOT import anything that requires Node.js here (no db, no bcrypt, no pg)
export const authConfig: NextAuthConfig = {
  providers: [], // Providers are added in auth.ts (Node.js only)
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const path = nextUrl.pathname;

      // Public routes
      const publicRoutes = [
        "/",
        "/about",
        "/programs",
        "/faculty",
        "/contact",
        "/inquire",
        "/privacy",
        "/terms",
        "/donate",
        "/reapply",
        "/login",
        "/register",
        "/verify-email",
        "/forgot-password",
        "/reset-password",
      ];
      const isPublicRoute =
        publicRoutes.includes(path) ||
        path.startsWith("/r/") ||
        path.startsWith("/d/") ||
        path.startsWith("/api/auth") ||
        path.startsWith("/api/health") ||
        path.startsWith("/api/webhooks") ||
        path.startsWith("/sandbox") ||
        path.startsWith("/v1") ||
        path.startsWith("/v2");

      if (isPublicRoute) return true;

      if (!isLoggedIn) {
        return Response.redirect(new URL("/login", nextUrl));
      }

      const role = auth?.user?.role;
      const isStaff =
        role === "ADMIN" ||
        role === "PRINCIPAL" ||
        role === "SECRETARY" ||
        role === "REVIEWER";

      // Admin routes — any staff role. Per-page checks gate sensitive ops
      // (settings, billing, staff mgmt) to ADMIN only.
      if (path.startsWith("/admin")) {
        if (!isStaff) {
          return Response.redirect(new URL("/portal/dashboard", nextUrl));
        }
      }

      // Review routes — PRINCIPAL, REVIEWER, SECRETARY, or ADMIN
      if (path.startsWith("/review")) {
        if (!isStaff) {
          return Response.redirect(new URL("/portal/dashboard", nextUrl));
        }
      }

      // Portal routes — kick staff over to the admin view. Parents stay.
      if (path.startsWith("/portal") && isStaff) {
        return Response.redirect(new URL("/admin/dashboard", nextUrl));
      }

      return true;
    },
  },
  pages: {
    signIn: "/login",
    newUser: "/register",
  },
  session: {
    strategy: "jwt",
  },
  cookies: {
    sessionToken: {
      name: "jets-session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    callbackUrl: {
      name: "jets-callback-url",
      options: {
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    csrfToken: {
      name: "jets-csrf-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
};
