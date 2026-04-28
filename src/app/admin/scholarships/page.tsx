import { auth } from "@/server/auth";
import { isStaff } from "@/lib/roles";
import { redirect } from "next/navigation";
import { db } from "@/server/db";
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
  GraduationCap,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  FileSearch,
} from "lucide-react";
import { ScholarshipReviewForm } from "./_components/scholarship-review-form";

function formatCents(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  SUBMITTED: {
    label: "Submitted",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  },
  UNDER_REVIEW: {
    label: "Under Review",
    className: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  },
  APPROVED: {
    label: "Approved",
    className: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  },
  DENIED: {
    label: "Denied",
    className: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  },
};

export default async function AdminScholarshipsPage() {
  const session = await auth();
  if (!session?.user || (!isStaff(session.user.role) && session.user.role !== "PRINCIPAL")) {
    redirect("/dashboard");
  }

  const scholarships = await db.scholarshipApplication.findMany({
    include: {
      application: {
        select: {
          referenceNumber: true,
          student: { select: { firstName: true, lastName: true } },
          parent: { select: { name: true, email: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Stats
  const stats = {
    total: scholarships.length,
    submitted: scholarships.filter((s) => s.status === "SUBMITTED").length,
    underReview: scholarships.filter((s) => s.status === "UNDER_REVIEW").length,
    approved: scholarships.filter((s) => s.status === "APPROVED").length,
    denied: scholarships.filter((s) => s.status === "DENIED").length,
    totalRequested: scholarships.reduce((s, a) => s + (a.requestedAmount ?? 0), 0),
    totalApproved: scholarships.reduce((s, a) => s + (a.approvedAmount ?? 0), 0),
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Scholarship Applications
        </h1>
        <p className="text-muted-foreground">
          Review and manage &quot;Pay It Forward&quot; scholarship applications.
        </p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Applications</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold">{stats.submitted + stats.underReview}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Requested</p>
                <p className="text-2xl font-bold">{formatCents(stats.totalRequested)}</p>
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
                <p className="text-sm text-muted-foreground">Total Approved</p>
                <p className="text-2xl font-bold">{formatCents(stats.totalApproved)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scholarships List */}
      {scholarships.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <GraduationCap className="h-10 w-10 mx-auto mb-3 opacity-40 text-muted-foreground" />
            <p className="text-muted-foreground">No scholarship applications received yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {scholarships.map((scholarship) => {
            const studentName = scholarship.application.student
              ? `${scholarship.application.student.firstName} ${scholarship.application.student.lastName}`
              : "Student";
            const parentName = scholarship.application.parent?.name ?? "Unknown";
            const sc = statusConfig[scholarship.status] ?? statusConfig.SUBMITTED;
            const financialInfo = scholarship.financialInfo as Record<string, unknown> | null;
            const fatherIncome = financialInfo?.fatherIncome as Record<string, unknown> | undefined;
            const motherIncome = financialInfo?.motherIncome as Record<string, unknown> | undefined;
            const fatherTotal = (fatherIncome?.totalIncome as number) ?? 0;
            const motherTotal = (motherIncome?.totalIncome as number) ?? 0;

            return (
              <Card key={scholarship.id}>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <CardTitle className="text-base">{studentName}</CardTitle>
                      <CardDescription>
                        {scholarship.application.referenceNumber} &mdash; Parent: {parentName} ({scholarship.application.parent?.email})
                      </CardDescription>
                    </div>
                    <Badge
                      variant="outline"
                      className={`border-transparent font-medium w-fit ${sc.className}`}
                    >
                      {sc.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">Father&apos;s Income</p>
                      <p className="text-lg font-semibold">
                        ${fatherTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">Mother&apos;s Income</p>
                      <p className="text-lg font-semibold">
                        ${motherTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">Can Afford</p>
                      <p className="text-lg font-semibold">
                        {scholarship.affordableAmount !== null
                          ? formatCents(scholarship.affordableAmount)
                          : "N/A"}
                      </p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">Requested</p>
                      <p className="text-lg font-semibold">
                        {scholarship.requestedAmount !== null
                          ? formatCents(scholarship.requestedAmount)
                          : "N/A"}
                      </p>
                    </div>
                  </div>

                  {scholarship.essayResponse && (
                    <div className="rounded-lg border p-3 mb-4 bg-muted/30">
                      <p className="text-xs text-muted-foreground mb-1">Reason for Request</p>
                      <p className="text-sm leading-relaxed">{scholarship.essayResponse}</p>
                    </div>
                  )}

                  {scholarship.approvedAmount !== null && (
                    <div className="rounded-lg border border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-900/20 p-3 mb-4">
                      <p className="text-xs text-muted-foreground mb-1">Approved Amount</p>
                      <p className="text-lg font-semibold text-green-700 dark:text-green-400">
                        {formatCents(scholarship.approvedAmount)}
                      </p>
                    </div>
                  )}

                  {scholarship.reviewNotes && (
                    <div className="rounded-lg border p-3 mb-4">
                      <p className="text-xs text-muted-foreground mb-1">Review Notes</p>
                      <p className="text-sm">{scholarship.reviewNotes}</p>
                    </div>
                  )}

                  {(scholarship.status === "SUBMITTED" || scholarship.status === "UNDER_REVIEW") && (
                    <ScholarshipReviewForm
                      scholarshipId={scholarship.id}
                      requestedAmount={scholarship.requestedAmount}
                    />
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
