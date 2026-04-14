"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
  DollarSign,
  CheckCircle2,
  Clock,
  CreditCard,
  Wallet,
  Receipt,
  Calendar,
  GraduationCap,
} from "lucide-react";
import {
  PaymentMethods,
  type PaymentMethod,
} from "./payment-methods";
import { PayInvoiceButton } from "./pay-invoice-button";

interface InvoiceRow {
  id: string;
  invoiceNumber: string;
  dueDate: string; // ISO
  total: number;
  amountPaid: number;
  status: string;
  displayStatus: string;
  paidAt: string | null;
}

interface PaymentRow {
  id: string;
  createdAt: string;
  description: string | null;
  amount: number;
  status: string;
  type: string;
}

interface TuitionPortalProps {
  studentName: string;
  summary: {
    totalTuition: number;
    scholarship: number;
    netTuition: number;
    paid: number;
    balance: number;
    monthlyAmount: number | null;
    installmentCount: number;
  };
  invoices: InvoiceRow[];
  payments: PaymentRow[];
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function invoiceStatusBadge(status: string) {
  const config: Record<string, { label: string; className: string }> = {
    draft: {
      label: "Pending",
      className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    },
    sent: {
      label: "Unpaid",
      className: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    },
    paid: {
      label: "Paid",
      className:
        "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    },
    partially_paid: {
      label: "Partially Paid",
      className:
        "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    },
    overdue: {
      label: "Overdue",
      className: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    },
  };
  const c = config[status] ?? {
    label: status,
    className: "bg-gray-100 text-gray-700",
  };
  return (
    <Badge
      variant="outline"
      className={`border-transparent font-medium ${c.className}`}
    >
      {c.label}
    </Badge>
  );
}

export function TuitionPortal({
  studentName,
  summary,
  invoices,
  payments,
}: TuitionPortalProps) {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);

  const successfulPayments = payments.filter((p) => p.status === "SUCCEEDED");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Tuition & Payments
        </h1>
        <p className="text-muted-foreground">
          {studentName} · Review your tuition, schedule, and payment history.
        </p>
      </div>

      {/* Tuition Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Tuition Summary
          </CardTitle>
          <CardDescription>
            Your annual tuition, scholarship, and current balance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <SummaryTile
              label="Total Tuition"
              value={formatCents(summary.totalTuition)}
              tone="default"
              icon={DollarSign}
            />
            <SummaryTile
              label="Scholarship"
              value={`- ${formatCents(summary.scholarship)}`}
              tone="pink"
              icon={GraduationCap}
              hint={summary.scholarship === 0 ? "None awarded" : "Applied"}
            />
            <SummaryTile
              label="Net Tuition"
              value={formatCents(summary.netTuition)}
              tone="default"
              icon={Receipt}
            />
            <SummaryTile
              label="Paid to Date"
              value={formatCents(summary.paid)}
              tone="green"
              icon={CheckCircle2}
            />
            <SummaryTile
              label="Balance"
              value={formatCents(summary.balance)}
              tone={summary.balance > 0 ? "amber" : "green"}
              icon={Wallet}
              hint={
                summary.monthlyAmount
                  ? `${formatCents(summary.monthlyAmount)}/mo · ${summary.installmentCount} installments`
                  : undefined
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Monthly Payment Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Monthly Payment Schedule
          </CardTitle>
          <CardDescription>
            Your tuition installments and their due dates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p>No tuition schedule yet.</p>
              <p className="text-sm mt-1">
                Your payment schedule will appear here once tuition is set by the office.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((inv) => {
                    const balance = inv.total - inv.amountPaid;
                    const isPaid = inv.status === "paid";
                    return (
                      <TableRow key={inv.id}>
                        <TableCell className="font-medium">
                          {inv.invoiceNumber}
                        </TableCell>
                        <TableCell>{formatDate(inv.dueDate)}</TableCell>
                        <TableCell>{formatCents(inv.total)}</TableCell>
                        <TableCell className="font-medium">
                          {formatCents(balance)}
                        </TableCell>
                        <TableCell>
                          {invoiceStatusBadge(inv.displayStatus)}
                        </TableCell>
                        <TableCell className="text-right">
                          {isPaid ? (
                            <span className="text-xs text-muted-foreground">
                              Paid {inv.paidAt ? formatDate(inv.paidAt) : ""}
                            </span>
                          ) : (
                            <PayInvoiceButton
                              invoiceId={inv.id}
                              invoiceNumber={inv.invoiceNumber}
                              amount={balance}
                              methods={methods}
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Methods
          </CardTitle>
          <CardDescription>
            Save a card or bank account for faster tuition payments. Stripe is
            not connected yet — all methods are in test mode.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PaymentMethods onMethodsChange={setMethods} />
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Payment History
          </CardTitle>
          <CardDescription>
            Successful payments recorded on your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {successfulPayments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p>No payments yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead className="text-right">Receipt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {successfulPayments.map((p) => {
                  const method = extractMethod(p.description);
                  return (
                    <TableRow key={p.id}>
                      <TableCell>{formatDate(p.createdAt)}</TableCell>
                      <TableCell>
                        {p.description ?? p.type.replace(/_/g, " ")}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCents(p.amount)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {method}
                      </TableCell>
                      <TableCell className="text-right">
                        <button
                          type="button"
                          onClick={() => window.print()}
                          className="text-sm text-primary hover:underline"
                        >
                          View Receipt
                        </button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function extractMethod(description: string | null): string {
  if (!description) return "—";
  const match = description.match(/\(([^)]+)\)/);
  if (match && /card|bank/i.test(match[1])) {
    return match[1].replace(/ — test mode/i, "");
  }
  return "Card";
}

function SummaryTile({
  label,
  value,
  tone,
  icon: Icon,
  hint,
}: {
  label: string;
  value: string;
  tone: "default" | "green" | "amber" | "pink";
  icon: React.ElementType;
  hint?: string;
}) {
  const tones: Record<string, string> = {
    default: "bg-primary/10 text-primary",
    green: "bg-green-500/10 text-green-600",
    amber: "bg-amber-500/10 text-amber-600",
    pink: "bg-pink-500/10 text-pink-600",
  };
  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center gap-2 mb-1.5">
        <div
          className={`w-7 h-7 rounded-md flex items-center justify-center ${tones[tone]}`}
        >
          <Icon className="h-3.5 w-3.5" />
        </div>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
      <p className="text-xl font-bold">{value}</p>
      {hint && (
        <p className="text-[11px] text-muted-foreground mt-0.5">{hint}</p>
      )}
    </div>
  );
}
