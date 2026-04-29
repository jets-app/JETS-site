"use server";

import { authenticator } from "otplib";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import QRCode from "qrcode";
import { db } from "@/server/db";
import { auth } from "@/server/auth";

// Six-digit codes, 30-second window. Allow ±1 window (60s drift) so a slow
// human doesn't get locked out by a millisecond-edge code.
authenticator.options = { window: 1, digits: 6, step: 30 };

const ISSUER = "JETS School";

/**
 * Step 1: generate a fresh TOTP secret + QR code for the signed-in user.
 * The secret is stored on the User row but `totpEnabled` stays false until
 * the user proves they can read it (step 2).
 */
export async function setupTOTP() {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not signed in." };

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, totpEnabled: true },
  });
  if (!user) return { error: "Account not found." };
  if (user.totpEnabled) {
    return { error: "Two-factor is already enabled. Disable it first to re-enroll." };
  }

  const secret = authenticator.generateSecret();
  const otpauth = authenticator.keyuri(user.email, ISSUER, secret);
  const qrCodeDataUrl = await QRCode.toDataURL(otpauth);

  await db.user.update({
    where: { id: user.id },
    data: { totpSecret: secret },
  });

  return {
    success: true,
    secret, // shown so user can manually enter if they can't scan QR
    qrCodeDataUrl,
  };
}

/**
 * Step 2: user enters a 6-digit code from their authenticator app. If valid,
 * mark TOTP enabled and generate one-time backup codes.
 *
 * Returns the plaintext backup codes ONCE. They're hashed in the DB; we never
 * show them again.
 */
export async function confirmTOTPSetup(code: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not signed in." };

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, totpSecret: true, totpEnabled: true },
  });
  if (!user) return { error: "Account not found." };
  if (user.totpEnabled) return { error: "Already enabled." };
  if (!user.totpSecret) {
    return { error: "Run setup again — no pending TOTP secret found." };
  }

  const ok = authenticator.verify({ token: code.trim(), secret: user.totpSecret });
  if (!ok) {
    return { error: "Code didn't match. Check your authenticator app and try again." };
  }

  // Generate 8 one-time backup codes — bcrypt-hashed in the DB
  const plaintextCodes: string[] = [];
  const hashedCodes: string[] = [];
  for (let i = 0; i < 8; i++) {
    const code = randomBytes(5).toString("hex"); // 10 hex chars, e.g. "a1b2c3d4e5"
    plaintextCodes.push(code);
    hashedCodes.push(await bcrypt.hash(code, 10));
  }

  await db.user.update({
    where: { id: user.id },
    data: { totpEnabled: true, totpBackupCodes: hashedCodes },
  });

  return { success: true, backupCodes: plaintextCodes };
}

/**
 * Disable 2FA. Requires current password to make sure it's really the user.
 */
export async function disableTOTP(currentPassword: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not signed in." };

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, passwordHash: true, totpEnabled: true },
  });
  if (!user || !user.passwordHash) return { error: "Account not found." };
  if (!user.totpEnabled) return { error: "Two-factor isn't enabled." };

  const ok = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!ok) return { error: "Current password is incorrect." };

  await db.user.update({
    where: { id: user.id },
    data: { totpSecret: null, totpEnabled: false, totpBackupCodes: [] },
  });

  return { success: true };
}

/**
 * Generate a fresh set of backup codes (invalidates the old set).
 * Used if the user has already burned through all their codes or thinks
 * they've been exposed. Requires current password.
 */
export async function regenerateBackupCodes(currentPassword: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not signed in." };

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, passwordHash: true, totpEnabled: true },
  });
  if (!user || !user.passwordHash) return { error: "Account not found." };
  if (!user.totpEnabled) return { error: "Two-factor isn't enabled." };

  const ok = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!ok) return { error: "Current password is incorrect." };

  const plaintextCodes: string[] = [];
  const hashedCodes: string[] = [];
  for (let i = 0; i < 8; i++) {
    const c = randomBytes(5).toString("hex");
    plaintextCodes.push(c);
    hashedCodes.push(await bcrypt.hash(c, 10));
  }

  await db.user.update({
    where: { id: user.id },
    data: { totpBackupCodes: hashedCodes },
  });

  return { success: true, backupCodes: plaintextCodes };
}
