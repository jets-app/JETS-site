"use server";

import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { db } from "@/server/db";
import { auth } from "@/server/auth";
import { sendEmail } from "@/server/email";
import { revalidatePath } from "next/cache";

const TTL_MS = 24 * 60 * 60 * 1000; // 24h to confirm + 24h to revert (after confirm)

const APP_URL = () => process.env.AUTH_URL ?? "https://app.jetscollege.org";

/**
 * Step 1 — user fills in their new email + current password on the profile
 * page. We DON'T change anything yet. Instead we issue tokens and email both
 * the new address (to confirm) and the old address (to revert later).
 */
export async function requestEmailChange(input: {
  newEmail: string;
  currentPassword: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be signed in." };
  }

  const newEmail = input.newEmail.trim().toLowerCase();
  if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
    return { error: "Please enter a valid email address." };
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, name: true, passwordHash: true },
  });
  if (!user || !user.passwordHash) {
    return { error: "Account not found." };
  }

  if (newEmail === user.email.toLowerCase()) {
    return { error: "That's already your current email." };
  }

  // Verify password — proves it's really them initiating the change
  const passwordOk = await bcrypt.compare(input.currentPassword, user.passwordHash);
  if (!passwordOk) {
    return { error: "Current password is incorrect." };
  }

  // Block if the new address is already taken by another account
  const taken = await db.user.findUnique({
    where: { email: newEmail },
    select: { id: true },
  });
  if (taken && taken.id !== user.id) {
    return { error: "That email is already in use by another account." };
  }

  // Wipe any older pending requests for this user so we don't keep stale tokens around
  await db.emailChangeRequest.deleteMany({
    where: { userId: user.id, confirmedAt: null },
  });

  const confirmToken = nanoid(48);
  const revertToken = nanoid(48);
  const expiresAt = new Date(Date.now() + TTL_MS);

  await db.emailChangeRequest.create({
    data: {
      userId: user.id,
      oldEmail: user.email,
      newEmail,
      confirmToken,
      revertToken,
      expiresAt,
    },
  });

  const confirmLink = `${APP_URL()}/profile/confirm-email?token=${confirmToken}`;

  // Email the NEW address to confirm
  await sendEmail({
    to: newEmail,
    subject: "Confirm your new email — JETS School",
    html: emailTemplate({
      heading: "Confirm your new email",
      body: `
        <p>Hi ${user.name},</p>
        <p>You requested to change your JETS School account email to this address. Click below to confirm — this link is valid for 24 hours.</p>
      `,
      ctaLabel: "Confirm new email",
      ctaHref: confirmLink,
      footerNote: "If you didn't request this change, you can safely ignore this email.",
    }),
  }).catch((e) => console.error("[requestEmailChange] confirm email failed:", e));

  // Heads-up to the OLD address — they should know a change was requested
  await sendEmail({
    to: user.email,
    subject: "Email change requested — JETS School",
    html: emailTemplate({
      heading: "Email change requested",
      body: `
        <p>Hi ${user.name},</p>
        <p>We received a request to change your JETS School account email from <strong>${user.email}</strong> to <strong>${newEmail}</strong>.</p>
        <p>The change won't take effect until the new address is confirmed. <strong>If you didn't request this</strong>, sign in immediately and reset your password — your account may be compromised.</p>
      `,
      ctaLabel: "Sign in",
      ctaHref: `${APP_URL()}/login`,
      footerNote: "After the new address is confirmed, you'll get another email with a 24-hour revert link.",
    }),
  }).catch((e) => console.error("[requestEmailChange] heads-up email failed:", e));

  return {
    success: true,
    message: `Confirmation sent to ${newEmail}. Click the link there to finalize the change.`,
  };
}

/**
 * Step 2 — new email clicks the confirm link. We finalize the change here
 * and email the OLD address with a revert link for the next 24 hours.
 */
export async function confirmEmailChange(token: string) {
  if (!token) return { error: "Missing token." };

  const request = await db.emailChangeRequest.findUnique({
    where: { confirmToken: token },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  if (!request) return { error: "Invalid or expired link." };
  if (request.confirmedAt) {
    return { error: "This change has already been confirmed." };
  }
  if (request.expiresAt < new Date()) {
    return { error: "This link has expired. Request a new email change from your profile." };
  }

  // Defensive: another account may have grabbed this email since the request
  // was created. Block if it's now taken by someone else.
  const taken = await db.user.findUnique({
    where: { email: request.newEmail },
    select: { id: true },
  });
  if (taken && taken.id !== request.userId) {
    return { error: "That email is now in use by another account. Please request the change again with a different address." };
  }

  // Apply the change: update user email + verified timestamp, mark request confirmed.
  // Extend expiresAt by 24h from confirmation so the revert window is exactly 24h.
  const newRevertExpiresAt = new Date(Date.now() + TTL_MS);
  await db.$transaction([
    db.user.update({
      where: { id: request.userId },
      data: { email: request.newEmail, emailVerified: new Date() },
    }),
    db.emailChangeRequest.update({
      where: { id: request.id },
      data: { confirmedAt: new Date(), expiresAt: newRevertExpiresAt },
    }),
  ]);

  // Email the OLD address with the revert link
  const revertLink = `${APP_URL()}/profile/revert-email?token=${request.revertToken}`;
  await sendEmail({
    to: request.oldEmail,
    subject: "Your JETS email was changed",
    html: emailTemplate({
      heading: "Your email was changed",
      body: `
        <p>Hi ${request.user.name},</p>
        <p>Your JETS School account email is now <strong>${request.newEmail}</strong>.</p>
        <p><strong>If this was you, no action is needed.</strong></p>
        <p>If this wasn't you, click the button below within the next 24 hours to revert the change and lock the account. We'll roll back the email and sign out every active session.</p>
      `,
      ctaLabel: "Revert this change",
      ctaHref: revertLink,
      footerNote: "After 24 hours this link expires and the change becomes permanent.",
    }),
  }).catch((e) => console.error("[confirmEmailChange] revert email failed:", e));

  revalidatePath("/portal/profile");
  return { success: true, newEmail: request.newEmail };
}

/**
 * Step 3 (optional) — old email clicks revert. Roll the address back, kill
 * all sessions (assume compromise). Token-only auth — they can do this even
 * if locked out.
 */
export async function revertEmailChange(token: string) {
  if (!token) return { error: "Missing token." };

  const request = await db.emailChangeRequest.findUnique({
    where: { revertToken: token },
    include: { user: { select: { id: true, email: true, name: true } } },
  });
  if (!request) return { error: "Invalid or expired link." };
  if (request.revertedAt) {
    return { error: "This change has already been reverted." };
  }
  if (!request.confirmedAt) {
    return { error: "This change was never confirmed; nothing to revert." };
  }
  if (request.expiresAt < new Date()) {
    return { error: "The 24-hour revert window has passed. If you suspect compromise, contact support." };
  }

  // Make sure the OLD email isn't already taken by someone else (very unlikely but possible)
  const taken = await db.user.findUnique({
    where: { email: request.oldEmail },
    select: { id: true },
  });
  if (taken && taken.id !== request.userId) {
    return { error: "Your previous email is now in use by another account. Contact support." };
  }

  // Roll back + bump sessionVersion so every device gets logged out
  await db.$transaction([
    db.user.update({
      where: { id: request.userId },
      data: {
        email: request.oldEmail,
        sessionVersion: { increment: 1 },
      },
    }),
    db.emailChangeRequest.update({
      where: { id: request.id },
      data: { revertedAt: new Date() },
    }),
  ]);

  // Notify the new address so they're not surprised
  await sendEmail({
    to: request.newEmail,
    subject: "JETS email change was reverted",
    html: emailTemplate({
      heading: "Email change reverted",
      body: `
        <p>The owner of <strong>${request.oldEmail}</strong> reverted the email change. Their JETS School account is back to that address and all sessions have been signed out.</p>
        <p>If this is unexpected, contact JETS at <a href="mailto:info@jetsschool.org">info@jetsschool.org</a>.</p>
      `,
      ctaLabel: null,
      ctaHref: null,
      footerNote: null,
    }),
  }).catch((e) => console.error("[revertEmailChange] notify email failed:", e));

  return { success: true, restoredEmail: request.oldEmail };
}

// Shared minimal HTML email template
function emailTemplate(args: {
  heading: string;
  body: string;
  ctaLabel: string | null;
  ctaHref: string | null;
  footerNote: string | null;
}) {
  const cta = args.ctaLabel && args.ctaHref
    ? `<p style="text-align:center;margin:30px 0;">
         <a href="${args.ctaHref}" style="background:#A30018;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;">${args.ctaLabel}</a>
       </p>`
    : "";
  const footer = args.footerNote
    ? `<p style="color:#666;font-size:14px;">${args.footerNote}</p>`
    : "";
  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;padding:20px;">
      <div style="text-align:center;padding:20px 0;border-bottom:2px solid #A30018;">
        <h1 style="color:#A30018;font-size:24px;margin:0;">JETS School</h1>
      </div>
      <div style="padding:30px 0;line-height:1.6;color:#333;">
        <h2 style="color:#1a1a1a;font-size:18px;margin:0 0 16px;">${args.heading}</h2>
        ${args.body}
        ${cta}
        ${footer}
      </div>
      <div style="border-top:1px solid #eee;padding:20px 0;text-align:center;color:#999;font-size:12px;">
        Jewish Educational Trade School<br>16601 Rinaldi Street, Granada Hills, CA 91344
      </div>
    </div>
  `;
}
