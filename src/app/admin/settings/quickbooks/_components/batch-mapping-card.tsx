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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Layers,
  RefreshCw,
  Pencil,
  Wallet,
  ArrowDownToLine,
  Tag,
} from "lucide-react";
import {
  refreshQbAccounts,
  updateQbBatchSettings,
  type QbBatchSettings,
} from "@/server/actions/deposit-batch.actions";
import type { QbAccountLite } from "@/lib/quickbooks";

const PAYMENT_CATEGORIES = [
  { key: "TUITION", label: "Tuition" },
  { key: "APPLICATION_FEE", label: "Application Fee" },
  { key: "REGISTRATION_FEE", label: "Registration Fee" },
  { key: "DONATION", label: "Donation" },
  { key: "OTHER", label: "Other" },
] as const;

interface Props {
  settings: QbBatchSettings;
  connected: boolean;
}

export function BatchMappingCard({ settings, connected }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [accounts, setAccounts] = useState<QbAccountLite[] | null>(null);

  const [mode, setMode] = useState(settings.qbBatchMode);
  const [stripeAcct, setStripeAcct] = useState({
    id: settings.qbStripeDepositAccountId ?? "",
    name: settings.qbStripeDepositAccountName ?? "",
  });
  const [checkAcct, setCheckAcct] = useState({
    id: settings.qbCheckDepositAccountId ?? "",
    name: settings.qbCheckDepositAccountName ?? "",
  });
  const [categoryMap, setCategoryMap] = useState<
    Record<string, { accountId: string; accountName: string }>
  >(() => {
    const m: Record<string, { accountId: string; accountName: string }> = {};
    for (const cat of PAYMENT_CATEGORIES) {
      const v = settings.qbCategoryAccountMap[cat.key];
      if (v?.accountId)
        m[cat.key] = { accountId: v.accountId, accountName: v.accountName };
    }
    return m;
  });

  const bankAccounts = (accounts ?? []).filter((a) =>
    ["Bank", "OtherCurrentAsset"].includes(a.type),
  );
  const incomeAccounts = (accounts ?? []).filter((a) =>
    ["Income", "OtherIncome"].includes(a.type),
  );

  const refresh = () => {
    startTransition(async () => {
      const r = await refreshQbAccounts();
      if ("error" in r) {
        toast.error(r.error);
        return;
      }
      setAccounts(r.accounts);
      toast.success(`Loaded ${r.accounts.length} accounts from QuickBooks`);
    });
  };

  const save = () => {
    startTransition(async () => {
      const r = await updateQbBatchSettings({
        qbBatchMode: mode,
        qbStripeDepositAccountId: stripeAcct.id || null,
        qbStripeDepositAccountName: stripeAcct.name || null,
        qbCheckDepositAccountId: checkAcct.id || null,
        qbCheckDepositAccountName: checkAcct.name || null,
        qbCategoryAccountMap: categoryMap,
      });
      if ("error" in r) {
        toast.error(r.error);
        return;
      }
      toast.success("Batch settings saved");
      setEditing(false);
      router.refresh();
    });
  };

  const cancel = () => {
    setMode(settings.qbBatchMode);
    setStripeAcct({
      id: settings.qbStripeDepositAccountId ?? "",
      name: settings.qbStripeDepositAccountName ?? "",
    });
    setCheckAcct({
      id: settings.qbCheckDepositAccountId ?? "",
      name: settings.qbCheckDepositAccountName ?? "",
    });
    const m: Record<string, { accountId: string; accountName: string }> = {};
    for (const cat of PAYMENT_CATEGORIES) {
      const v = settings.qbCategoryAccountMap[cat.key];
      if (v?.accountId)
        m[cat.key] = { accountId: v.accountId, accountName: v.accountName };
    }
    setCategoryMap(m);
    setEditing(false);
  };

  if (!connected) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-primary/10 text-primary">
              <Layers className="size-5" />
            </div>
            <div>
              <CardTitle>Daily Batch Posting</CardTitle>
              <CardDescription>
                Connect to QuickBooks first to configure batch deposits.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-primary/10 text-primary">
              <Layers className="size-5" />
            </div>
            <div>
              <CardTitle>Daily Batch Posting</CardTitle>
              <CardDescription>
                Each daily Stripe payout (and each check deposit you log) is
                posted to QBO as one Deposit, split by category.
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={mode === "auto" ? "secondary" : "outline"}>
              {mode === "auto" ? "Auto-post" : "Manual review"}
            </Badge>
            {!editing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditing(true)}
              >
                <Pencil className="size-3.5" />
                Edit
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      {!editing ? (
        <CardContent className="space-y-4">
          <ReadRow
            icon={<ArrowDownToLine className="size-4 text-muted-foreground" />}
            label="Stripe payouts deposit to"
            value={settings.qbStripeDepositAccountName ?? "—"}
          />
          <ReadRow
            icon={<Wallet className="size-4 text-muted-foreground" />}
            label="Check deposits go to"
            value={settings.qbCheckDepositAccountName ?? "—"}
          />
          <div className="rounded-lg border bg-muted/20 px-3 py-2 space-y-1.5">
            <div className="text-xs uppercase tracking-wide text-muted-foreground font-medium pb-1 flex items-center gap-1.5">
              <Tag className="size-3" /> Income Account Map
            </div>
            {PAYMENT_CATEGORIES.map((cat) => {
              const v = settings.qbCategoryAccountMap[cat.key];
              return (
                <div
                  key={cat.key}
                  className="flex justify-between items-center text-sm"
                >
                  <span>{cat.label}</span>
                  <span
                    className={
                      v?.accountName
                        ? "font-medium"
                        : "text-muted-foreground italic"
                    }
                  >
                    {v?.accountName ?? "Not mapped"}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            Mode: <strong>{mode === "auto" ? "Auto-post" : "Manual review"}</strong>{" "}
            — {mode === "auto"
              ? "Stripe payouts post to QBO the moment they land."
              : "Stripe payouts wait on the Daily Batches page for you to review and post."}
          </p>
        </CardContent>
      ) : (
        <CardContent className="space-y-5">
          {/* Mode toggle */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Auto-post Stripe payouts</p>
              <p className="text-xs text-muted-foreground">
                When ON, Stripe payouts post to QBO automatically. When OFF,
                review each batch on the Daily Batches page first.
              </p>
            </div>
            <Switch
              checked={mode === "auto"}
              onCheckedChange={(c) => setMode(c ? "auto" : "manual")}
            />
          </div>

          {/* Refresh accounts */}
          <div className="flex items-center justify-between rounded-lg border bg-muted/20 p-3">
            <div className="text-xs">
              {accounts ? (
                <span>
                  Loaded {accounts.length} accounts.{" "}
                  <span className="text-muted-foreground">
                    {bankAccounts.length} bank, {incomeAccounts.length} income.
                  </span>
                </span>
              ) : (
                <span className="text-muted-foreground">
                  Click below to pull the latest account list from QuickBooks.
                </span>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={refresh}
              disabled={pending}
            >
              <RefreshCw className="size-3.5" />
              {accounts ? "Refresh" : "Load Accounts"}
            </Button>
          </div>

          {/* Deposit accounts */}
          <div className="grid sm:grid-cols-2 gap-4">
            <AccountPicker
              label="Stripe payouts deposit to"
              value={stripeAcct.id}
              accounts={bankAccounts}
              onChange={(id, name) => setStripeAcct({ id, name })}
            />
            <AccountPicker
              label="Check deposits go to"
              value={checkAcct.id}
              accounts={bankAccounts}
              onChange={(id, name) => setCheckAcct({ id, name })}
            />
          </div>

          {/* Category mapping */}
          <div className="space-y-2">
            <Label className="text-sm">Income account per JETS category</Label>
            <p className="text-xs text-muted-foreground -mt-1">
              When a batch posts, each category becomes a separate line on the
              QBO Deposit hitting the chosen income account.
            </p>
            <div className="rounded-lg border divide-y">
              {PAYMENT_CATEGORIES.map((cat) => (
                <div
                  key={cat.key}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3 py-2"
                >
                  <span className="text-sm font-medium sm:w-48 shrink-0">
                    {cat.label}
                  </span>
                  <AccountPicker
                    value={categoryMap[cat.key]?.accountId ?? ""}
                    accounts={incomeAccounts}
                    onChange={(id, name) =>
                      setCategoryMap((m) => ({
                        ...m,
                        [cat.key]: { accountId: id, accountName: name },
                      }))
                    }
                    inline
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2 border-t">
            <Button onClick={save} disabled={pending} size="sm">
              {pending ? "Saving…" : "Save"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={cancel}
              disabled={pending}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

function ReadRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg border bg-muted/20">
      <div className="flex items-center gap-2 text-sm">
        {icon}
        <span className="text-muted-foreground">{label}</span>
      </div>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

function AccountPicker({
  label,
  value,
  accounts,
  onChange,
  inline,
}: {
  label?: string;
  value: string;
  accounts: QbAccountLite[];
  onChange: (id: string, name: string) => void;
  inline?: boolean;
}) {
  const placeholder = accounts.length === 0
    ? "Load accounts first"
    : "Pick an account…";

  return (
    <div className={inline ? "w-full sm:max-w-xs" : ""}>
      {label && <Label className="text-sm">{label}</Label>}
      <Select
        value={value}
        onValueChange={(v) => {
          const acct = accounts.find((a) => a.id === v);
          if (acct) onChange(acct.id, acct.name);
        }}
        disabled={accounts.length === 0}
      >
        <SelectTrigger className={label ? "mt-1.5" : ""}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {accounts.map((a) => (
            <SelectItem key={a.id} value={a.id}>
              {a.name}
              <span className="text-xs text-muted-foreground ml-2">
                ({a.type})
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
