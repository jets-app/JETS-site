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
  CheckCircle2,
  Clock,
  FileText,
  CreditCard,
  ArrowRight,
  GraduationCap,
} from "lucide-react";
import { PayApplicationFeeButton } from "./_components/pay-fee-button";
import { ApplyDiscountForm } from "./_components/apply-discount-form";
import { EnrolledPortal } from "./_components/enrolled-portal";
import { getWireInstructions } from "@/server/actions/wire-payment.actions";

function formatCents(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

function getInvoiceStatusBadge(status: string) {
  const config: Record<string, { label: string; className: string }> = {
    draft: {
      label: "Draft",
      className:
        "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    },
    sent: {
      label: "Sent",
      className:
        "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
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

export default async function ParentPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ pay?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const sp = await searchParams;
  const autoOpenInvoiceId = sp.pay ?? null;

  // Load every enrolled application for this parent. JETS rarely has siblings,
  // so the multi-child list is usually a list of one — but if a parent has 2+
  // boys at JETS we render a section per child.
  const enrolledApps = await db.application.findMany({
    where: { parentId: session.user.id, status: "ENROLLED" },
    include: {
      student: { select: { firstName: true, lastName: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const isEnrolled = enrolledApps.length > 0;

  // ==================== ENROLLED: AppFolio-style portal ====================
  if (isEnrolled) {
    const appIds = enrolledApps.map((a) => a.id);
    const [allInvoices, allPaymentsRaw, methodsRaw, autoPay, wireInstructions] =
      await Promise.all([
        db.invoice.findMany({
          where: { applicationId: { in: appIds } },
          orderBy: { dueDate: "asc" },
        }),
        db.payment.findMany({
          where: { applicationId: { in: appIds }, status: "SUCCEEDED" },
          orderBy: { createdAt: "desc" },
          take: 100,
        }),
        db.paymentMethod.findMany({
          where: { userId: session.user.id },
          orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
        }),
        db.autoPaySettings.findUnique({ where: { userId: session.user.id } }),
        getWireInstructions(),
      ]);

    const methodsLite = methodsRaw.map((m) => ({
      id: m.id,
      type: m.type,
      last4: m.last4,
      brand: m.brand,
      bankName: m.bankName,
      isDefault: m.isDefault,
    }));

    const apMethod =
      methodsLite.find((m) => m.id === autoPay?.paymentMethodId) ??
      methodsLite.find((m) => m.isDefault) ??
      methodsLite[0] ??
      null;

    const familyBalance = allInvoices
      .filter((i) => i.status !== "paid")
      .reduce((s, i) => s + (i.total - i.amountPaid), 0);

    const isMultiChild = enrolledApps.length > 1;

    return (
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Family-level header (only when multi-child) */}
        {isMultiChild && (
          <div className="rounded-xl border bg-card p-5">
            <p className="text-sm text-muted-foreground">Family Tuition</p>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mt-0.5">
              {enrolledApps.length} students enrolled
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              Combined balance:{" "}
              <span className="font-semibold text-foreground tabular-nums">
                {`$${(familyBalance / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
              </span>
            </p>
          </div>
        )}

        {enrolledApps.map((app) => {
          const studentName = app.student
            ? `${app.student.firstName} ${app.student.lastName}`
            : "Student";

          const invoices = allInvoices.filter(
            (i) => i.applicationId === app.id,
          );
          const payments = allPaymentsRaw.filter(
            (p) => p.applicationId === app.id,
          );

          const balance = invoices
            .filter((i) => i.status !== "paid")
            .reduce((s, i) => s + (i.total - i.amountPaid), 0);

          return (
            <EnrolledPortal
              key={app.id}
              studentName={studentName}
              autoPayEnabled={autoPay?.enabled ?? true}
              autoPayMethod={apMethod}
              methods={methodsLite}
              wireInstructions={wireInstructions}
              hideHeader={isMultiChild}
              autoOpenInvoiceId={autoOpenInvoiceId}
              invoices={invoices.map((inv) => ({
                id: inv.id,
                invoiceNumber: inv.invoiceNumber,
                dueDate: inv.dueDate.toISOString(),
                total: inv.total,
                amountPaid: inv.amountPaid,
                status: inv.status,
                paidAt: inv.paidAt?.toISOString() ?? null,
                paymentMethodType: inv.paymentMethodType,
                wirePendingAt: inv.wirePendingAt?.toISOString() ?? null,
              }))}
              payments={payments.map((p) => ({
                id: p.id,
                createdAt: p.createdAt.toISOString(),
                paidAt: p.paidAt?.toISOString() ?? null,
                description: p.description,
                amount: p.amount,
                type: p.type,
              }))}
              balance={balance}
            />
          );
        })}
      </div>
    );
  }

  // ==================== PRE-ENROLLMENT: Original application fee UI ====================
  const applications = await db.application.findMany({
    where: { parentId: session.user.id },
    select: {
      id: true,
      referenceNumber: true,
      applicationFeePaid: true,
      applicationFeeAmount: true,
      discountAmount: true,
      discountCode: true,
      student: { select: { firstName: true, lastName: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const invoices = await db.invoice.findMany({
    where: { parentId: session.user.id },
    orderBy: { dueDate: "asc" },
  });

  const now = new Date();
  const invoicesWithOverdue = invoices.map((inv) => ({
    ...inv,
    displayStatus:
      inv.status !== "paid" && inv.dueDate < now ? "overdue" : inv.status,
  }));

  const applicationIds = applications.map((a) => a.id);
  const payments = await db.payment.findMany({
    where: { applicationId: { in: applicationIds } },
    include: {
      application: {
        select: { referenceNumber: true, academicYear: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const totalOutstanding = invoicesWithOverdue
    .filter((i) => i.status !== "paid")
    .reduce((s, i) => s + (i.total - i.amountPaid), 0);

  const totalPaid = payments
    .filter((p) => p.status === "SUCCEEDED")
    .reduce((s, p) => s + p.amount, 0);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Payments & Billing
        </h1>
        <p className="text-muted-foreground">
          Manage your application fees, tuition invoices, and payment history.
        </p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Outstanding Balance
                </p>
                <p className="text-2xl font-bold">
                  {formatCents(totalOutstanding)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Paid</p>
                <p className="text-2xl font-bold">{formatCents(totalPaid)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Invoices</p>
                <p className="text-2xl font-bold">
                  {invoicesWithOverdue.filter((i) => i.status !== "paid").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Application Fees */}
      {applications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Application Fees
            </CardTitle>
            <CardDescription>
              Pay the application fee for each of your applications.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {applications.map((app) => {
                const studentName = app.student
                  ? `${app.student.firstName} ${app.student.lastName}`
                  : "Student";
                const finalAmount =
                  app.applicationFeeAmount - app.discountAmount;

                return (
                  <div
                    key={app.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border p-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{studentName}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Fee: {formatCents(finalAmount)}
                        {app.discountCode && (
                          <span className="ml-2 text-green-600">
                            (Discount: {app.discountCode} &mdash;{" "}
                            {formatCents(app.discountAmount)} off)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {app.applicationFeePaid ? (
                        <Badge
                          variant="outline"
                          className="border-transparent bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                        >
                          <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                          Paid
                        </Badge>
                      ) : (
                        <div className="flex items-center gap-2">
                          {!app.discountCode && (
                            <ApplyDiscountForm applicationId={app.id} />
                          )}
                          <PayApplicationFeeButton
                            applicationId={app.id}
                            amount={finalAmount}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invoices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Invoices
          </CardTitle>
          <CardDescription>Your tuition and fee invoices.</CardDescription>
        </CardHeader>
        <CardContent>
          {invoicesWithOverdue.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p>No invoices yet.</p>
              <p className="text-sm mt-1">
                Invoices will appear here once tuition is set for your student.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoicesWithOverdue.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-medium">
                      {inv.invoiceNumber}
                    </TableCell>
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
                    <TableCell>
                      {getInvoiceStatusBadge(inv.displayStatus)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Scholarship Link */}
      <Card>
        <CardContent className="pt-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-pink-600" />
              </div>
              <div>
                <p className="font-medium">Need Financial Assistance?</p>
                <p className="text-sm text-muted-foreground">
                  Apply for our &quot;Pay It Forward&quot; scholarship program.
                </p>
              </div>
            </div>
            <LinkButton href="/portal/scholarship" variant="outline" size="sm">
              Apply for Scholarship
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </LinkButton>
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p>No payment history yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>School Year</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      {new Date(payment.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      {payment.description || payment.type.replace(/_/g, " ")}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {payment.application?.academicYear ?? "—"}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCents(payment.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`border-transparent font-medium ${
                          payment.status === "SUCCEEDED"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                            : payment.status === "PENDING"
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                              : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                        }`}
                      >
                        {payment.status === "SUCCEEDED"
                          ? "Paid"
                          : payment.status}
                      </Badge>
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
