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

  return { success: "Account created successfully. Please log in." };
}

export async function loginUser(formData: {
  email: string;
  password: string;
}) {
  try {
    await signIn("credentials", {
      email: formData.email.toLowerCase(),
      password: formData.password,
      redirect: false,
    });

    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        return { error: "Invalid email or password" };
      }
    }
    return { error: "Something went wrong. Please try again." };
  }
}
