import { NextResponse } from "next/server";
import { runDatabaseBackup } from "@/server/backup/db-backup";

export const runtime = "nodejs";
// Backups can take a while if the DB grows
export const maxDuration = 300;

/**
 * Daily Postgres → S3 backup. Triggered by Vercel Cron (see vercel.json).
 * Authenticated by CRON_SECRET — fails closed if the secret isn't set.
 */
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json(
      { error: "CRON_SECRET not configured" },
      { status: 500 },
    );
  }
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await runDatabaseBackup();
  console.log("[cron/db-backup]", result);
  return NextResponse.json(result, { status: result.success ? 200 : 500 });
}
