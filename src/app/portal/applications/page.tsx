import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { getMyApplications } from "@/server/actions/application.actions";
import { LinkButton } from "@/components/shared/link-button";
import {
  FileText,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const statusConfig: Record<
  string,
  { label: string; color: string; icon: typeof Clock }
> = {
  DRAFT: { label: "Draft", color: "text-muted-foreground", icon: Clock },
  SUBMITTED: { label: "Submitted", color: "text-blue-600", icon: FileText },
  OFFICE_REVIEW: {
    label: "Under Review",
    color: "text-amber-600",
    icon: Clock,
  },
  PRINCIPAL_REVIEW: {
    label: "Principal Review",
    color: "text-amber-600",
    icon: Clock,
  },
  INTERVIEW_SCHEDULED: {
    label: "Interview Scheduled",
    color: "text-purple-600",
    icon: Clock,
  },
  INTERVIEW_COMPLETED: {
    label: "Interview Complete",
    color: "text-purple-600",
    icon: CheckCircle2,
  },
  ACCEPTED: {
    label: "Accepted",
    color: "text-emerald-600",
    icon: CheckCircle2,
  },
  ENROLLED: {
    label: "Enrolled",
    color: "text-emerald-600",
    icon: CheckCircle2,
  },
  REJECTED: {
    label: "Not Accepted",
    color: "text-destructive",
    icon: AlertCircle,
  },
  WAITLISTED: { label: "Waitlisted", color: "text-amber-600", icon: Clock },
  WITHDRAWN: {
    label: "Withdrawn",
    color: "text-muted-foreground",
    icon: AlertCircle,
  },
};

export default async function ApplicationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const applications = await getMyApplications();

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            My Applications
          </h1>
          <p className="text-muted-foreground">
            Manage and track your applications to JETS School.
          </p>
        </div>
        <LinkButton href="/portal/applications/new">
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          New Application
        </LinkButton>
      </div>

      {applications.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <FileText className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <h3 className="font-medium text-muted-foreground mb-1">
            No applications yet
          </h3>
          <p className="text-sm text-muted-foreground/70 mb-4">
            Start your application to join JETS School.
          </p>
          <LinkButton href="/portal/applications/new" size="sm">
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Start Application
          </LinkButton>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const status =
              statusConfig[app.status] ?? statusConfig.DRAFT!;
            const StatusIcon = status.icon;
            const studentName = app.student
              ? `${app.student.firstName} ${app.student.lastName}`
              : "Not started";

            return (
              <div
                key={app.id}
                className="group rounded-xl border bg-card p-6 hover:shadow-lg hover:border-primary/20 transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">{studentName}</h3>
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-muted ${status.color}`}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {app.referenceNumber} &middot; {app.academicYear}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex-1 max-w-xs">
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${app.completionPct}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {app.completionPct}% complete
                      </span>
                    </div>
                  </div>
                  <LinkButton
                    href={
                      app.status === "DRAFT"
                        ? `/portal/applications/${app.id}/edit`
                        : `/portal/applications/${app.id}/edit`
                    }
                    variant="outline"
                    size="sm"
                  >
                    {app.status === "DRAFT" ? "Continue" : "View"}
                    <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </LinkButton>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
