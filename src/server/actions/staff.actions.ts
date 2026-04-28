"use server";

import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { db } from "@/server/db";
import { auth } from "@/server/auth";
import { sendEmail } from "@/server/email";

const STAFF_ROLES = ["ADMIN", "PRINCIPAL", "SECRETARY", "REVIEWER"] as const;
type StaffRole = (typeof STAFF_ROLES)[number];

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Admin access required");
  }
  return session.user;
}

export async function listStaff() {
  await requireAdmin();
  return db.user.findMany({
    where: { role: { in: ["ADMIN", "PRINCIPAL", "SECRETARY", "REVIEWER"] } },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      createdAt: true,
    },
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
  });
}

async function sendPasswordSetupEmail(
  email: string,
  name: string,
  isNewAccount: boolean,
) {
  // Wipe any existing reset tokens for this email so the new one is the only valid one
  await db.passwordResetToken.deleteMany({ where: { email } });

  const token = nanoid(48);
  await db.passwordResetToken.create({
    data: {
      email,
      token,
      // 24h on first-time setup so a busy principal still has time
      expires: new Date(Date.now() + 86400000),
    },
  });

  const appUrl = process.env.AUTH_URL ?? "https://app.jetscollege.org";
  const resetLink = `${appUrl}/reset-password?token=${token}`;

  const subject = isNewAccount
    ? "Set Your JETS School Account Password"
    : "Reset Your JETS School Password";
  const intro = isNewAccount
    ? "An account has been created for you on the JETS School admissions portal."
    : "An administrator has triggered a password reset for your account.";

  const result = await sendEmail({
    to: email,
    subject,
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;padding:20px;">
        <div style="text-align:center;padding:20px 0;border-bottom:2px solid #A30018;">
          <h1 style="color:#A30018;font-size:24px;margin:0;">JETS School</h1>
        </div>
        <div style="padding:30px 0;line-height:1.6;color:#333;">
          <p>Hi ${name},</p>
          <p>${intro} Click the button below to set your password and sign in.</p>
          <p style="text-align:center;margin:30px 0;">
            <a href="${resetLink}" style="background:#A30018;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;">
              Set My Password
            </a>
          </p>
          <p style="color:#666;font-size:14px;">This link expires in 24 hours. After setting your password, sign in at <a href="${appUrl}/login">${appUrl}/login</a>.</p>
        </div>
        <div style="border-top:1px solid #eee;padding:20px 0;text-align:center;color:#999;font-size:12px;">
          Jewish Educational Trade School<br>16601 Rinaldi Street, Granada Hills, CA 91344
        </div>
      </div>
    `,
  });

  return result;
}

export async function createStaff(input: {
  email: string;
  name: string;
  role: StaffRole;
}) {
  const me = await requireAdmin();

  const email = input.email.toLowerCase().trim();
  const name = input.name.trim();
  if (!email || !name) {
    return { error: "Name and email are required." };
  }
  if (!STAFF_ROLES.includes(input.role)) {
    return { error: "Invalid role." };
  }

  // Block accidentally downgrading yourself by re-adding your own email with
  // a non-ADMIN role. (Edits to other people are fine.)
  if (email === me.email && input.role !== "ADMIN") {
    return {
      error:
        "That's your own account. Changing your role here would lock you out — pick a different email.",
    };
  }

  // Random placeholder password — they'll set their real one via the reset link
  const placeholderHash = await bcrypt.hash(nanoid(32), 10);

  const existing = await db.user.findUnique({ where: { email } });
  let isNewAccount = false;
  if (existing) {
    // Already exists — just upgrade role + status (don't overwrite their password)
    await db.user.update({
      where: { id: existing.id },
      data: { role: input.role, status: "ACTIVE", name },
    });
  } else {
    isNewAccount = true;
    await db.user.create({
      data: {
        email,
        name,
        role: input.role,
        status: "ACTIVE",
        passwordHash: placeholderHash,
      },
    });
  }

  const emailResult = await sendPasswordSetupEmail(email, name, isNewAccount);

  revalidatePath("/admin/settings/staff");

  return {
    success: true,
    isNewAccount,
    emailDelivered: emailResult.success,
    emailError: emailResult.error,
  };
}

export async function resendPasswordSetup(userId: string) {
  await requireAdmin();
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  });
  if (!user) return { error: "User not found." };

  const result = await sendPasswordSetupEmail(user.email, user.name, false);
  return {
    success: result.success,
    error: result.error,
  };
}

export async function updateStaff(input: {
  userId: string;
  name: string;
  email: string;
  role: StaffRole;
}) {
  const me = await requireAdmin();

  if (!STAFF_ROLES.includes(input.role)) {
    return { error: "Invalid role." };
  }

  const user = await db.user.findUnique({ where: { id: input.userId } });
  if (!user) return { error: "User not found." };

  // Don't let an admin downgrade themselves to a non-admin and lock themselves out
  if (user.id === me.id && input.role !== "ADMIN") {
    return { error: "You can't change your own role away from Admin." };
  }

  const newEmail = input.email.toLowerCase().trim();
  const newName = input.name.trim();

  // If email is changing, make sure it's not already taken
  if (newEmail !== user.email) {
    const existing = await db.user.findUnique({ where: { email: newEmail } });
    if (existing && existing.id !== user.id) {
      return { error: "That email is already in use by another account." };
    }
  }

  await db.user.update({
    where: { id: user.id },
    data: { name: newName, email: newEmail, role: input.role },
  });

  revalidatePath("/admin/settings/staff");
  return { success: true };
}

export async function deleteStaff(userId: string) {
  const me = await requireAdmin();

  if (userId === me.id) {
    return { error: "You can't delete your own account." };
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, email: true },
  });
  if (!user) return { error: "User not found." };

  // Only allow deleting staff accounts via this action — never a parent
  if (!(STAFF_ROLES as readonly string[]).includes(user.role)) {
    return { error: "Only staff accounts can be removed here." };
  }

  // If they have any audit/login history, downgrade to INACTIVE PARENT instead
  // of hard-delete to preserve history. Otherwise, hard-delete.
  const [auditCount, loginCount] = await Promise.all([
    db.auditLog.count({ where: { actorId: user.id } }),
    db.loginEvent.count({ where: { userId: user.id } }),
  ]);

  if (auditCount > 0 || loginCount > 0) {
    // Soft-delete: strip access by demoting + deactivating, keep historical records
    await db.user.update({
      where: { id: user.id },
      data: { role: "PARENT", status: "INACTIVE" },
    });
    // Wipe any pending password reset tokens for this email
    await db.passwordResetToken.deleteMany({ where: { email: user.email } });
    revalidatePath("/admin/settings/staff");
    return { success: true, mode: "deactivated" as const };
  }

  await db.passwordResetToken.deleteMany({ where: { email: user.email } });
  await db.user.delete({ where: { id: user.id } });

  revalidatePath("/admin/settings/staff");
  return { success: true, mode: "deleted" as const };
}
