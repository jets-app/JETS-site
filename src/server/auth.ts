import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { db } from "@/server/db";
import { authConfig } from "./auth.config";
import { recordSignIn } from "@/server/security/login-events";
import { isFounder } from "@/lib/roles";
import { rateLimitLogin } from "@/server/security/rate-limit";

// Full auth config with providers (Node.js only — NOT used in middleware)
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Rate limit BEFORE bcrypt (which is intentionally slow).
        // Limits: 5/IP per 15 min, 10/email per hour.
        const rl = await rateLimitLogin(credentials.email as string);
        if (!rl.ok) {
          // Throw so the user sees a distinct error in the UI rather than the
          // generic "Invalid credentials" — they're locked out, not wrong.
          throw new Error("RATE_LIMITED");
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!passwordMatch) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.avatarUrl,
        };
      },
    }),
  ],
  events: {
    // Fired after a successful sign-in. Records the event and emails the user
    // if this is the first time we've seen this browser. Failures here never
    // block sign-in.
    async signIn({ user }) {
      try {
        if (!user?.id || !user.email) return;
        const h = await headers();
        const ua = h.get("user-agent") ?? "";
        const ip =
          h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
          h.get("x-real-ip") ??
          null;
        await recordSignIn({
          userId: user.id,
          userAgent: ua,
          ip,
          userEmail: user.email,
          userName: user.name ?? "there",
        });
      } catch (e) {
        console.error("recordSignIn failed:", e);
      }
    },
  },
  callbacks: {
    ...authConfig.callbacks,
    // Override jwt to enforce sessionVersion: when "Sign out all sessions" bumps
    // the user's sessionVersion, all existing JWTs become invalid on next read.
    async jwt({ token, user, trigger }) {
      // Initial sign-in — capture the user's current sessionVersion
      if (user) {
        token.id = user.id;
        token.role = (user as { role: string }).role;
        // Founder fallback: if this email is in FOUNDER_EMAILS, force ADMIN
        // both in the JWT and in the DB. Self-heals the row in case it got
        // accidentally downgraded via the staff manager.
        if (isFounder(user.email ?? null)) {
          token.role = "ADMIN";
          await db.user
            .update({
              where: { id: user.id as string },
              data: { role: "ADMIN", status: "ACTIVE" },
            })
            .catch((e) => console.error("[founder-heal] failed:", e));
        }
        const dbUser = await db.user.findUnique({
          where: { id: user.id as string },
          select: { sessionVersion: true },
        });
        token.sessionVersion = dbUser?.sessionVersion ?? 0;
        return token;
      }

      // Manual session refresh — re-read sessionVersion (lets caller bump it
      // and immediately verify their own session)
      if (trigger === "update" && token.id) {
        const dbUser = await db.user.findUnique({
          where: { id: token.id as string },
          select: { sessionVersion: true },
        });
        if (dbUser) token.sessionVersion = dbUser.sessionVersion;
        return token;
      }

      // On every other read: cheap version check. Only hits DB once per JWT
      // refresh cycle — Next.js caches the call within a single request.
      if (token.id) {
        const dbUser = await db.user.findUnique({
          where: { id: token.id as string },
          select: { sessionVersion: true },
        });
        // User deleted, or revoked all sessions → invalidate
        if (!dbUser || dbUser.sessionVersion !== token.sessionVersion) {
          return null;
        }
      }

      return token;
    },
  },
});
