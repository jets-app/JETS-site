"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileBarChart,
  RefreshCw,
  Link2,
  Unlink,
  AlertCircle,
  CheckCircle2,
  FlaskConical,
  Clock,
} from "lucide-react";
import {
  getAuthorizationUrl,
  mockConnectQuickBooks,
  disconnectQuickBooks,
  bulkSyncAll,
  updateQuickBooksSettings,
} from "@/server/actions/quickbooks.actions";

type Status = {
  connected: boolean;
  mockMode: boolean;
  configured: boolean;
  companyName: string | null;
  realmId: string | null;
  lastSync: Date | string | null;
  tokenExpiresAt: Date | string | null;
  autoSyncInvoices: boolean;
  autoSyncPayments: boolean;
  autoSyncCustomers: boolean;
};

type SyncRecord = {
  id: string;
  entityType: string;
  entityId: string;
  qbId: string | null;
  status: string;
  errorMsg: string | null;
  syncedAt: Date | string | null;
  createdAt: Date | string;
};

type History = {
  records: SyncRecord[];
  stats: {
    total: number;
    success: number;
    failed: number;
    mock: number;
    pending: number;
  };
};

function formatDate(d: Date | string | null): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleString();
}

function statusBadge(status: string) {
  switch (status) {
    case "success":
      return <Badge variant="default">Success</Badge>;
    case "failed":
      return <Badge variant="destructive">Failed</Badge>;
    case "mock":
      return <Badge variant="secondary">Mock</Badge>;
    case "pending":
      return <Badge variant="outline">Pending</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export function QuickBooksSettingsClient({
  status,
  history,
  flash,
}: {
  status: Status;
  history: History;
  flash: { error: string | null; connected: boolean };
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [autoInv, setAutoInv] = useState(status.autoSyncInvoices);
  const [autoPay, setAutoPay] = useState(status.autoSyncPayments);
  const [autoCust, setAutoCust] = useState(status.autoSyncCustomers);

  const handleConnect = () => {
    startTransition(async () => {
      if (status.mockMode) {
        const r = await mockConnectQuickBooks();
        if ("error" in r) {
          toast.error(r.error);
        } else {
          toast.success("Connected to QuickBooks (mock sandbox).");
          router.refresh();
        }
        return;
      }
      const r = await getAuthorizationUrl();
      if ("error" in r) {
        toast.error(r.error);
        return;
      }
      if (r.url) {
        window.location.href = r.url;
      }
    });
  };

  const handleDisconnect = () => {
    if (!confirm("Disconnect QuickBooks? You will need to re-authorize to sync again.")) return;
    startTransition(async () => {
      const r = await disconnectQuickBooks();
      if ("error" in r) {
        toast.error(r.error);
      } else {
        toast.success("Disconnected from QuickBooks.");
        router.refresh();
      }
    });
  };

  const handleSyncNow = () => {
    startTransition(async () => {
      const r = await bulkSyncAll();
      if ("error" in r) {
        toast.error(r.error);
      } else if (r.results) {
        const { customers, invoices, payments } = r.results;
        toast.success(
          `Synced — Customers: ${customers.synced}, Invoices: ${invoices.synced}, Payments: ${payments.synced}`
        );
        router.refresh();
      }
    });
  };

  const handleToggle = (
    field: "autoSyncInvoices" | "autoSyncPayments" | "autoSyncCustomers",
    value: boolean
  ) => {
    if (field === "autoSyncInvoices") setAutoInv(value);
    if (field === "autoSyncPayments") setAutoPay(value);
    if (field === "autoSyncCustomers") setAutoCust(value);

    startTransition(async () => {
      const r = await updateQuickBooksSettings({ [field]: value });
      if ("error" in r) {
        toast.error(r.error);
      } else {
        toast.success("Settings updated.");
      }
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
            <FileBarChart className="size-7 text-primary" />
            QuickBooks Online
          </h1>
          <p className="text-muted-foreground">
            Auto-sync invoices, payments, and customers with QuickBooks.
          </p>
        </div>
        <div className="flex gap-2">
          {status.connected && (
            <Button
              variant="outline"
              onClick={handleSyncNow}
              disabled={isPending}
            >
              <RefreshCw className={isPending ? "animate-spin" : ""} />
              Sync now
            </Button>
          )}
        </div>
      </div>

      {/* Flash messages */}
      {flash.error && (
        <Card className="border-destructive/40">
          <CardContent className="flex items-center gap-2 text-sm text-destructive py-3">
            <AlertCircle className="size-4" />
            QuickBooks error: {flash.error}
          </CardContent>
        </Card>
      )}
      {flash.connected && (
        <Card className="border-green-500/30">
          <CardContent className="flex items-center gap-2 text-sm text-green-600 py-3">
            <CheckCircle2 className="size-4" />
            QuickBooks connected successfully.
          </CardContent>
        </Card>
      )}

      {/* Mock Mode banner */}
      {status.mockMode && (
        <Card className="border-amber-500/40 bg-amber-500/5">
          <CardContent className="flex items-start gap-3 py-3">
            <FlaskConical className="size-5 text-amber-600 mt-0.5" />
            <div className="text-sm space-y-1">
              <div className="font-medium">Mock mode active</div>
              <div className="text-muted-foreground">
                QUICKBOOKS_CLIENT_ID and QUICKBOOKS_CLIENT_SECRET are not set.
                You can still exercise the sync flow — sync records will be
                created with status <code className="text-xs">mock</code> and
                no real API calls will be made.
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle>Connection</CardTitle>
          <CardDescription>
            Current QuickBooks Online connection for this environment.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground text-xs uppercase tracking-wide">
                Status
              </div>
              <div className="mt-1 flex items-center gap-2">
                {status.connected ? (
                  <>
                    <Badge variant="default">Connected</Badge>
                    {status.mockMode && <Badge variant="secondary">Mock</Badge>}
                  </>
                ) : (
                  <Badge variant="outline">Not connected</Badge>
                )}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs uppercase tracking-wide">
                Company
              </div>
              <div className="mt-1">{status.companyName ?? "—"}</div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs uppercase tracking-wide">
                Realm ID
              </div>
              <div className="mt-1 font-mono text-xs">
                {status.realmId ?? "—"}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs uppercase tracking-wide">
                Last sync
              </div>
              <div className="mt-1 flex items-center gap-1.5">
                <Clock className="size-3.5 text-muted-foreground" />
                {formatDate(status.lastSync)}
              </div>
            </div>
          </div>

          <div className="pt-2 flex gap-2 flex-wrap">
            {status.connected ? (
              <Button
                variant="destructive"
                onClick={handleDisconnect}
                disabled={isPending}
              >
                <Unlink />
                Disconnect
              </Button>
            ) : (
              <Button onClick={handleConnect} disabled={isPending}>
                <Link2 />
                {status.mockMode
                  ? "Connect QuickBooks (test)"
                  : "Connect QuickBooks"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sync Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total records", value: history.stats.total, variant: "default" as const },
          { label: "Successful", value: history.stats.success, variant: "default" as const },
          { label: "Failed", value: history.stats.failed, variant: "destructive" as const },
          { label: "Mock", value: history.stats.mock, variant: "secondary" as const },
        ].map((stat) => (
          <Card key={stat.label} size="sm">
            <CardContent className="py-4">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                {stat.label}
              </div>
              <div className="text-2xl font-bold mt-1">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Auto-sync Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Auto-sync</CardTitle>
          <CardDescription>
            Which entities sync automatically after they are created or
            updated.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            {
              key: "autoSyncInvoices" as const,
              label: "Invoices",
              desc: "Sync each invoice to QuickBooks when created or updated.",
              checked: autoInv,
            },
            {
              key: "autoSyncPayments" as const,
              label: "Payments",
              desc: "Record payments in QuickBooks as they are received.",
              checked: autoPay,
            },
            {
              key: "autoSyncCustomers" as const,
              label: "Customers",
              desc: "Create parent users as customers in QuickBooks.",
              checked: autoCust,
            },
          ].map((row) => (
            <div
              key={row.key}
              className="flex items-start justify-between gap-4 border-b pb-3 last:border-b-0 last:pb-0"
            >
              <div>
                <div className="font-medium text-sm">{row.label}</div>
                <div className="text-xs text-muted-foreground">{row.desc}</div>
              </div>
              <Switch
                checked={row.checked}
                onCheckedChange={(v) => handleToggle(row.key, v)}
                disabled={isPending}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recent Sync History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent sync history</CardTitle>
          <CardDescription>
            Last {history.records.length} sync operations.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {history.records.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground text-center">
              No sync operations yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>QB ID</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.records.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(r.syncedAt ?? r.createdAt)}
                    </TableCell>
                    <TableCell className="capitalize text-xs">
                      {r.entityType}
                      <div className="font-mono text-[10px] text-muted-foreground">
                        {r.entityId.slice(0, 10)}…
                      </div>
                    </TableCell>
                    <TableCell>{statusBadge(r.status)}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {r.qbId ?? "—"}
                    </TableCell>
                    <TableCell className="max-w-[280px] truncate text-xs text-muted-foreground">
                      {r.errorMsg ?? "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
