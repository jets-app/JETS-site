import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { isStaff } from "@/lib/roles";
import {
  listBatches,
  listOpenChecks,
} from "@/server/actions/deposit-batch.actions";
import { BatchesClient } from "./_components/batches-client";

export default async function BatchesPage() {
  const session = await auth();
  if (!session?.user || !isStaff(session.user.role)) {
    redirect("/dashboard");
  }

  const [batchesResult, openChecksResult] = await Promise.all([
    listBatches(),
    listOpenChecks(),
  ]);

  const batches =
    "batches" in batchesResult ? batchesResult.batches : [];
  const openChecks =
    "payments" in openChecksResult ? openChecksResult.payments : [];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Daily Batches</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Stripe payouts and check deposits, ready to post to QuickBooks as a
          single split-line deposit.
        </p>
      </div>

      <BatchesClient
        batches={JSON.parse(JSON.stringify(batches))}
        openChecks={JSON.parse(JSON.stringify(openChecks))}
        currentUserIsAdmin={session.user.role === "ADMIN"}
      />
    </div>
  );
}
