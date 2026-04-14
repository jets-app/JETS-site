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
        "/login",
        "/register",
        "/verify-email",
      ];
      const isPublicRoute =
        publicRoutes.includes(path) ||
        path.startsWith("/r/") ||
        path.startsWith("/d/") ||
        path.startsWith("/api/webhooks");

      if (isPublicRoute) return true;

      if (!isLoggedIn) {
        return Response.redirect(new URL("/login", nextUrl));
      }

      const role = auth?.user?.role;

      if (path.startsWith("/admin") && role !== "ADMIN") {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      if (
        path.startsWith("/review") &&
        role !== "PRINCIPAL" &&
        role !== "REVIEWER" &&
        role !== "ADMIN"
      ) {
        return Response.redirect(new URL("/dashboard", nextUrl));
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
