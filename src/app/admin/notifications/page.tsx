import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import {
  getNotificationLogs,
  getNotificationStats,
} from "@/server/actions/notification.actions";
import { CommsTabs } from "../messages/_components/comms-tabs";

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const [{ logs }, stats] = await Promise.all([
    getNotificationLogs({ limit: 50 }),
    getNotificationStats(),
  ]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Communications
        </h1>
        <p className="text-muted-foreground">
          Automated email and SMS notification log.
        </p>
      </div>

      <CommsTabs />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total" value={stats.total} />
        <StatCard label="Sent" value={stats.sent} color="text-green-600" />
        <StatCard label="Queued" value={stats.queued} color="text-amber-600" />
        <StatCard label="Failed" value={stats.failed} color="text-red-600" />
      </div>

      <div className="rounded-xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                  Recipient
                </th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                  Subject
                </th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                  Channel
                </th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                  Status
                </th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                  Sent
                </th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-border/50">
                  <td className="py-3 px-4">
                    <div className="font-medium">
                      {log.recipientName ?? "—"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {log.recipientEmail}
                    </div>
                  </td>
                  <td className="py-3 px-4 max-w-xs truncate">
                    {log.subject}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs font-medium bg-muted px-2 py-0.5 rounded">
                      {log.channel}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded ${
                        log.status === "SENT"
                          ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                          : log.status === "FAILED"
                            ? "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                            : "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">
                    {log.sentAt
                      ? new Date(log.sentAt).toLocaleString()
                      : "—"}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="py-12 text-center text-muted-foreground"
                  >
                    No notifications sent yet. Notifications are triggered
                    automatically when application statuses change.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-4 text-center">
      <p className={`text-2xl font-bold ${color ?? ""}`}>{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  );
}
