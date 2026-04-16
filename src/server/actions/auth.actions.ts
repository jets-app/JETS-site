"use server";

import bcrypt from "bcryptjs";
import { db } from "@/server/db";
import { signIn } from "@/server/auth";
import { registerSchema } from "@/lib/validators/auth";
import { AuthError } from "next-auth";

export async function registerUser(formData: {
  name: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
}) {
  const validated = registerSchema.safeParse(formData);

  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const { name, email, phone, password } = validated.data;

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

    // Create user (default role: PARENT)
    await db.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        phone: phone || null,
        passwordHash,
        role: "PARENT",
        status: "ACTIVE",
      },
    });

    // Auto-login after registration
    try {
      await signIn("credentials", {
        email: email.toLowerCase(),
        password,
        redirect: false,
      });
    } catch {
      // If auto-login fails, still return success — they can log in manually
    }

    return { success: "Account created successfully!" };
  } catch (error) {
    console.error("Registration error:", error);
    return { error: "Something went wrong. Please try again later." };
  }
}

export async function loginUser(formData: {
  email: string;
  password: string;
}) {
  try {
    await signIn("credentials", {
      email: formData.email.toLowerCase(),
      password: formData.password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    // NextAuth v5 throws a NEXT_REDIRECT on successful sign-in via server actions.
    // This must be re-thrown so Next.js can handle the redirect.
    if (error instanceof Error && "digest" in error) {
      throw error;
    }
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        return { error: "Invalid email or password" };
      }
    }
    return { error: "Something went wrong. Please try again." };
  }
}
