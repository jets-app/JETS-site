import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";

export const runtime = "nodejs";

/**
 * GET /api/account/export — downloads everything the signed-in user owns as a
 * single JSON file. Used for GDPR/CCPA "right to portability" requests.
 *
 * Returns nested data (their applications + students + payments + recommendations
 * + messages + login history). Sensitive fields like passwordHash are excluded.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const [user, applications, sentMessages, receivedMessages, loginEvents] =
    await Promise.all([
      db.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          status: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      db.application.findMany({
        where: { parentId: userId },
        include: {
          student: true,
          recommendations: {
            select: {
              id: true,
              refereeName: true,
              refereeEmail: true,
              status: true,
              sentAt: true,
              submittedAt: true,
            },
          },
          payments: true,
          documents: {
            select: {
              id: true,
              title: true,
              status: true,
              signedAt: true,
              createdAt: true,
            },
          },
          scholarship: true,
          notes: {
            where: { isInternal: false },
          },
        },
      }),
      db.message.findMany({
        where: { senderId: userId },
        select: { id: true, subject: true, body: true, createdAt: true, receiverId: true },
      }),
      db.message.findMany({
        where: { receiverId: userId },
        select: { id: true, subject: true, body: true, createdAt: true, senderId: true },
      }),
      db.loginEvent.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 100,
        select: { id: true, ipPrefix: true, userAgentRaw: true, createdAt: true },
      }),
    ]);

  const payload = {
    exportedAt: new Date().toISOString(),
    note: "This file contains all personal data JETS School holds about your account. Keep it private.",
    user,
    applications,
    sentMessages,
    receivedMessages,
    loginEvents,
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="jets-account-export-${userId}.json"`,
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
