import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { isFounder } from "@/lib/roles";
import { DevToolsClient } from "./_components/dev-tools-client";

export default async function DevToolsPage() {
  const session = await auth();
  if (!session?.user || !isFounder(session.user.email ?? null)) {
    redirect("/admin/dashboard");
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dev Tools</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Founder-only utilities for testing the live system.
        </p>
      </div>
      <DevToolsClient defaultEmail={session.user.email ?? ""} />
    </div>
  );
}
