import { NextResponse } from "next/server";
import { auth, signOut } from "@/server/auth";
import { db } from "@/server/db";
import { recordAudit } from "@/server/security/audit-log";

export const runtime = "nodejs";

/**
 * DELETE /api/account — permanently deletes the signed-in user and all owned
 * data (applications, students, payments, etc.). Used for GDPR/CCPA "right to
 * erasure" requests.
 *
 * Requires the request body to include {"confirm": "DELETE"} so it can't be
 * triggered accidentally by a CSRF or a misclick.
 *
 * NOTE: ADMIN role accounts cannot self-delete via this endpoint — admins must
 * be removed via a separate workflow so we always have at least one operator.
 */
export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role === "ADMIN") {
    return NextResponse.json(
      { error: "Admin accounts must be deleted by another admin." },
      { status: 403 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body — must be JSON." },
      { status: 400 },
    );
  }
  if (!body || typeof body !== "object" || (body as { confirm?: string }).confirm !== "DELETE") {
    return NextResponse.json(
      {
        error:
          'Confirmation required. Include {"confirm": "DELETE"} in the request body to proceed.',
      },
      { status: 400 },
    );
  }

  const userId = session.user.id;

  // Snapshot enough data to make the audit row useful after the cascade
  const snapshot = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });

  // Cascade deletes are wired in the Prisma schema (Application → Student,
  // recommendations, payments, etc. via onDelete: Cascade)
  await db.user.delete({ where: { id: userId } });

  recordAudit({
    actorId: userId,
    action: "user.self_deleted",
    entityType: "User",
    entityId: userId,
    before: snapshot,
  }).catch(console.error);

  await signOut({ redirect: false });

  return NextResponse.json({ success: true });
}
