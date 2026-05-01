import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { db } from "@/server/db";
import { LinkButton } from "@/components/shared/link-button";
import { Badge } from "@/components/ui/badge";
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
  CalendarClock,
  Tag,
  ArrowRight,
  Layers,
} from "lucide-react";
import { BillingActions } from "./_components/billing-actions";
import { ChargeInvoiceButton } from "./_components/charge-invoice-button";
import { InvoiceActionsMenu } from "./_components/invoice-actions-menu";

function formatCents(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

function fmtDate(d: Date) {
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const MONTH_LABEL = (d: Date) =>
  d.toLocaleString("en-US", { month: "long", year: "numeric" });

export default async function AdminBillingPage() {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "PRINCIPAL")) {
    redirect("/dashboard");
  }

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  // Pull all relevant invoices
  const [dueThisMonthRaw, paidThisMonthRaw, pastDueRaw] = await Promise.all([
    db.invoice.findMany({
      where: {
        dueDate: { gte: monthStart, lte: monthEnd },
        status: { not: "paid" },
      },
      orderBy: { dueDate: "asc" },
    }),
    db.invoice.findMany({
      where: {
        status: "paid",
        paidAt: { gte: monthStart, lte: monthEnd },
      },
      orderBy: { paidAt: "desc" },
    }),
    db.invoice.findMany({
      where: { status: { not: "paid" }, dueDate: { lt: monthStart } },
      orderBy: { dueDate: "asc" },
    }),
  ]);

  const allParentIds = [
    ...new Set([
      ...dueThisMonthRaw.map((i) => i.parentId),
      ...paidThisMonthRaw.map((i) => i.parentId),
      ...pastDueRaw.map((i) => i.parentId),
    ]),
  ];

  const allAppIds = [
    ...new Set(
      [
        ...dueThisMonthRaw,
        ...paidThisMonthRaw,
        ...pastDueRaw,
      ]
        .map((i) => i.applicationId)
        .filter((x): x is string => !!x)
    ),
  ];

  const [parents, apps, autoPaySettings, paymentMethods] = await Promise.all([
    db.user.findMany({
      where: { id: { in: allParentIds } },
      select: { id: true, name: true, email: true },
    }),
    db.application.findMany({
      where: { id: { in: allAppIds } },
      select: {
        id: true,
        student: { select: { firstName: true, lastName: true } },
      },
    }),
    db.autoPaySettings.findMany({ where: { userId: { in: allParentIds } } }),
    db.paymentMethod.findMany({ where: { userId: { in: allParentIds } } }),
  ]);

  const parentMap = new Map(parents.map((p) => [p.id, p]));
  const appMap = new Map(apps.map((a) => [a.id, a]));
  const apMap = new Map(autoPaySettings.map((s) => [s.userId, s]));
  const hasMethod = new Set(paymentMethods.map((m) => m.userId));

  const studentOf = (parentId: string, appId: string | null) => {
    if (appId) {
      const a = appMap.get(appId);
      if (a?.student) return `${a.student.firstName} ${a.student.lastName}`;
    }
    return parentMap.get(parentId)?.name ?? "Unknown";
  };

  const totalDue = dueThisMonthRaw.reduce((s, i) => s + (i.total - i.amountPaid), 0);
  const totalPaidMonth = paidThisMonthRaw.reduce((s, i) => s + i.total, 0);
  const totalPastDue = pastDueRaw.reduce((s, i) => s + (i.total - i.amountPaid), 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Billing</p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {MONTH_LABEL(now)}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <LinkButton href="/admin/billing/batches" variant="outline" size="sm">
            <Layers className="h-3.5 w-3.5" /> Daily Batches
          </LinkButton>
          <LinkButton href="/admin/billing/discount-codes" variant="outline" size="sm">
            <Tag className="h-3.5 w-3.5" /> Discount Codes
          </LinkButton>
        </div>
      </div>

      {/* Quick actions */}
      <BillingActions />

      {/* 3 summary tiles */}
      <div className="grid sm:grid-cols-3 gap-4">
        <SummaryTile
          tone="amber"
          icon={CalendarClock}
          label="Due This Month"
          value={formatCents(totalDue)}
          hint={`${dueThisMonthRaw.length} unpaid invoice${dueThisMonthRaw.length === 1 ? "" : "s"}`}
        />
        <SummaryTile
          tone="emerald"
          icon={CheckCircle2}
          label="Collected This Month"
          value={formatCents(totalPaidMonth)}
          hint={`${paidThisMonthRaw.length} payment${paidThisMonthRaw.length === 1 ? "" : "s"}`}
        />
        <SummaryTile
          tone="red"
          icon={AlertTriangle}
          label="Past Due"
          value={formatCents(totalPastDue)}
          hint={`${pastDueRaw.length} overdue invoice${pastDueRaw.length === 1 ? "" : "s"}`}
        />
      </div>

      {/* DUE THIS MONTH */}
      <Section
        title="Due This Month"
        subtitle={`Invoices with a due date in ${MONTH_LABEL(now)}`}
        accent="amber"
      >
        {dueThisMonthRaw.length === 0 ? (
          <Empty text="Nothing due this month." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Due</TableHead>
                <TableHead>Auto-Pay</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dueThisMonthRaw.map((inv) => {
                const ap = apMap.get(inv.parentId);
                const onAutoPay = ap?.enabled && hasMethod.has(inv.parentId);
                const wirePending = !!inv.wirePendingAt;
                return (
                  <TableRow key={inv.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {studentOf(inv.parentId, inv.applicationId)}
                        {wirePending && (
                          <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-transparent text-[10px]">
                            Wire pending
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {inv.invoiceNumber}
                      </div>
                    </TableCell>
                    <TableCell>{formatCents(inv.total - inv.amountPaid)}</TableCell>
                    <TableCell>{fmtDate(inv.dueDate)}</TableCell>
                    <TableCell>
                      {onAutoPay ? (
                        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-transparent">
                          ON
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          OFF
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <InvoiceActionsMenu
                        invoiceId={inv.id}
                        invoiceNumber={inv.invoiceNumber}
                        status={inv.status}
                        total={inv.total}
                        amountPaid={inv.amountPaid}
                        hasAutoPayMethod={!!onAutoPay}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Section>

      {/* PAID THIS MONTH */}
      <Section
        title="Paid This Month"
        subtitle="Payments received in the current month"
        accent="emerald"
      >
        {paidThisMonthRaw.length === 0 ? (
          <Empty text="No payments received yet this month." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Paid On</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Invoice</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paidThisMonthRaw.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-medium">
                    {studentOf(inv.parentId, inv.applicationId)}
                  </TableCell>
                  <TableCell>{formatCents(inv.total)}</TableCell>
                  <TableCell>
                    {inv.paidAt ? fmtDate(inv.paidAt) : "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {inv.paymentMethodType === "CREDIT_CARD"
                      ? "Credit Card"
                      : inv.paymentMethodType === "BANK_ACCOUNT"
                        ? "ACH Bank"
                        : "—"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {inv.invoiceNumber}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Section>

      {/* PAST DUE */}
      <Section
        title="Past Due"
        subtitle="Overdue invoices from previous months"
        accent="red"
      >
        {pastDueRaw.length === 0 ? (
          <Empty text="No past-due balances. Great work!" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Days Overdue</TableHead>
                <TableHead>Original Due</TableHead>
                <TableHead>Auto-Pay</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pastDueRaw.map((inv) => {
                const days = Math.floor(
                  (now.getTime() - inv.dueDate.getTime()) / (1000 * 60 * 60 * 24)
                );
                const ap = apMap.get(inv.parentId);
                const onAutoPay = ap?.enabled && hasMethod.has(inv.parentId);
                return (
                  <TableRow
                    key={inv.id}
                    className="bg-red-50/50 dark:bg-red-900/10"
                  >
                    <TableCell className="font-medium">
                      {studentOf(inv.parentId, inv.applicationId)}
                      <div className="text-xs text-muted-foreground">
                        {inv.invoiceNumber}
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-red-700 dark:text-red-400">
                      {formatCents(inv.total - inv.amountPaid)}
                    </TableCell>
                    <TableCell>{days}d</TableCell>
                    <TableCell>{fmtDate(inv.dueDate)}</TableCell>
                    <TableCell>
                      {onAutoPay ? (
                        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-transparent">
                          ON
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          OFF
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <InvoiceActionsMenu
                        invoiceId={inv.id}
                        invoiceNumber={inv.invoiceNumber}
                        status={inv.status}
                        total={inv.total}
                        amountPaid={inv.amountPaid}
                        hasAutoPayMethod={!!onAutoPay}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Section>

      {/* footer link */}
      <div className="text-center pt-4">
        <LinkButton href="/admin/students/list" variant="ghost" size="sm">
          View all students <ArrowRight className="h-3.5 w-3.5" />
        </LinkButton>
      </div>
    </div>
  );
}

function SummaryTile({
  label,
  value,
  hint,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: React.ElementType;
  tone: "amber" | "emerald" | "red";
}) {
  const tones = {
    amber: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    emerald: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    red: "bg-red-500/10 text-red-700 dark:text-red-400",
  } as const;
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${tones[tone]}`}>
          <Icon className="h-4 w-4" />
        </div>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
      <p className="text-3xl font-bold tracking-tight">{value}</p>
      {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
    </div>
  );
}

function Section({
  title,
  subtitle,
  accent,
  children,
}: {
  title: string;
  subtitle?: string;
  accent: "amber" | "emerald" | "red";
  children: React.ReactNode;
}) {
  const stripe = {
    amber: "border-l-amber-500",
    emerald: "border-l-emerald-500",
    red: "border-l-red-500",
  } as const;
  return (
    <div className={`rounded-xl border-l-4 ${stripe[accent]} border bg-card`}>
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
    <div className="text-center py-10 text-sm text-muted-foreground">{text}</div>
  );
}
