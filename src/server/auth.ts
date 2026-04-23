import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { db } from "@/server/db";
import { authConfig } from "./auth.config";
import { recordSignIn } from "@/server/security/login-events";

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
