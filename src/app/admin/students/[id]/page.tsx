import { auth } from "@/server/auth";
import { isStaff } from "@/lib/roles";
import { redirect, notFound } from "next/navigation";
import { getStudentDetail } from "@/server/actions/school-year.actions";
import { db } from "@/server/db";
import { ModeHeader } from "@/components/shared/mode-header";
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
import { MessageParentDialog } from "./_components/message-parent-dialog";
import { ExportPaymentsButton } from "./_components/export-payments-button";
import { AdminChargeInvoice } from "./_components/admin-charge-invoice";
import {
  Mail,
  Phone,
  CreditCard,
  FileSignature,
  User,
  CalendarDays,
  ArrowLeft,
  Building2,
  Zap,
} from "lucide-react";

function formatMoney(cents: number) {
  return `$${(cents / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user || !isStaff(session.user.role)) {
    redirect("/dashboard");
  }

  const { id } = await params;

  let data;
  try {
    data = await getStudentDetail(id);
  } catch {
    notFound();
  }

  const { application, invoices, tuition } = data;
  const student = application.student;
  const parent = application.parent;
  const monthlyAmount =
    invoices.length > 0
      ? Math.round(tuition.totalBilled / Math.max(invoices.length, 1))
      : 0;

  // Auto-pay + payment methods + comprehensive payment history
  const [autoPay, paymentMethods, allPayments] = await Promise.all([
    db.autoPaySettings.findUnique({ where: { userId: parent.id } }),
    db.paymentMethod.findMany({
      where: { userId: parent.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    }),
    db.payment.findMany({
      where: { applicationId: application.id },
      orderBy: [{ paidAt: "desc" }, { createdAt: "desc" }],
    }),
  ]);

  const apMethod =
    paymentMethods.find((m) => m.id === autoPay?.paymentMethodId) ??
    paymentMethods.find((m) => m.isDefault) ??
    paymentMethods[0] ??
    null;

  const unpaidInvoices = invoices.filter((i) => i.status !== "paid");

  const deriveMonth = (desc?: string | null): string => {
    if (!desc) return "—";
    const m = desc.match(
      /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\b/i
    );
    if (m) return m[0];
    const m2 = desc.match(/month\s+(\d+)/i);
    if (m2) return `Installment ${m2[1]}`;
    return "—";
  };

  const paymentRows = allPayments.map((p) => ({
    id: p.id,
    paidAt: p.paidAt
      ? new Date(p.paidAt).toLocaleDateString()
      : new Date(p.createdAt).toLocaleDateString(),
    monthFor: deriveMonth(p.description),
    amount: p.amount,
    method:
      p.description?.match(/via ([^()]+?)(?: \(|$)/)?.[1]?.trim() ??
      (p.description?.includes("Card")
        ? "Card"
        : p.description?.includes("Bank")
          ? "Bank"
          : "—"),
    status: p.status,
    description: p.description ?? p.type.replace(/_/g, " "),
  }));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <LinkButton href="/admin/students/list" variant="ghost" size="sm">
          <ArrowLeft className="h-3.5 w-3.5 mr-1" /> All Students
        </LinkButton>
      </div>

      <ModeHeader
        mode="school_year"
        section="Student Detail"
        title={
          student
            ? `${student.firstName} ${student.lastName}`
            : application.referenceNumber
        }
        description={`Enrolled in ${application.academicYear} • Ref ${application.referenceNumber}`}
        actions={
          <MessageParentDialog
            parentId={parent.id}
            parentName={parent.name ?? parent.email}
            parentEmail={parent.email}
            parentPhone={parent.phone}
            studentName={
              student ? `${student.firstName} ${student.lastName}` : undefined
            }
          />
        }
      />

      {/* Student header card */}
      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-start gap-5">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-xl font-bold shrink-0">
            {student
              ? `${student.firstName[0]}${student.lastName[0]}`
              : "--"}
          </div>
          <div className="flex-1 grid sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Full Name</p>
              <p className="font-medium">
                {student
                  ? `${student.firstName} ${student.middleName ?? ""} ${
                      student.lastName
                    }`
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Date of Birth</p>
              <p className="font-medium">
                {student?.dateOfBirth
                  ? new Date(student.dateOfBirth).toLocaleDateString()
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Enrollment Date</p>
              <p className="font-medium">
                {new Date(application.updatedAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Academic Year</p>
              <p className="font-medium">{application.academicYear}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Gender</p>
              <p className="font-medium">{student?.gender ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Contact</p>
              <p className="font-medium">
                {student?.email ?? student?.phone ?? "—"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Family */}
        <div className="rounded-xl border bg-card lg:col-span-1">
          <div className="px-6 py-4 border-b flex items-center gap-2">
            <User className="h-4 w-4" />
            <h2 className="font-semibold">Family</h2>
          </div>
          <div className="p-6 space-y-5">
            {/* Primary Account Holder */}
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Account Holder
              </p>
              <p className="font-medium">{parent.name}</p>
              <div className="flex flex-col gap-1 mt-1.5 text-sm text-muted-foreground">
                {parent.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{parent.email}</span>
                  </div>
                )}
                {parent.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    <span>{parent.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Father */}
            {(() => {
              const father = application.fatherInfo as Record<string, string> | null;
              if (!father || (!father.firstName && !father.lastName)) return null;
              return (
                <div className="border-t pt-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    Father
                  </p>
                  <p className="font-medium text-sm">
                    {father.salutation && `${father.salutation} `}
                    {father.firstName} {father.lastName}
                  </p>
                  {father.occupation && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {father.occupation}
                    </p>
                  )}
                  <div className="flex flex-col gap-1 mt-1.5 text-xs text-muted-foreground">
                    {father.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3 shrink-0" />
                        <span className="truncate">{father.email}</span>
                      </div>
                    )}
                    {(father.phone || father.primaryPhone) && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3 shrink-0" />
                        <span>{father.phone || father.primaryPhone}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Mother */}
            {(() => {
              const mother = application.motherInfo as Record<string, string> | null;
              if (!mother || (!mother.firstName && !mother.lastName)) return null;
              return (
                <div className="border-t pt-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    Mother
                  </p>
                  <p className="font-medium text-sm">
                    {mother.salutation && `${mother.salutation} `}
                    {mother.firstName} {mother.lastName}
                  </p>
                  {mother.occupation && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {mother.occupation}
                    </p>
                  )}
                  <div className="flex flex-col gap-1 mt-1.5 text-xs text-muted-foreground">
                    {mother.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3 shrink-0" />
                        <span className="truncate">{mother.email}</span>
                      </div>
                    )}
                    {(mother.phone || mother.primaryPhone) && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3 shrink-0" />
                        <span>{mother.phone || mother.primaryPhone}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Emergency Contact */}
            {(() => {
              const emergency = application.emergencyContact as Record<string, string> | null;
              if (!emergency || !emergency.name) return null;
              return (
                <div className="border-t pt-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    Emergency Contact
                  </p>
                  <p className="font-medium text-sm">{emergency.name}</p>
                  {emergency.relationship && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {emergency.relationship}
                    </p>
                  )}
                  {emergency.phone && (
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                      <Phone className="h-3 w-3 shrink-0" />
                      <span>{emergency.phone}</span>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>

        {/* Tuition summary */}
        <div className="rounded-xl border bg-card lg:col-span-2">
          <div className="px-6 py-4 border-b flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <h2 className="font-semibold">Tuition Summary</h2>
          </div>
          <div className="p-6 grid sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Total Billed</p>
              <p className="text-lg font-bold">
                {formatMoney(tuition.totalBilled)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Scholarship</p>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {formatMoney(tuition.scholarshipAmount)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Paid</p>
              <p className="text-lg font-bold">
                {formatMoney(tuition.totalPaid)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Balance</p>
              <p
                className={`text-lg font-bold ${
                  tuition.balance > 0
                    ? "text-amber-600"
                    : "text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {formatMoney(tuition.balance)}
              </p>
            </div>
            <div className="sm:col-span-4 pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                Avg monthly (est.)
              </p>
              <p className="text-base font-semibold">
                {formatMoney(monthlyAmount)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Auto-Pay & Payment Method */}
      <div className="rounded-xl border bg-card">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            <h2 className="font-semibold">Auto-Pay & Payment Method</h2>
          </div>
          <AdminChargeInvoice
            invoices={unpaidInvoices.map((i) => ({
              id: i.id,
              invoiceNumber: i.invoiceNumber,
              total: i.total,
              amountPaid: i.amountPaid,
            }))}
            methods={paymentMethods.map((m) => ({
              id: m.id,
              type: m.type,
              last4: m.last4,
              brand: m.brand,
              bankName: m.bankName,
            }))}
          />
        </div>
        <div className="p-6 grid sm:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Auto-Pay Status</p>
            {autoPay?.enabled ? (
              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-transparent">
                ON
              </Badge>
            ) : (
              <Badge variant="outline" className="text-muted-foreground">
                OFF
              </Badge>
            )}
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Method on File</p>
            {apMethod ? (
              <p className="font-medium flex items-center gap-2">
                {apMethod.type === "CREDIT_CARD" ? (
                  <CreditCard className="h-3.5 w-3.5" />
                ) : (
                  <Building2 className="h-3.5 w-3.5" />
                )}
                {apMethod.type === "CREDIT_CARD"
                  ? `${apMethod.brand ?? "Card"} •••• ${apMethod.last4}`
                  : `${apMethod.bankName ?? "Bank"} •••• ${apMethod.last4}`}
              </p>
            ) : (
              <p className="text-muted-foreground">None saved</p>
            )}
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Saved Methods</p>
            <p className="font-medium">{paymentMethods.length}</p>
          </div>
        </div>
      </div>

      {/* Comprehensive Payment History */}
      <div className="rounded-xl border bg-card">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            <h2 className="font-semibold">Payment History</h2>
          </div>
          <ExportPaymentsButton
            rows={paymentRows.map((p) => ({
              paidAt: p.paidAt,
              monthFor: p.monthFor,
              amount: p.amount,
              method: p.method,
              status: p.status,
              description: p.description,
            }))}
            filename={`payments-${student?.lastName ?? "student"}.csv`}
          />
        </div>
        {paymentRows.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            No payments recorded yet.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date Paid</TableHead>
                <TableHead>Month Paid For</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentRows.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.paidAt}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {p.monthFor}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatMoney(p.amount)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {p.method}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        p.status === "SUCCEEDED"
                          ? "border-transparent bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                          : ""
                      }
                    >
                      {p.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate text-xs text-muted-foreground">
                    {p.description}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Invoices */}
        <div className="rounded-xl border bg-card">
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <h2 className="font-semibold">Invoices</h2>
            <LinkButton href="/admin/billing" variant="ghost" size="xs">
              Manage
            </LinkButton>
          </div>
          {invoices.length > 0 ? (
            <div className="divide-y">
              {invoices.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between px-6 py-3"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {inv.invoiceNumber}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Due {new Date(inv.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      {formatMoney(inv.total)}
                    </p>
                    <p className="text-xs text-muted-foreground uppercase">
                      {inv.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-sm text-muted-foreground">
              No invoices yet
            </div>
          )}
        </div>

        {/* Recent Payments */}
        <div className="rounded-xl border bg-card">
          <div className="px-6 py-4 border-b flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            <h2 className="font-semibold">Recent Payments</h2>
          </div>
          {application.payments.length > 0 ? (
            <div className="divide-y">
              {application.payments.slice(0, 10).map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between px-6 py-3"
                >
                  <div>
                    <p className="text-sm font-medium">{p.type}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.paidAt
                        ? new Date(p.paidAt).toLocaleDateString()
                        : new Date(p.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                      {formatMoney(p.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground uppercase">
                      {p.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-sm text-muted-foreground">
              No payments recorded
            </div>
          )}
        </div>
      </div>

      {/* Signed Documents */}
      <div className="rounded-xl border bg-card">
        <div className="px-6 py-4 border-b flex items-center gap-2">
          <FileSignature className="h-4 w-4" />
          <h2 className="font-semibold">Signed Documents</h2>
        </div>
        {application.documents.length > 0 ? (
          <div className="divide-y">
            {application.documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between px-6 py-3"
              >
                <div>
                  <p className="text-sm font-medium">{doc.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {doc.signedAt
                      ? `Signed ${new Date(
                          doc.signedAt
                        ).toLocaleDateString()}`
                      : "Not yet signed"}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground uppercase">
                  {doc.status.replace(/_/g, " ")}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-sm text-muted-foreground">
            No documents on file
          </div>
        )}
      </div>
    </div>
  );
}
