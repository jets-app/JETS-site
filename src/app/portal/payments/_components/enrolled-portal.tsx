"use client";

import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/shared/link-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertTriangle,
  CheckCircle2,
  CreditCard,
  CalendarClock,
  Settings2,
  Wallet,
  Zap,
} from "lucide-react";
import { PayInvoiceWithFee } from "./pay-invoice-with-fee";
import { PayByWire, type WireInstructions } from "./pay-by-wire";
import { PaymentTimeline } from "./payment-timeline";

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
interface PaymentRow {
  id: string;
  createdAt: string;
  paidAt: string | null;
  description: string | null;
  amount: number;
  type: string;
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

export function EnrolledPortal({
  studentName,
  autoPayEnabled,
  autoPayMethod,
  methods,
  invoices,
  payments,
  balance,
  wireInstructions,
  hideHeader,
}: {
  studentName: string;
  autoPayEnabled: boolean;
  autoPayMethod: MethodLite | null;
  methods: MethodLite[];
  invoices: InvoiceRow[];
  payments: PaymentRow[];
  balance: number;
  wireInstructions: WireInstructions | null;
  hideHeader?: boolean;
}) {
  const upcoming = invoices
    .filter((i) => i.status !== "paid")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const nextDue = upcoming[0];

  return (
    <div className="space-y-6">
      {/* Header — hidden when stacked under a multi-child layout */}
      {!hideHeader && (
        <div>
          <p className="text-sm text-muted-foreground">{studentName}</p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Tuition & Payments
          </h1>
        </div>
      )}
      {hideHeader && (
        <div className="flex items-center gap-2 pt-2 border-t border-foreground/5">
          <h2 className="text-lg font-semibold">{studentName}</h2>
          <Badge variant="outline" className="text-[10px]">
            {invoices.filter((i) => i.status !== "paid").length} open
          </Badge>
        </div>
      )}

      {/* Auto-Pay banner */}
      <div
        className={`rounded-xl border p-5 flex items-start gap-4 ${
          autoPayEnabled
            ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800"
            : "bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800"
        }`}
      >
        {autoPayEnabled ? (
          <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        ) : (
          <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        )}
        <div className="flex-1">
          <div className="font-semibold flex items-center gap-2">
            Auto-Pay is {autoPayEnabled ? "ON" : "OFF"}
            {autoPayEnabled && autoPayMethod && (
              <Badge className="bg-white/60 dark:bg-black/20 text-emerald-800 dark:text-emerald-200 border-transparent">
                {autoPayMethod.type === "CREDIT_CARD"
                  ? `${autoPayMethod.brand ?? "Card"} •••• ${autoPayMethod.last4}`
                  : `${autoPayMethod.bankName ?? "Bank"} •••• ${autoPayMethod.last4}`}
              </Badge>
            )}
          </div>
          <p
            className={`text-sm mt-1 ${
              autoPayEnabled
                ? "text-emerald-800 dark:text-emerald-300"
                : "text-amber-800 dark:text-amber-300"
            }`}
          >
            {autoPayEnabled
              ? nextDue
                ? `Next charge: ${fmt(nextDue.total - nextDue.amountPaid)} on ${fmtDate(nextDue.dueDate)}`
                : "All caught up — no upcoming invoices."
              : "You're paying manually. Pay each invoice on time to avoid late fees."}
          </p>
        </div>
        <LinkButton href="/portal/payments/autopay" variant="outline" size="sm">
          <Settings2 className="h-3.5 w-3.5" /> Manage
        </LinkButton>
      </div>

      {/* Summary tiles */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Tile
          icon={Wallet}
          tone="amber"
          label="Current Balance"
          value={fmt(balance)}
        />
        <Tile
          icon={CalendarClock}
          tone="default"
          label="Next Auto-Pay"
          value={
            autoPayEnabled && nextDue
              ? fmtDate(nextDue.dueDate)
              : autoPayEnabled
                ? "—"
                : "Manual"
          }
          hint={
            autoPayEnabled && nextDue
              ? fmt(nextDue.total - nextDue.amountPaid)
              : undefined
          }
        />
        <Tile
          icon={Zap}
          tone="emerald"
          label="Saved Methods"
          value={String(methods.length)}
          hint={methods.length === 0 ? "Add one to enable auto-pay" : undefined}
        />
      </div>

      {/* Quick links */}
      <div className="flex flex-wrap gap-2">
        <LinkButton href="/portal/payments/methods" variant="outline" size="sm">
          <CreditCard className="h-3.5 w-3.5" /> Payment Methods
        </LinkButton>
        <LinkButton href="/portal/payments/autopay" variant="outline" size="sm">
          <Settings2 className="h-3.5 w-3.5" /> Auto-Pay Settings
        </LinkButton>
      </div>

      {/* Visual Payment Timeline */}
      <Section
        title="Payment Schedule"
        subtitle="Your tuition invoices at a glance — past, current, and upcoming"
      >
        <div className="px-2 sm:px-2 py-2">
          <PaymentTimeline
            invoices={invoices}
            autoPayMethod={autoPayMethod}
            autoPayEnabled={autoPayEnabled}
          />
        </div>
      </Section>

      {/* Upcoming Invoices */}
      <Section title="Upcoming Invoices" subtitle="Pay any invoice manually anytime">
        {upcoming.length === 0 ? (
          <Empty text="You're all paid up." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {upcoming.map((inv) => {
                const balance = inv.total - inv.amountPaid;
                const overdue = new Date(inv.dueDate) < new Date();
                const wirePending = !!inv.wirePendingAt;
                return (
                  <TableRow key={inv.id}>
                    <TableCell className="font-medium">
                      {inv.invoiceNumber}
                    </TableCell>
                    <TableCell>{fmtDate(inv.dueDate)}</TableCell>
                    <TableCell>{fmt(balance)}</TableCell>
                    <TableCell>
                      {wirePending ? (
                        <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-transparent">
                          Wire pending
                        </Badge>
                      ) : overdue ? (
                        <Badge className="bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-transparent">
                          Overdue
                        </Badge>
                      ) : (
                        <Badge variant="outline">Due</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        {wireInstructions && !wirePending && (
                          <PayByWire
                            invoiceId={inv.id}
                            invoiceNumber={inv.invoiceNumber}
                            amount={balance}
                            instructions={wireInstructions}
                          />
                        )}
                        {!wirePending && (
                          <PayInvoiceWithFee
                            invoiceId={inv.id}
                            invoiceNumber={inv.invoiceNumber}
                            amount={balance}
                            methods={methods}
                          />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Section>

      {/* Payment History */}
      <Section title="Payment History" subtitle="All payments on your account">
        {payments.length === 0 ? (
          <Empty text="No payments yet." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    {fmtDate(p.paidAt ?? p.createdAt)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {p.description ?? p.type.replace(/_/g, " ")}
                  </TableCell>
                  <TableCell className="font-medium">{fmt(p.amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Section>
    </div>
  );
}

function Tile({
  icon: Icon,
  tone,
  label,
  value,
  hint,
}: {
  icon: React.ElementType;
  tone: "default" | "amber" | "emerald";
  label: string;
  value: string;
  hint?: string;
}) {
  const tones = {
    default: "bg-primary/10 text-primary",
    amber: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    emerald: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  } as const;
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${tones[tone]}`}>
          <Icon className="h-4 w-4" />
        </div>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
      <p className="text-2xl font-bold tracking-tight">{value}</p>
      {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
    </div>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-card">
      <div className="px-6 py-4 border-b">
        <h2 className="font-semibold text-lg">{title}</h2>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>
      <div className="p-2 sm:p-4">{children}</div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="text-center py-8 text-sm text-muted-foreground">{text}</div>
  );
}
