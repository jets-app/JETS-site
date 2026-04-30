"use server";

import { auth } from "@/server/auth";
import { isFounder } from "@/lib/roles";
import { runDatabaseBackup } from "@/server/backup/db-backup";

/**
 * Admin-only: trigger an on-demand database backup. Same code path as the
 * daily cron, just kicked off manually via the settings page.
 */
export async function triggerDatabaseBackup() {
  const session = await auth();
  if (!session?.user) return { error: "Not signed in." };
  if (
    session.user.role !== "ADMIN" &&
    !isFounder(session.user.email ?? null)
  ) {
    return { error: "Admin access required." };
  }

  const result = await runDatabaseBackup();
  return result;
}
