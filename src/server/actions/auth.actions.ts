"use server";

import bcrypt from "bcryptjs";
import { db } from "@/server/db";
import { signIn } from "@/server/auth";
import { registerSchema } from "@/lib/validators/auth";
import { AuthError } from "next-auth";
import { rateLimitRegistration } from "@/server/security/rate-limit";
import { sendVerificationOnSignup } from "@/server/actions/email-verification.actions";

export async function registerUser(formData: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
}) {
  const rl = await rateLimitRegistration();
  if (!rl.ok) {
    return {
      error: "Too many sign-up attempts from this network. Please wait a few minutes and try again.",
    };
  }

  const validated = registerSchema.safeParse(formData);

  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const { firstName, lastName, email, phone, password } = validated.data;
  const name = `${firstName} ${lastName}`;

  try {
    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return { error: "An account with this email already exists" };
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user as PENDING_VERIFICATION — emailVerified stays null until
    // they click the link in the email we're about to send.
    await db.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        phone: phone || null,
        passwordHash,
        role: "PARENT",
        status: "PENDING_VERIFICATION",
      },
    });

    // Send verification email. Errors here are best-effort — we don't fail
    // the registration just because Resend hiccupped. The user can request
    // a resend from the post-signup screen.
    const emailResult = await sendVerificationOnSignup(email.toLowerCase(), name).catch((e) => {
      console.error("[register] verification email failed:", e);
      return { success: false, error: String(e) };
    });

    return {
      success: "Account created. Check your inbox for a verification link to finish signing up.",
      email: email.toLowerCase(),
      emailDelivered: "success" in emailResult ? !!emailResult.success : false,
    };
  } catch (error) {
    console.error("Registration error:", error);
    return { error: "Something went wrong. Please try again later." };
  }
}

export async function loginUser(formData: {
  email: string;
  password: string;
  totpCode?: string;
  callbackUrl?: string;
}) {
  try {
    await signIn("credentials", {
      email: formData.email.toLowerCase(),
      password: formData.password,
      totpCode: formData.totpCode ?? "",
      redirectTo: formData.callbackUrl || "/dashboard",
    });
  } catch (error) {
    // NextAuth v5 throws a NEXT_REDIRECT on successful sign-in via server actions.
    // This must be re-thrown so Next.js can handle the redirect.
    if (error instanceof Error && "digest" in error) {
      throw error;
    }
    if (error instanceof AuthError) {
      // The authorize callback throws plain Error(...) for cases that need
      // distinct UI: rate limiting, email-not-verified. NextAuth wraps them
      // in a CallbackRouteError; sniff the cause to recover the original.
      const cause = (error as { cause?: { err?: { message?: string } } })?.cause?.err?.message;
      if (cause === "RATE_LIMITED") {
        return {
          error:
            "Too many sign-in attempts. Please wait 15 minutes and try again, or use 'Forgot?' to reset your password.",
        };
      }
      if (cause === "EMAIL_NOT_VERIFIED") {
        return {
          error: "EMAIL_NOT_VERIFIED",
          email: formData.email.toLowerCase(),
        };
      }
      if (cause === "TOTP_REQUIRED") {
        return { error: "TOTP_REQUIRED" };
      }
      if (cause === "TOTP_INVALID") {
        return { error: "TOTP_INVALID" };
      }
      if (error.type === "CredentialsSignin") {
        return { error: "Invalid email or password" };
      }
    }
    console.error("Login error:", error);
    return { error: "Something went wrong. Please try again." };
  }
}
