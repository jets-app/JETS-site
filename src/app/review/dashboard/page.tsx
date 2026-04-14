import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import {
  getApplicationsForReview,
  getReviewDashboardStats,
} from "@/server/actions/review.actions";
import { LinkButton } from "@/components/shared/link-button";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  Card,
  CardContent,
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
  FileText,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Eye,
} from "lucide-react";

export default async function ReviewDashboard() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const role = session.user.role;
  if (role !== "PRINCIPAL" && role !== "REVIEWER" && role !== "ADMIN") {
    redirect("/dashboard");
  }

  const [stats, applications] = await Promise.all([
    getReviewDashboardStats(),
    getApplicationsForReview(),
  ]);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Review Dashboard
        </h1>
        <p className="text-muted-foreground">
          Applications assigned for review &middot; {stats.academicYear}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                <ClipboardList className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.toReview}</p>
                <p className="text-xs text-muted-foreground">To Review</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.interviewsPending}</p>
                <p className="text-xs text-muted-foreground">
                  Interviews Pending
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.acceptedThisYear}</p>
                <p className="text-xs text-muted-foreground">
                  Accepted This Year
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Applications Table */}
      {applications.length > 0 ? (
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Applications for Review
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        {app.student?.photoUrl ? (
                          <img
                            src={app.student.photoUrl}
                            alt=""
                            className="w-8 h-8 rounded-full object-cover ring-1 ring-border"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                            {app.student
                              ? `${app.student.firstName[0]}${app.student.lastName[0]}`
                              : "?"}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-sm">
                            {app.student
                              ? `${app.student.firstName} ${app.student.lastName}`
                              : "No student info"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {app.parent.name}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs">
                        {app.referenceNumber}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={app.status} />
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">
                        {app.submittedAt
                          ? new Date(app.submittedAt).toLocaleDateString()
                          : "--"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <LinkButton
                        href={`/review/applications/${app.id}`}
                        variant="outline"
                        size="sm"
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        Review
                      </LinkButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-xl border bg-card p-12 text-center">
          <FileText className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <h3 className="font-medium text-muted-foreground mb-1">
            No applications to review
          </h3>
          <p className="text-sm text-muted-foreground/70">
            When the office forwards applications, they&apos;ll appear here.
          </p>
        </div>
      )}
    </div>
  );
}
