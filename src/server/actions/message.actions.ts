"use server";

import { db } from "@/server/db";
import { auth } from "@/server/auth";
import type { ApplicationStatus } from "@prisma/client";

// ---------- Helpers ----------

async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized: Please sign in");
  }
  return session.user as { id: string; name?: string | null; role: string };
}

async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required");
  }
  return user;
}

const PAGE_SIZE = 20;

// ---------- Send Message ----------

export async function sendMessage(
  receiverId: string,
  subject: string,
  body: string
) {
  const user = await requireAdmin();

  if (!subject.trim() || !body.trim()) {
    throw new Error("Subject and body are required");
  }

  const receiver = await db.user.findUnique({
    where: { id: receiverId },
    select: { id: true },
  });

  if (!receiver) {
    throw new Error("Recipient not found");
  }

  const message = await db.message.create({
    data: {
      senderId: user.id,
      receiverId,
      subject: subject.trim(),
      body: body.trim(),
      emailSent: true, // TODO: integrate actual email sending
    },
  });

  return message;
}

// ---------- Send Bulk Message ----------

export async function sendBulkMessage(
  subject: string,
  body: string,
  filters?: {
    applicationStatus?: ApplicationStatus;
    academicYear?: string;
  }
) {
  const user = await requireAdmin();

  if (!subject.trim() || !body.trim()) {
    throw new Error("Subject and body are required");
  }

  // Build the where clause for finding parents
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parentWhere: any = { role: "PARENT" };

  if (filters?.applicationStatus || filters?.academicYear) {
    parentWhere.applications = { some: {} };
    if (filters.applicationStatus) {
      parentWhere.applications.some.status = filters.applicationStatus;
    }
    if (filters.academicYear) {
      parentWhere.applications.some.academicYear = filters.academicYear;
    }
  }

  const parents = await db.user.findMany({
    where: parentWhere,
    select: { id: true },
  });

  if (parents.length === 0) {
    throw new Error("No recipients match the selected filters");
  }

  // Build a bulk group label
  const bulkGroup = filters?.applicationStatus
    ? `status:${filters.applicationStatus}`
    : filters?.academicYear
      ? `year:${filters.academicYear}`
      : "all-parents";

  // Create individual messages for each parent
  const messages = await db.message.createMany({
    data: parents.map((p) => ({
      senderId: user.id,
      receiverId: p.id,
      subject: subject.trim(),
      body: body.trim(),
      isBulk: true,
      bulkGroup,
      emailSent: true, // TODO: integrate actual email sending
    })),
  });

  return { count: messages.count };
}

// ---------- Get Inbox ----------

export async function getInbox(userId?: string, page: number = 1) {
  const user = await requireAuth();
  const targetUserId = userId || user.id;

  // Non-admins can only view their own inbox
  if (targetUserId !== user.id && user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const skip = (page - 1) * PAGE_SIZE;

  const [messages, total] = await Promise.all([
    db.message.findMany({
      where: { receiverId: targetUserId },
      include: {
        sender: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE,
    }),
    db.message.count({
      where: { receiverId: targetUserId },
    }),
  ]);

  return {
    messages,
    total,
    page,
    totalPages: Math.ceil(total / PAGE_SIZE),
  };
}

// ---------- Get Sent Messages ----------

export async function getSentMessages(userId?: string, page: number = 1) {
  const user = await requireAuth();
  const targetUserId = userId || user.id;

  if (targetUserId !== user.id && user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const skip = (page - 1) * PAGE_SIZE;

  const [messages, total] = await Promise.all([
    db.message.findMany({
      where: { senderId: targetUserId },
      include: {
        receiver: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE,
    }),
    db.message.count({
      where: { senderId: targetUserId },
    }),
  ]);

  return {
    messages,
    total,
    page,
    totalPages: Math.ceil(total / PAGE_SIZE),
  };
}

// ---------- Get Single Message ----------

export async function getMessage(messageId: string) {
  const user = await requireAuth();

  const message = await db.message.findUnique({
    where: { id: messageId },
    include: {
      sender: { select: { id: true, name: true, email: true, role: true } },
      receiver: { select: { id: true, name: true, email: true, role: true } },
    },
  });

  if (!message) {
    throw new Error("Message not found");
  }

  // Only sender, receiver, or admin can view
  if (
    message.senderId !== user.id &&
    message.receiverId !== user.id &&
    user.role !== "ADMIN"
  ) {
    throw new Error("Unauthorized");
  }

  // Mark as read if the current user is the receiver
  if (message.receiverId === user.id && !message.isRead) {
    await db.message.update({
      where: { id: messageId },
      data: { isRead: true },
    });
    message.isRead = true;
  }

  return message;
}

// ---------- Mark As Read ----------

export async function markAsRead(messageId: string) {
  const user = await requireAuth();

  const message = await db.message.findUnique({
    where: { id: messageId },
    select: { receiverId: true },
  });

  if (!message) {
    throw new Error("Message not found");
  }

  if (message.receiverId !== user.id && user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  await db.message.update({
    where: { id: messageId },
    data: { isRead: true },
  });

  return { success: true };
}

// ---------- Mark All As Read ----------

export async function markAllAsRead(userId?: string) {
  const user = await requireAuth();
  const targetUserId = userId || user.id;

  if (targetUserId !== user.id && user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  await db.message.updateMany({
    where: { receiverId: targetUserId, isRead: false },
    data: { isRead: true },
  });

  return { success: true };
}

// ---------- Get Unread Count ----------

export async function getUnreadCount(userId?: string) {
  const user = await requireAuth();
  const targetUserId = userId || user.id;

  if (targetUserId !== user.id && user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const count = await db.message.count({
    where: { receiverId: targetUserId, isRead: false },
  });

  return count;
}

// ---------- Message Templates ----------

export async function getMessageTemplates() {
  await requireAdmin();

  return db.messageTemplate.findMany({
    orderBy: { updatedAt: "desc" },
  });
}

export async function createMessageTemplate(
  name: string,
  subject: string,
  body: string
) {
  await requireAdmin();

  if (!name.trim() || !subject.trim() || !body.trim()) {
    throw new Error("Name, subject, and body are required");
  }

  return db.messageTemplate.create({
    data: {
      name: name.trim(),
      subject: subject.trim(),
      body: body.trim(),
    },
  });
}

export async function updateMessageTemplate(
  id: string,
  data: { name?: string; subject?: string; body?: string }
) {
  await requireAdmin();

  const existing = await db.messageTemplate.findUnique({ where: { id } });
  if (!existing) {
    throw new Error("Template not found");
  }

  return db.messageTemplate.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name.trim() }),
      ...(data.subject !== undefined && { subject: data.subject.trim() }),
      ...(data.body !== undefined && { body: data.body.trim() }),
    },
  });
}

export async function deleteMessageTemplate(id: string) {
  await requireAdmin();

  const existing = await db.messageTemplate.findUnique({ where: { id } });
  if (!existing) {
    throw new Error("Template not found");
  }

  await db.messageTemplate.delete({ where: { id } });
  return { success: true };
}

// ---------- Search Parents (for compose) ----------

export async function searchParents(query: string) {
  await requireAdmin();

  if (!query || query.length < 2) return [];

  return db.user.findMany({
    where: {
      role: "PARENT",
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
      ],
    },
    select: { id: true, name: true, email: true },
    take: 10,
  });
}

// ---------- Parent → Admin Messaging ----------

export async function sendMessageToAdmin(subject: string, body: string) {
  const user = await requireAuth();

  if (!subject.trim() || !body.trim()) {
    throw new Error("Subject and body are required");
  }

  // Find an admin to route the message to. Prefer the oldest active admin.
  const admin = await db.user.findFirst({
    where: { role: "ADMIN", status: "ACTIVE" },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  const fallback = admin
    ? admin
    : await db.user.findFirst({
        where: { role: "ADMIN" },
        orderBy: { createdAt: "asc" },
        select: { id: true },
      });

  if (!fallback) {
    throw new Error(
      "No admin is currently available to receive messages. Please try again later."
    );
  }

  const message = await db.message.create({
    data: {
      senderId: user.id,
      receiverId: fallback.id,
      subject: subject.trim(),
      body: body.trim(),
      emailSent: false,
    },
  });

  return message;
}

export async function getConversationWithAdmin(parentId?: string) {
  const user = await requireAuth();
  const targetParentId = parentId || user.id;

  // Only the parent themselves or an admin may view the conversation
  if (targetParentId !== user.id && user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  // Identify admin user ids
  const admins = await db.user.findMany({
    where: { role: "ADMIN" },
    select: { id: true },
  });
  const adminIds = admins.map((a) => a.id);

  if (adminIds.length === 0) {
    return [];
  }

  const messages = await db.message.findMany({
    where: {
      OR: [
        { senderId: targetParentId, receiverId: { in: adminIds } },
        { receiverId: targetParentId, senderId: { in: adminIds } },
      ],
    },
    include: {
      sender: { select: { id: true, name: true, email: true, role: true } },
      receiver: { select: { id: true, name: true, email: true, role: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return messages;
}

// ---------- Get Academic Years (for bulk filters) ----------

export async function getAcademicYears() {
  await requireAdmin();

  const years = await db.application.findMany({
    select: { academicYear: true },
    distinct: ["academicYear"],
    orderBy: { academicYear: "desc" },
  });

  return years.map((y) => y.academicYear);
}
