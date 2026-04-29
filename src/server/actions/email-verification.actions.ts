"use server";

import { nanoid } from "nanoid";
import { cookies } from "next/headers";
import { db } from "@/server/db";
import { sendEmail } from "@/server/email";
import { rateLimitPasswordReset } from "@/server/security/rate-limit";

const VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Issues a fresh verification token for `email` and sends the verification
 * link. Idempotent — wipes any prior tokens for this address first.
 */
async function issueVerificationToken(email: string, name: string) {
  const normalized = email.toLowerCase().trim();

  await db.verificationToken.deleteMany({ where: { identifier: normalized } });

  const token = nanoid(48);
  await db.verificationToken.create({
    data: {
      identifier: normalized,
      token,
      expires: new Date(Date.now() + VERIFICATION_TTL_MS),
    },
  });

  const appUrl = process.env.AUTH_URL ?? "https://app.jetscollege.org";
  const link = `${appUrl}/verify-email?token=${token}`;

  return sendEmail({
    to: normalized,
    subject: "Verify your email — JETS School",
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;padding:20px;">
        <div style="text-align:center;padding:20px 0;border-bottom:2px solid #A30018;">
          <h1 style="color:#A30018;font-size:24px;margin:0;">JETS School</h1>
        </div>
        <div style="padding:30px 0;line-height:1.6;color:#333;">
          <p>Hi ${name},</p>
          <p>Thanks for creating a JETS School account. Please verify your email address to finish signing up.</p>
          <p style="text-align:center;margin:30px 0;">
            <a href="${link}" style="background:#A30018;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;">
              Verify My Email
            </a>
          </p>
          <p style="color:#666;font-size:14px;">This link expires in 24 hours. If you didn't create an account, you can ignore this email.</p>
        </div>
        <div style="border-top:1px solid #eee;padding:20px 0;text-align:center;color:#999;font-size:12px;">
          Jewish Educational Trade School<br>16601 Rinaldi Street, Granada Hills, CA 91344
        </div>
      </div>
    `,
  });
}

export async function sendVerificationOnSignup(email: string, name: string) {
  // Stash the pending email in an httpOnly cookie so the /verify-email page
  // can poll for completion without us having to expose the email lookup
  // publicly. The cookie is read-only from the browser's perspective.
  const jar = await cookies();
  jar.set("jets-pending-verify", email.toLowerCase().trim(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24, // 24h, same as the verification token
  });
  return issueVerificationToken(email, name);
}

/**
 * Polled by /verify-email every few seconds. Returns whether the email in
 * the user's pending-verify cookie has flipped to verified — used to auto-
 * redirect the original device when the user clicks the link on another.
 */
export async function checkPendingVerification() {
  const jar = await cookies();
  const pending = jar.get("jets-pending-verify")?.value;
  if (!pending) return { verified: false };

  const user = await db.user.findUnique({
    where: { email: pending },
    select: { emailVerified: true },
  });
  if (user?.emailVerified) {
    // Clean up the cookie so we stop polling
    jar.delete("jets-pending-verify");
    return { verified: true };
  }
  return { verified: false };
}

/**
 * Resends the verification email for whichever address is currently stored
 * in the pending-verify cookie. No need for the user to retype.
 */
export async function resendPendingVerification() {
  const jar = await cookies();
  const pending = jar.get("jets-pending-verify")?.value;
  if (!pending) {
    return { error: "No pending verification — please register or use the resend page." };
  }

  const rl = await rateLimitPasswordReset(pending);
  if (!rl.ok) {
    return {
      success: "If an unverified account exists for that email, a new link has been sent.",
    };
  }

  const user = await db.user.findUnique({
    where: { email: pending },
    select: { name: true, emailVerified: true },
  });

  if (user && !user.emailVerified) {
    await issueVerificationToken(pending, user.name).catch((e) =>
      console.error("[resendPendingVerification] failed:", e),
    );
  }

  return {
    success: "Verification link sent. Check your inbox (and spam folder).",
  };
}

/**
 * Looks up the token, marks the user verified, and deletes the token.
 * Returns the user's email on success so the client can redirect to login
 * with a friendly success state.
 */
export async function verifyEmailToken(token: string) {
  if (!token) return { error: "Missing verification token." };

  const record = await db.verificationToken.findUnique({ where: { token } });
  if (!record) {
    return { error: "Invalid or expired verification link. Request a new one." };
  }
  if (record.expires < new Date()) {
    await db.verificationToken.delete({ where: { token } }).catch(() => {});
    return { error: "This verification link has expired. Request a new one." };
  }

  const user = await db.user.findUnique({
    where: { email: record.identifier },
    select: { id: true, emailVerified: true, email: true },
  });
  if (!user) return { error: "Account not found." };

  if (!user.emailVerified) {
    await db.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date(), status: "ACTIVE" },
    });
  }
  await db.verificationToken.delete({ where: { token } }).catch(() => {});

  // If the same browser still has the pending-verify cookie (e.g. user clicked
  // the link in the same window they registered from), clear it — there's no
  // longer anything to poll for.
  const jar = await cookies();
  if (jar.get("jets-pending-verify")?.value === user.email) {
    jar.delete("jets-pending-verify");
  }

  return { success: true, email: user.email };
}

/**
 * User-initiated resend (e.g. they click "send me a new link" on the
 * verification-required screen). Rate-limited like password reset.
 */
export async function resendVerification(email: string) {
  const normalized = email.toLowerCase().trim();
  if (!normalized) return { error: "Please enter your email." };

  const rl = await rateLimitPasswordReset(normalized);
  if (!rl.ok) {
    // Generic response to avoid leaking which emails are real
    return {
      success: "If an unverified account exists for that email, we've sent a new verification link.",
    };
  }

  const user = await db.user.findUnique({
    where: { email: normalized },
    select: { name: true, emailVerified: true },
  });

  // Only send if there's an unverified account. Don't reveal existence either way.
  if (user && !user.emailVerified) {
    await issueVerificationToken(normalized, user.name).catch((e) =>
      console.error("[resendVerification] failed:", e),
    );
  }

  return {
    success: "If an unverified account exists for that email, we've sent a new verification link.",
  };
}
