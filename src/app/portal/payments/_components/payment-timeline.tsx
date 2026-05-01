"use client";

import {
  CheckCircle2,
  Circle,
  CreditCard,
  Building2,
  AlertCircle,
  Landmark,
  ArrowRight,
} from "lucide-react";

interface MethodLite {
  id: string;
  type: "CREDIT_CARD" | "BANK_ACCOUNT";
  last4: string;
  brand: string | null;
  bankName: string | null;
  isDefault: boolean;
}

interface InvoiceRow {
  id: string;
  invoiceNumber: string;
  dueDate: string;
  total: number;
  amountPaid: number;
  status: string;
  paidAt: string | null;
  paymentMethodType: string | null;
  wirePendingAt?: string | null;
}

function fmt(c: number) {
  return `$${(c / 100).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function fmtMonth(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short" });
}

function fmtDay(d: string) {
  return new Date(d).toLocaleDateString("en-US", { day: "numeric" });
}

type Status = "paid" | "wire_pending" | "overdue" | "upcoming" | "next";

function inferStatus(inv: InvoiceRow, isNext: boolean): Status {
  if (inv.status === "paid") return "paid";
  if (inv.wirePendingAt) return "wire_pending";
  if (new Date(inv.dueDate) < new Date()) return "overdue";
  if (isNext) return "next";
  return "upcoming";
}

const STATUS_CONFIG: Record<
  Status,
  { ring: string; bg: string; iconColor: string; label: string }
> = {
  paid: {
    ring: "ring-emerald-200 dark:ring-emerald-800",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    label: "Paid",
  },
  wire_pending: {
    ring: "ring-amber-200 dark:ring-amber-800",
    bg: "bg-amber-50 dark:bg-amber-900/20",
    iconColor: "text-amber-600 dark:text-amber-400",
    label: "Wire pending",
  },
  overdue: {
    ring: "ring-red-200 dark:ring-red-800",
    bg: "bg-red-50 dark:bg-red-900/20",
    iconColor: "text-red-600 dark:text-red-400",
    label: "Overdue",
  },
  next: {
    ring: "ring-primary/30",
    bg: "bg-primary/5",
    iconColor: "text-primary",
    label: "Next charge",
  },
  upcoming: {
    ring: "ring-foreground/10",
    bg: "bg-card",
    iconColor: "text-muted-foreground",
    label: "Scheduled",
  },
};

export function PaymentTimeline({
  invoices,
  autoPayMethod,
  autoPayEnabled,
}: {
  invoices: InvoiceRow[];
  autoPayMethod: MethodLite | null;
  autoPayEnabled: boolean;
}) {
  // Sort by due date asc, take everything within the next ~12 months + recent paid
  const sorted = [...invoices].sort((a, b) =>
    a.dueDate.localeCompare(b.dueDate),
  );

  // Find the earliest unpaid invoice — that's "next"
  const nextUnpaidId = sorted.find(
    (i) => i.status !== "paid" && !i.wirePendingAt,
  )?.id;

  if (sorted.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center">
        <Circle className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">
          No tuition invoices yet. They&apos;ll appear here once tuition is set
          for the school year.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Horizontal scrollable timeline on mobile, flex-wrap on desktop */}
      <div className="overflow-x-auto pb-3 -mx-2 px-2 sm:mx-0 sm:px-0 sm:overflow-visible">
        <div className="flex sm:flex-wrap gap-3 sm:gap-4 min-w-max sm:min-w-0">
          {sorted.map((inv) => {
            const status = inferStatus(inv, inv.id === nextUnpaidId);
            const cfg = STATUS_CONFIG[status];
            const balance = inv.total - inv.amountPaid;
            const showAutoPayMethod =
              status === "next" && autoPayEnabled && autoPayMethod;

            return (
              <div
                key={inv.id}
                className={`relative shrink-0 w-[180px] sm:w-[200px] rounded-xl ring-1 ${cfg.ring} ${cfg.bg} p-4 transition-all`}
              >
                {/* Date header */}
                <div className="flex items-baseline justify-between mb-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                      {fmtMonth(inv.dueDate)}
                    </div>
                    <div className="text-2xl font-bold leading-none mt-0.5 tabular-nums">
                      {fmtDay(inv.dueDate)}
                    </div>
                  </div>
                  {status === "paid" ? (
                    <CheckCircle2 className={`h-5 w-5 ${cfg.iconColor}`} />
                  ) : status === "overdue" ? (
                    <AlertCircle className={`h-5 w-5 ${cfg.iconColor}`} />
                  ) : status === "wire_pending" ? (
                    <Landmark className={`h-5 w-5 ${cfg.iconColor}`} />
                  ) : (
                    <Circle className={`h-5 w-5 ${cfg.iconColor}`} />
                  )}
                </div>

                {/* Amount */}
                <div className="text-lg font-semibold tabular-nums">
                  {fmt(status === "paid" ? inv.total : balance)}
                </div>

                {/* Status label */}
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  {cfg.label}
                </div>

                {/* Method hint for next charge */}
                {showAutoPayMethod && autoPayMethod && (
                  <div className="mt-3 pt-3 border-t border-foreground/10 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    {autoPayMethod.type === "CREDIT_CARD" ? (
                      <CreditCard className="h-3 w-3" />
                    ) : (
                      <Building2 className="h-3 w-3" />
                    )}
                    <span className="truncate">
                      ••••{autoPayMethod.last4}
                    </span>
                  </div>
                )}

                {/* Paid method label for past invoices */}
                {status === "paid" && inv.paymentMethodType && (
                  <div className="mt-3 pt-3 border-t border-foreground/10 text-[11px] text-muted-foreground capitalize">
                    via {inv.paymentMethodType.replace(/_/g, " ").toLowerCase()}
                  </div>
                )}
              </div>
            );
          })}

          {/* End cap — shows "next year" affordance */}
          <div className="shrink-0 w-[140px] sm:w-[160px] rounded-xl border-2 border-dashed border-foreground/15 p-4 flex flex-col items-center justify-center text-center text-xs text-muted-foreground">
            <ArrowRight className="h-4 w-4 mb-2 opacity-50" />
            <span>More invoices generated as the year goes on</span>
          </div>
        </div>
      </div>
    </div>
  );
}
