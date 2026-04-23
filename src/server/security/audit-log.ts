import { headers } from "next/headers";
import { db } from "@/server/db";

/**
 * Append-only audit log. Use for any admin/staff action that mutates data:
 * status changes, deletes, role changes, financial adjustments, etc.
 *
 * Best-effort: a failure here should never break the underlying action — wrap
 * the call in a fire-and-forget pattern at the call site.
 */
export async function recordAudit(args: {
  actorId: string;
  action: string;            // e.g. "application.status.changed"
  entityType: string;        // e.g. "Application"
  entityId: string;
  before?: unknown;
  after?: unknown;
}) {
  try {
    let ipPrefix: string | null = null;
    let userAgent: string | null = null;
    try {
      const h = await headers();
      const ip =
        h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        h.get("x-real-ip") ??
        null;
      ipPrefix = ip ? maskIp(ip) : null;
      userAgent = h.get("user-agent")?.slice(0, 200) ?? null;
    } catch {
      // headers() throws if called outside a request scope — that's fine
    }

    await db.auditLog.create({
      data: {
        actorId: args.actorId,
        action: args.action,
        entityType: args.entityType,
        entityId: args.entityId,
        before: args.before === undefined ? undefined : (args.before as object),
        after: args.after === undefined ? undefined : (args.after as object),
        ipPrefix,
        userAgent,
      },
    });
  } catch (e) {
    console.error("recordAudit failed:", e);
  }
}

function maskIp(ip: string): string {
  if (ip.includes(":")) return ip.split(":").slice(0, 4).join(":");
  const parts = ip.split(".");
  if (parts.length === 4) return parts.slice(0, 3).join(".");
  return ip;
}
