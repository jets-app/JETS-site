import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import {
  getQuickBooksStatus,
  getSyncHistory,
} from "@/server/actions/quickbooks.actions";
import { QuickBooksSettingsClient } from "./quickbooks-client";

export default async function QuickBooksSettingsPage(props: {
  searchParams: Promise<{ qb_error?: string; qb_connected?: string }>;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const searchParams = await props.searchParams;
  const [status, history] = await Promise.all([
    getQuickBooksStatus(),
    getSyncHistory(25),
  ]);

  return (
    <QuickBooksSettingsClient
      status={status}
      history={history}
      flash={{
        error: searchParams.qb_error ?? null,
        connected: searchParams.qb_connected === "1",
      }}
    />
  );
}
