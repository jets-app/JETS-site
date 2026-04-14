"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { db } from "@/server/db";
import { auth } from "@/server/auth";
import {
  updateProfileSchema,
  updateEmailSchema,
  changePasswordSchema,
} from "@/lib/validators/profile";

// ---------- Helpers ----------

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized: Please sign in");
  }
  return session.user.id as string;
}

const MAX_AVATAR_LENGTH = 7_000_000; // ~5MB binary

// ---------- Update Profile (name, phone, avatar) ----------

export async function updateProfile(data: {
  name: string;
  phone?: string;
  avatarUrl?: string;
}) {
  try {
    const userId = await requireUserId();

    const parsed = updateProfileSchema.safeParse(data);
    if (!parsed.success) {
      return {
        error: parsed.error.issues[0]?.message ?? "Invalid input",
      };
    }

    const { name, phone, avatarUrl } = parsed.data;

    // Validate avatar data url if provided
    if (avatarUrl && avatarUrl.length > 0) {
      if (!avatarUrl.startsWith("data:image/") && !avatarUrl.startsWith("http")) {
        return { error: "Invalid image format." };
      }
      if (avatarUrl.length > MAX_AVATAR_LENGTH) {
        return {
          error: "Image is too large. Please use an image under 5MB.",
        };
      }
    }

    await db.user.update({
      where: { id: userId },
      data: {
        name: name.trim(),
        phone: phone && phone.trim().length > 0 ? phone.trim() : null,
        ...(avatarUrl !== undefined && {
          avatarUrl: avatarUrl && avatarUrl.length > 0 ? avatarUrl : null,
        }),
      },
    });

    revalidatePath("/portal/profile");
    revalidatePath("/portal", "layout");
    return { success: true };
  } catch (err) {
    console.error("updateProfile error:", err);
    return {
      error: err instanceof Error ? err.message : "Failed to update profile",
    };
  }
}

// ---------- Update Email ----------

export async function updateEmail(newEmail: string, currentPassword: string) {
  try {
    const userId = await requireUserId();

    const parsed = updateEmailSchema.safeParse({
      email: newEmail,
      currentPassword,
    });
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, passwordHash: true },
    });

    if (!user || !user.passwordHash) {
      return { error: "Account not found or password not set." };
    }

    const normalized = parsed.data.email.trim().toLowerCase();

    if (normalized === user.email.toLowerCase()) {
      return { error: "This is already your email address." };
    }

    // Verify password
    const ok = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
    if (!ok) {
      return { error: "Current password is incorrect." };
    }

    // Check for duplicate
    const existing = await db.user.findUnique({
      where: { email: normalized },
      select: { id: true },
    });
    if (existing && existing.id !== userId) {
      return { error: "That email address is already in use." };
    }

    await db.user.update({
      where: { id: userId },
      data: { email: normalized, emailVerified: null },
    });

    revalidatePath("/portal/profile");
    revalidatePath("/portal", "layout");
    return { success: true };
  } catch (err) {
    console.error("updateEmail error:", err);
    return {
      error: err instanceof Error ? err.message : "Failed to update email",
    };
  }
}

// ---------- Change Password ----------

export async function changePassword(
  currentPassword: string,
  newPassword: string,
  confirmPassword?: string
) {
  try {
    const userId = await requireUserId();

    const parsed = changePasswordSchema.safeParse({
      currentPassword,
      newPassword,
      confirmPassword: confirmPassword ?? newPassword,
    });
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true },
    });

    if (!user || !user.passwordHash) {
      return { error: "Account not found or password not set." };
    }

    const ok = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
    if (!ok) {
      return { error: "Current password is incorrect." };
    }

    if (parsed.data.currentPassword === parsed.data.newPassword) {
      return { error: "New password must differ from current password." };
    }

    const newHash = await bcrypt.hash(parsed.data.newPassword, 10);

    await db.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });

    revalidatePath("/portal/profile");
    return { success: true };
  } catch (err) {
    console.error("changePassword error:", err);
    return {
      error: err instanceof Error ? err.message : "Failed to change password",
    };
  }
}
