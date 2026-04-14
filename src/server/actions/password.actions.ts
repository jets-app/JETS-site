"use server";

import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { db } from "@/server/db";

export async function requestPasswordReset(formData: { email: string }) {
  const email = formData.email.toLowerCase().trim();

  if (!email) {
    return { error: "Please enter your email address" };
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

    // TODO: Send email with reset link via Resend
    // For now, log the token (remove in production)
    console.log(`Password reset link: /reset-password?token=${token}`);

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
