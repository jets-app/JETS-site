"use server";

import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { db } from "@/server/db";
import { auth } from "@/server/auth";
import { sendEmail } from "@/server/email";

const STAFF_ROLES = ["ADMIN", "PRINCIPAL", "REVIEWER"] as const;
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
    where: { role: { in: ["ADMIN", "PRINCIPAL", "REVIEWER"] } },
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
  await requireAdmin();

  const email = input.email.toLowerCase().trim();
  const name = input.name.trim();
  if (!email || !name) {
    return { error: "Name and email are required." };
  }
  if (!STAFF_ROLES.includes(input.role)) {
    return { error: "Invalid role." };
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
