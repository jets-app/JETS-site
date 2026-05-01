"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Layers,
  Banknote,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import {
  createCheckBatch,
  postBatchToQb,
} from "@/server/actions/deposit-batch.actions";

interface BatchRow {
  id: string;
  source: string;
  status: string;
  depositDate: string;
  totalCents: number;
  qbDepositId: string | null;
  qbError: string | null;
  notes: string | null;
  _count: { payments: number };
}

interface OpenCheckRow {
  id: string;
  amount: number;
  description: string | null;
  paidAt: string | null;
  type: string;
  application: {
    student?: { firstName: string; lastName: string } | null;
    parent?: { name: string } | null;
  } | null;
}

function fmt(c: number) {
  return `$${(c / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function statusBadge(status: string) {
  switch (status) {
    case "posted":
      return (
        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-transparent">
          <CheckCircle2 className="h-3 w-3 mr-1" /> Posted
        </Badge>
      );
    case "failed":
      return (
        <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-transparent">
          <AlertCircle className="h-3 w-3 mr-1" /> Failed
        </Badge>
      );
    default:
      return <Badge variant="outline">Pending</Badge>;
  }
}

export function BatchesClient({
  batches,
  openChecks,
  currentUserIsAdmin,
}: {
  batches: BatchRow[];
  openChecks: OpenCheckRow[];
  currentUserIsAdmin: boolean;
}) {
  const pending = batches.filter((b) => b.status !== "posted");
  const posted = batches.filter((b) => b.status === "posted");

  return (
    <div className="space-y-6">
      <PendingBatchesSection
        batches={pending}
        currentUserIsAdmin={currentUserIsAdmin}
      />
      <OpenChecksSection openChecks={openChecks} />
      {posted.length > 0 && <PostedBatchesSection batches={posted} />}
    </div>
  );
}

function PendingBatchesSection({
  batches,
  currentUserIsAdmin,
}: {
  batches: BatchRow[];
  currentUserIsAdmin: boolean;
}) {
  const router = useRouter();
  const [posting, startPosting] = useTransition();
  const [postingId, setPostingId] = useState<string | null>(null);

  const post = (batchId: string) => {
    setPostingId(batchId);
    startPosting(async () => {
      const r = await postBatchToQb(batchId);
      if ("error" in r && r.error) {
        toast.error(r.error);
      } else {
        toast.success("Posted to QuickBooks");
      }
      setPostingId(null);
      router.refresh();
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400">
            <Layers className="size-5" />
          </div>
          <div>
            <CardTitle>Pending Batches</CardTitle>
            <CardDescription>
              Stripe payouts and check deposits waiting to post to QuickBooks.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {batches.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-6">
            Nothing pending.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source</TableHead>
                <TableHead>Deposit Date</TableHead>
                <TableHead>Payments</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batches.map((b) => (
                <TableRow key={b.id}>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 text-sm">
                      {b.source === "stripe" ? (
                        <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                      ) : (
                        <Banknote className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                      <span className="capitalize">{b.source}</span>
                    </span>
                  </TableCell>
                  <TableCell>{fmtDate(b.depositDate)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {b._count.payments}
                  </TableCell>
                  <TableCell className="font-medium">{fmt(b.totalCents)}</TableCell>
                  <TableCell>
                    {statusBadge(b.status)}
                    {b.qbError && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1 truncate max-w-[240px]" title={b.qbError}>
                        {b.qbError}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {currentUserIsAdmin && (
                      <Button
                        size="sm"
                        onClick={() => post(b.id)}
                        disabled={posting && postingId === b.id}
                      >
                        {posting && postingId === b.id ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Posting…
                          </>
                        ) : b.status === "failed" ? (
                          "Retry"
                        ) : (
                          "Post to QB"
                        )}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function OpenChecksSection({ openChecks }: { openChecks: OpenCheckRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [depositDate, setDepositDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [notes, setNotes] = useState("");

  const total = useMemo(
    () =>
      openChecks
        .filter((c) => selected.has(c.id))
        .reduce((s, c) => s + c.amount, 0),
    [openChecks, selected],
  );

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === openChecks.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(openChecks.map((c) => c.id)));
    }
  };

  const create = () => {
    if (selected.size === 0) {
      toast.error("Pick at least one check.");
      return;
    }
    startTransition(async () => {
      const r = await createCheckBatch({
        paymentIds: Array.from(selected),
        depositDate: new Date(depositDate),
        notes: notes.trim() || undefined,
      });
      if ("error" in r && r.error) {
        toast.error(r.error);
        return;
      }
      toast.success(`Check batch created — ${selected.size} checks`);
      setSelected(new Set());
      setNotes("");
      router.refresh();
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-primary/10 text-primary">
            <Banknote className="size-5" />
          </div>
          <div>
            <CardTitle>Open Checks</CardTitle>
            <CardDescription>
              Check payments marked received in JETS but not yet rolled into a
              deposit batch.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {openChecks.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-6">
            No open checks. Mark an invoice paid (method: check) on the Billing
            page and it will appear here.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">
                      <Checkbox
                        checked={
                          selected.size > 0 &&
                          selected.size === openChecks.length
                        }
                        onCheckedChange={toggleAll}
                        aria-label="Select all"
                      />
                    </TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Check Date</TableHead>
                    <TableHead>Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {openChecks.map((c) => {
                    const studentName = c.application?.student
                      ? `${c.application.student.firstName} ${c.application.student.lastName}`
                      : c.application?.parent?.name ?? "—";
                    return (
                      <TableRow
                        key={c.id}
                        className={selected.has(c.id) ? "bg-primary/5" : ""}
                      >
                        <TableCell>
                          <Checkbox
                            checked={selected.has(c.id)}
                            onCheckedChange={() => toggle(c.id)}
                            aria-label={`Select check ${c.id}`}
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {studentName}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {c.description ?? c.type.replace(/_/g, " ")}
                        </TableCell>
                        <TableCell>
                          {c.paidAt ? fmtDate(c.paidAt) : "—"}
                        </TableCell>
                        <TableCell className="font-medium">
                          {fmt(c.amount)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <div className="grid sm:grid-cols-3 gap-3 items-end">
              <div>
                <Label htmlFor="depositDate" className="text-sm">
                  Deposit Date
                </Label>
                <Input
                  id="depositDate"
                  type="date"
                  value={depositDate}
                  onChange={(e) => setDepositDate(e.target.value)}
                  className="mt-1.5"
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  Date the bank received the deposit (used in QBO).
                </p>
              </div>
              <div>
                <Label htmlFor="notes" className="text-sm">
                  Notes (optional)
                </Label>
                <Input
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Drop slip 4/30"
                  className="mt-1.5"
                />
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">
                  Selected: {selected.size} · {fmt(total)}
                </p>
                <Button
                  onClick={create}
                  disabled={pending || selected.size === 0}
                  className="mt-1.5"
                >
                  {pending ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Creating…
                    </>
                  ) : (
                    "Create Deposit Batch"
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PostedBatchesSection({ batches }: { batches: BatchRow[] }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="size-5" />
          </div>
          <div>
            <CardTitle>Recently Posted</CardTitle>
            <CardDescription>
              Last {batches.length} batch{batches.length === 1 ? "" : "es"}{" "}
              successfully posted to QuickBooks.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Source</TableHead>
              <TableHead>Deposit Date</TableHead>
              <TableHead>Payments</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>QB Deposit ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {batches.slice(0, 25).map((b) => (
              <TableRow key={b.id}>
                <TableCell>
                  <span className="inline-flex items-center gap-1.5 text-sm capitalize">
                    {b.source === "stripe" ? (
                      <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                    ) : (
                      <Banknote className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                    {b.source}
                  </span>
                </TableCell>
                <TableCell>{fmtDate(b.depositDate)}</TableCell>
                <TableCell className="text-muted-foreground">
                  {b._count.payments}
                </TableCell>
                <TableCell className="font-medium">{fmt(b.totalCents)}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {b.qbDepositId ?? "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
