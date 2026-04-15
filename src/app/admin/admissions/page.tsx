import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import {
  getDashboardStats,
  getApplicationStats,
} from "@/server/actions/admin.actions";
import { LinkButton } from "@/components/shared/link-button";
import { StatusBadge } from "@/components/shared/status-badge";
import { ModeHeader } from "@/components/shared/mode-header";
import {
  FileText,
  Clock,
  CheckCircle2,
  GraduationCap,
  XCircle,
  PauseCircle,
  ArrowRight,
  MessageSquare,
  Sparkles,
  BarChart3,
} from "lucide-react";

export default async function AdmissionsDashboard() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const [stats, appStats] = await Promise.all([
    getDashboardStats(),
    getApplicationStats(),
  ]);

  const waitlisted = appStats.statusMap["WAITLISTED"] ?? 0;
  const rejected = appStats.statusMap["REJECTED"] ?? 0;

  const pipeline = [
    { label: "Draft", value: appStats.statusMap["DRAFT"] ?? 0 },
    { label: "Submitted", value: appStats.statusMap["SUBMITTED"] ?? 0 },
    { label: "Office Review", value: appStats.statusMap["OFFICE_REVIEW"] ?? 0 },
    {
      label: "Principal Review",
      value: appStats.statusMap["PRINCIPAL_REVIEW"] ?? 0,
    },
    {
      label: "Interview Scheduled",
      value: appStats.statusMap["INTERVIEW_SCHEDULED"] ?? 0,
    },
    {
      label: "Interview Completed",
      value: appStats.statusMap["INTERVIEW_COMPLETED"] ?? 0,
    },
    { label: "Accepted", value: appStats.statusMap["ACCEPTED"] ?? 0 },
    {
      label: "Scholarship Review",
      value: appStats.statusMap["SCHOLARSHIP_REVIEW"] ?? 0,
    },
    { label: "Enrolled", value: appStats.statusMap["ENROLLED"] ?? 0 },
    { label: "Waitlisted", value: waitlisted },
    { label: "Rejected", value: rejected },
  ];
  const maxPipelineValue = Math.max(1, ...pipeline.map((p) => p.value));

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <ModeHeader
        mode="admissions"
        section="Dashboard"
        title="Admissions Dashboard"
        description={`Application pipeline and admissions activity for ${stats.academicYear}.`}
      />

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          {
            label: "Total Applications",
            value: stats.total.toString(),
            change: stats.academicYear,
            icon: FileText,
            color: "text-primary bg-primary/10",
          },
          {
            label: "Pending Review",
            value: stats.pending.toString(),
            change: stats.pending > 0 ? "Needs attention" : "All clear",
            icon: Clock,
            color: "text-amber-600 bg-amber-500/10",
          },
          {
            label: "Accepted",
            value: stats.accepted.toString(),
            change: "This year",
            icon: CheckCircle2,
            color: "text-emerald-600 bg-emerald-500/10",
          },
          {
            label: "Waitlisted",
            value: waitlisted.toString(),
            change: "On waitlist",
            icon: PauseCircle,
            color: "text-amber-600 bg-amber-500/10",
          },
          {
            label: "Rejected",
            value: rejected.toString(),
            change: "Not accepted",
            icon: XCircle,
            color: "text-red-600 bg-red-500/10",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border bg-card p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center ${stat.color}`}
              >
                <stat.icon className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Two column layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <div className="rounded-xl border bg-card">
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <h2 className="font-semibold">Recent Applications</h2>
            <LinkButton href="/admin/applications" variant="ghost" size="xs">
              View all
              <ArrowRight className="h-3 w-3 ml-1" />
            </LinkButton>
          </div>
          {stats.recentApplications.length > 0 ? (
            <div className="divide-y">
              {stats.recentApplications.map((app) => (
                <a
                  key={app.id}
                  href={`/admin/applications/${app.id}`}
                  className="flex items-center justify-between px-6 py-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                      {app.student
                        ? `${app.student.firstName[0]}${app.student.lastName[0]}`
                        : "--"}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {app.student
                          ? `${app.student.firstName} ${app.student.lastName}`
                          : app.referenceNumber}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={app.status} />
                </a>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <FileText className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No applications yet
              </p>
            </div>
          )}
        </div>

        {/* Pipeline */}
        <div className="rounded-xl border bg-card">
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <h2 className="font-semibold">Pipeline by Status</h2>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="p-6 space-y-3">
            {pipeline.map((row) => (
              <div key={row.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="font-semibold">{row.value}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{
                      width: `${(row.value / maxPipelineValue) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl border bg-card">
        <div className="px-6 py-4 border-b">
          <h2 className="font-semibold">Quick Actions</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4">
          {[
            {
              label: "Review Applications",
              desc: `${stats.pending} pending`,
              icon: FileText,
              href: "/admin/applications?status=SUBMITTED",
            },
            {
              label: "Send Messages",
              desc: "Parent communications",
              icon: MessageSquare,
              href: "/admin/messages",
            },
            {
              label: "View Scholarships",
              desc: "Scholarship requests",
              icon: Sparkles,
              href: "/admin/scholarships",
            },
            {
              label: "Enrollment Documents",
              desc: "Templates & signatures",
              icon: GraduationCap,
              href: "/admin/documents",
            },
          ].map((action) => (
            <a
              key={action.label}
              href={action.href}
              className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <action.icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{action.label}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {action.desc}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
