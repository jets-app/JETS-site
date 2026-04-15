import { auth } from "@/server/auth";
import { redirect, notFound } from "next/navigation";
import { getStudentDetail } from "@/server/actions/school-year.actions";
import { ModeHeader } from "@/components/shared/mode-header";
import { LinkButton } from "@/components/shared/link-button";
import {
  Mail,
  Phone,
  CreditCard,
  FileSignature,
  User,
  CalendarDays,
  MessageSquare,
  ArrowLeft,
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
  if (!session?.user || session.user.role !== "ADMIN") {
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
          <LinkButton href="/admin/messages" variant="outline" size="sm">
            <MessageSquare className="h-3.5 w-3.5 mr-1" />
            Message Parents
          </LinkButton>
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
          <div className="p-6 space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Primary Parent
              </p>
              <p className="font-medium">{parent.name}</p>
              <div className="flex flex-col gap-1 mt-2 text-sm text-muted-foreground">
                {parent.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5" />
                    <span>{parent.email}</span>
                  </div>
                )}
                {parent.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5" />
                    <span>{parent.phone}</span>
                  </div>
                )}
              </div>
            </div>
            <LinkButton
              href="/admin/families"
              variant="outline"
              size="sm"
              className="w-full"
            >
              View Family Record
            </LinkButton>
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
