"use server";

import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { db } from "@/server/db";
import { rateLimitPasswordReset } from "@/server/security/rate-limit";

export async function requestPasswordReset(formData: { email: string }) {
  const email = formData.email.toLowerCase().trim();

  if (!email) {
    return { error: "Please enter your email address" };
  }

  // Rate limit so an attacker can't spam reset emails (DoS the user's inbox)
  // or use the endpoint to map valid emails.
  const rl = await rateLimitPasswordReset(email);
  if (!rl.ok) {
    // Mirror the generic success message — never reveal that the rate limit
    // was hit. Otherwise an attacker could probe for valid emails.
    return {
      success:
        "If an account with that email exists, we've sent a password reset link.",
    };
  }

  try {
    // Check if user exists
    const user = await db.user.findUnique({ where: { email } });

    // Always return success even if user doesn't exist (security - don't reveal if email is registered)
    if (!user) {
      return {
        success:
          "If an account with that email exists, we've sent a password reset link.",
      };
    }

    // Delete any existing reset tokens for this email
    await db.passwordResetToken.deleteMany({ where: { email } });

    // Create a new reset token (expires in 1 hour)
    const token = nanoid(48);
    await db.passwordResetToken.create({
      data: {
        email,
        token,
        expires: new Date(Date.now() + 3600000), // 1 hour
      },
    });

    const { sendEmail } = await import("@/server/email");
    const appUrl = process.env.AUTH_URL || "https://jets-crm.vercel.app";
    const resetLink = `${appUrl}/reset-password?token=${token}`;

    await sendEmail({
      to: email,
      subject: "Password Reset — JETS School",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #A30018;">
            <h1 style="color: #A30018; font-size: 24px; margin: 0;">JETS School</h1>
          </div>
          <div style="padding: 30px 0; line-height: 1.6; color: #333;">
            <p>Dear ${user.name},</p>
            <p>We received a request to reset your password. Click the button below to set a new password:</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="background: #A30018; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
                Reset Password
              </a>
            </p>
            <p style="color: #666; font-size: 14px;">This link expires in 1 hour. If you did not request a password reset, you can safely ignore this email.</p>
          </div>
          <div style="border-top: 1px solid #eee; padding: 20px 0; text-align: center; color: #999; font-size: 12px;">
            Jewish Educational Trade School<br>16601 Rinaldi Street, Granada Hills, CA 91344
          </div>
        </div>
      `,
    });

    return {
      success:
        "If an account with that email exists, we've sent a password reset link.",
    };
  } catch (error) {
    console.error("Password reset request error:", error);
    return { error: "Something went wrong. Please try again later." };
  }
}

export async function resetPassword(formData: {
  token: string;
  password: string;
  confirmPassword: string;
}) {
  const { token, password, confirmPassword } = formData;

  if (!token) {
    return { error: "Invalid reset link" };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters" };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match" };
  }

  try {
    // Find the token
    const resetToken = await db.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      return { error: "Invalid or expired reset link. Please request a new one." };
    }

    // Check if expired
    if (resetToken.expires < new Date()) {
      await db.passwordResetToken.delete({ where: { id: resetToken.id } });
      return { error: "This reset link has expired. Please request a new one." };
    }

    // Find the user
    const user = await db.user.findUnique({
      where: { email: resetToken.email },
    });

    if (!user) {
      return { error: "Account not found" };
    }

    // Hash new password and update
    const passwordHash = await bcrypt.hash(password, 12);
    await db.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    // Delete the used token
    await db.passwordResetToken.delete({ where: { id: resetToken.id } });

    return { success: "Password reset successfully! You can now sign in." };
  } catch (error) {
    console.error("Password reset error:", error);
    return { error: "Something went wrong. Please try again later." };
  }
}
