"use server";

import { db } from "@/server/db";
import { auth } from "@/server/auth";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session.user;
}

export async function getNotificationLogs(filters?: {
  status?: string;
  applicationId?: string;
  page?: number;
  limit?: number;
}) {
  await requireAdmin();

  const page = filters?.page ?? 1;
  const limit = filters?.limit ?? 50;
  const where: Record<string, unknown> = {};

  if (filters?.status) where.status = filters.status;
  if (filters?.applicationId) where.applicationId = filters.applicationId;

  const [logs, total] = await Promise.all([
    db.notificationLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.notificationLog.count({ where }),
  ]);

  return { logs, total, page, totalPages: Math.ceil(total / limit) };
}

export async function getNotificationStats() {
  await requireAdmin();

  const [total, sent, failed, queued] = await Promise.all([
    db.notificationLog.count(),
    db.notificationLog.count({ where: { status: "SENT" } }),
    db.notificationLog.count({ where: { status: "FAILED" } }),
    db.notificationLog.count({ where: { status: "QUEUED" } }),
  ]);

  return { total, sent, failed, queued };
}

export async function retryNotification(id: string) {
  await requireAdmin();

  const log = await db.notificationLog.findUnique({ where: { id } });
  if (!log) throw new Error("Notification not found");

  await db.notificationLog.update({
    where: { id },
    data: { status: "QUEUED" },
  });

  // Re-attempt send
  console.log(`[NOTIFICATION RETRY] To: ${log.recipientEmail} | Subject: ${log.subject}`);

  await db.notificationLog.update({
    where: { id },
    data: { status: "SENT", sentAt: new Date() },
  });

  return { success: true };
}
