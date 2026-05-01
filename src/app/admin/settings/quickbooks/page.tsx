import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import {
  getQuickBooksStatus,
  getSyncHistory,
} from "@/server/actions/quickbooks.actions";
import { getQbBatchSettings } from "@/server/actions/deposit-batch.actions";
import { QuickBooksSettingsClient } from "./quickbooks-client";
import { BatchMappingCard } from "./_components/batch-mapping-card";

export default async function QuickBooksSettingsPage(props: {
  searchParams: Promise<{ qb_error?: string; qb_connected?: string }>;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const searchParams = await props.searchParams;
  const [statusOrError, history, batchSettings] = await Promise.all([
    getQuickBooksStatus(),
    getSyncHistory(25),
    getQbBatchSettings(),
  ]);

  // The page already gated on ADMIN above, so this branch shouldn't fire,
  // but the action's auth check returns an error shape we have to handle.
  if ("error" in statusOrError) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <QuickBooksSettingsClient
        status={statusOrError}
        history={history}
        flash={{
          error: searchParams.qb_error ?? null,
          connected: searchParams.qb_connected === "1",
        }}
      />
      {!("error" in batchSettings) && (
        <BatchMappingCard
          settings={batchSettings}
          connected={statusOrError.connected}
        />
      )}
    </div>
  );
}
