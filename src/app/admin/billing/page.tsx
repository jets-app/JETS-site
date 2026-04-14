import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { db } from "@/server/db";
import { LinkButton } from "@/components/shared/link-button";
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
  TrendingUp,
  AlertTriangle,
  FileText,
  CreditCard,
  Tag,
  ArrowRight,
} from "lucide-react";
import { RecordPaymentForm } from "./_components/record-payment-form";
import { CreateInvoiceForm } from "./_components/create-invoice-form";
import { SetTuitionForm } from "./_components/set-tuition-form";
import { MarkFeePaidButton } from "./_components/mark-fee-paid-button";

function formatCents(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

function getInvoiceStatusBadge(status: string) {
  const config: Record<string, { label: string; className: string }> = {
    draft: { label: "Draft", className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" },
    sent: { label: "Sent", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
    paid: { label: "Paid", className: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" },
    partially_paid: { label: "Partial", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" },
    overdue: { label: "Overdue", className: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" },
  };
  const c = config[status] ?? { label: status, className: "bg-gray-100 text-gray-700" };
  return (
    <Badge variant="outline" className={`border-transparent font-medium ${c.className}`}>
      {c.label}
    </Badge>
  );
}

export default async function AdminBillingPage() {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "PRINCIPAL")) {
    redirect("/dashboard");
  }

  // Stats
  const paymentStats = await db.payment.aggregate({
    _sum: { amount: true },
    where: { status: "SUCCEEDED" },
  });

  const allInvoices = await db.invoice.findMany({
    select: { total: true, amountPaid: true, status: true, dueDate: true },
  });

  const totalCollected = paymentStats._sum.amount ?? 0;
  const totalOutstanding = allInvoices
    .filter((i) => i.status !== "paid")
    .reduce((s, i) => s + (i.total - i.amountPaid), 0);
  const overdueCount = allInvoices.filter(
    (i) => i.status !== "paid" && i.dueDate < new Date()
  ).length;

  // Recent payments
  const recentPayments = await db.payment.findMany({
    include: {
      application: {
        select: {
          referenceNumber: true,
          parent: { select: { name: true, email: true } },
          student: { select: { firstName: true, lastName: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 15,
  });

  // Recent invoices
  const now = new Date();
  const invoices = await db.invoice.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  const parentIds = [...new Set(invoices.map((i) => i.parentId))];
  const parents = await db.user.findMany({
    where: { id: { in: parentIds } },
    select: { id: true, name: true, email: true },
  });
  const parentMap = new Map(parents.map((p) => [p.id, p]));

  const invoicesWithData = invoices.map((inv) => ({
    ...inv,
    parent: parentMap.get(inv.parentId),
    displayStatus: inv.status !== "paid" && inv.dueDate < now ? "overdue" : inv.status,
  }));

  // Applications for forms
  const applications = await db.application.findMany({
    where: { applicationFeePaid: false },
    select: {
      id: true,
      referenceNumber: true,
      student: { select: { firstName: true, lastName: true } },
      parent: { select: { name: true } },
    },
    take: 50,
  });

  // All parents for invoice creation
  const allParents = await db.user.findMany({
    where: { role: "PARENT" },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });

  // All applications for tuition setting
  const allApplications = await db.application.findMany({
    select: {
      id: true,
      referenceNumber: true,
      parentId: true,
      student: { select: { firstName: true, lastName: true } },
      parent: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Billing & Payments
          </h1>
          <p className="text-muted-foreground">
            Manage invoices, payments, tuition, and discount codes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <LinkButton href="/admin/billing/discount-codes" variant="outline" size="sm">
            <Tag className="mr-1.5 h-3.5 w-3.5" />
            Discount Codes
          </LinkButton>
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Collected</p>
                <p className="text-2xl font-bold">{formatCents(totalCollected)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Outstanding</p>
                <p className="text-2xl font-bold">{formatCents(totalOutstanding)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Overdue Invoices</p>
                <p className="text-2xl font-bold">{overdueCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Cards */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Mark Fee Paid */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="h-4 w-4" />
              Mark Fee as Paid
            </CardTitle>
            <CardDescription>Manually mark an application fee as paid.</CardDescription>
          </CardHeader>
          <CardContent>
            {applications.length === 0 ? (
              <p className="text-sm text-muted-foreground">All application fees are paid.</p>
            ) : (
              <MarkFeePaidButton applications={applications} />
            )}
          </CardContent>
        </Card>

        {/* Record Manual Payment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <DollarSign className="h-4 w-4" />
              Record Manual Payment
            </CardTitle>
            <CardDescription>Record an offline or manual payment.</CardDescription>
          </CardHeader>
          <CardContent>
            <RecordPaymentForm
              applications={allApplications.map((a) => ({
                id: a.id,
                referenceNumber: a.referenceNumber,
                label: `${a.referenceNumber} - ${a.student ? `${a.student.firstName} ${a.student.lastName}` : a.parent?.name ?? "Unknown"}`,
              }))}
            />
          </CardContent>
        </Card>

        {/* Set Tuition */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" />
              Set Tuition & Create Invoices
            </CardTitle>
            <CardDescription>Set tuition and auto-generate invoices.</CardDescription>
          </CardHeader>
          <CardContent>
            <SetTuitionForm
              applications={allApplications.map((a) => ({
                id: a.id,
                referenceNumber: a.referenceNumber,
                parentId: a.parentId,
                label: `${a.referenceNumber} - ${a.student ? `${a.student.firstName} ${a.student.lastName}` : a.parent?.name ?? "Unknown"}`,
              }))}
            />
          </CardContent>
        </Card>
      </div>

      {/* Create Invoice */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Create Invoice
          </CardTitle>
          <CardDescription>Create a custom invoice for a parent.</CardDescription>
        </CardHeader>
        <CardContent>
          <CreateInvoiceForm
            parents={allParents.map((p) => ({
              id: p.id,
              label: `${p.name} (${p.email})`,
            }))}
          />
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Invoices
          </CardTitle>
        </CardHeader>
        <CardContent>
          {invoicesWithData.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No invoices yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Parent</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoicesWithData.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-medium">{inv.invoiceNumber}</TableCell>
                    <TableCell>{inv.parent?.name ?? "Unknown"}</TableCell>
                    <TableCell>
                      {new Date(inv.dueDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>{formatCents(inv.total)}</TableCell>
                    <TableCell>{formatCents(inv.amountPaid)}</TableCell>
                    <TableCell className="font-medium">
                      {formatCents(inv.total - inv.amountPaid)}
                    </TableCell>
                    <TableCell>{getInvoiceStatusBadge(inv.displayStatus)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Recent Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Recent Payments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentPayments.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No payments recorded yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Parent</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      {new Date(payment.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </TableCell>
                    <TableCell>{payment.application?.parent?.name ?? "N/A"}</TableCell>
                    <TableCell>
                      {payment.application?.student
                        ? `${payment.application.student.firstName} ${payment.application.student.lastName}`
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {payment.type.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{formatCents(payment.amount)}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`border-transparent font-medium ${
                          payment.status === "SUCCEEDED"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                        }`}
                      >
                        {payment.status === "SUCCEEDED" ? "Paid" : payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-[200px] truncate">
                      {payment.description ?? ""}
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
