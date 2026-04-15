import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import {
  getSchoolYearStats,
  getEnrolledStudents,
} from "@/server/actions/school-year.actions";
import { LinkButton } from "@/components/shared/link-button";
import { ModeHeader } from "@/components/shared/mode-header";
import {
  GraduationCap,
  DollarSign,
  AlertTriangle,
  Wallet,
  CreditCard,
  ArrowRight,
  Calendar,
  MessageSquare,
  FileText,
  Users,
} from "lucide-react";

function formatMoney(cents: number) {
  return `$${(cents / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default async function SchoolYearDashboard() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const [stats, students] = await Promise.all([
    getSchoolYearStats(),
    getEnrolledStudents(),
  ]);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <ModeHeader
        mode="school_year"
        section="Dashboard"
        title="School Year Dashboard"
        description={`Enrolled students, tuition, and family activity for ${stats.academicYear}.`}
      />

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Enrolled Students",
            value: stats.enrolledCount.toString(),
            change: stats.academicYear,
            icon: GraduationCap,
            color:
              "text-emerald-600 bg-emerald-500/10 dark:text-emerald-400",
          },
          {
            label: "Tuition Collected",
            value: formatMoney(stats.tuitionCollected),
            change: "This school year",
            icon: DollarSign,
            color: "text-emerald-600 bg-emerald-500/10",
          },
          {
            label: "Outstanding Balance",
            value: formatMoney(stats.outstanding),
            change: "Across all families",
            icon: Wallet,
            color: "text-amber-600 bg-amber-500/10",
          },
          {
            label: "Overdue Payments",
            value: stats.overdueCount.toString(),
            change: stats.overdueCount > 0 ? "Needs follow-up" : "All current",
            icon: AlertTriangle,
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

      {/* Quick Actions */}
      <div className="rounded-xl border bg-card">
        <div className="px-6 py-4 border-b">
          <h2 className="font-semibold">Quick Actions</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4">
          {[
            {
              label: "Record Payment",
              desc: "Log tuition received",
              icon: CreditCard,
              href: "/admin/billing",
            },
            {
              label: "Send Invoice",
              desc: "Create new invoice",
              icon: FileText,
              href: "/admin/billing",
            },
            {
              label: "Message Parents",
              desc: "Communicate with families",
              icon: MessageSquare,
              href: "/admin/messages",
            },
            {
              label: "View Records",
              desc: "Medical & documents",
              icon: Users,
              href: "/admin/records",
            },
          ].map((action) => (
            <a
              key={action.label}
              href={action.href}
              className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
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

      {/* Two column */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming tuition due */}
        <div className="rounded-xl border bg-card">
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <h2 className="font-semibold">Upcoming Tuition Due</h2>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </div>
          {stats.upcoming.length > 0 ? (
            <div className="divide-y">
              {stats.upcoming.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between px-6 py-3"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {formatMoney(inv.total - inv.amountPaid)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Due {new Date(inv.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground uppercase">
                    {inv.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <Calendar className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No upcoming tuition due
              </p>
            </div>
          )}
        </div>

        {/* Recent payments */}
        <div className="rounded-xl border bg-card">
          <div className="px-6 py-4 border-b">
            <h2 className="font-semibold">Recent Payments</h2>
          </div>
          {stats.recentPayments.length > 0 ? (
            <div className="divide-y">
              {stats.recentPayments.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between px-6 py-3"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {p.application?.student
                        ? `${p.application.student.firstName} ${p.application.student.lastName}`
                        : "Unknown"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {p.paidAt
                        ? new Date(p.paidAt).toLocaleDateString()
                        : "Pending"}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    {formatMoney(p.amount)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <DollarSign className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No payments yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Enrolled Students list */}
      <div className="rounded-xl border bg-card">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="font-semibold">Enrolled Students</h2>
          <LinkButton href="/admin/students/list" variant="ghost" size="xs">
            View all
            <ArrowRight className="h-3 w-3 ml-1" />
          </LinkButton>
        </div>
        {students.length > 0 ? (
          <div className="divide-y">
            {students.slice(0, 8).map((app) => (
              <a
                key={app.id}
                href={`/admin/students/${app.id}`}
                className="grid grid-cols-[auto_1fr_auto_auto] gap-4 items-center px-6 py-3 hover:bg-muted/50 transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-xs font-semibold">
                  {app.student
                    ? `${app.student.firstName[0]}${app.student.lastName[0]}`
                    : "--"}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">
                    {app.student
                      ? `${app.student.firstName} ${app.student.lastName}`
                      : app.referenceNumber}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {app.parent.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">
                    {formatMoney(app.tuition.balance)}
                  </p>
                  <p className="text-xs text-muted-foreground">balance</p>
                </div>
                <div className="text-right">
                  {app.tuition.nextDueDate ? (
                    <p className="text-xs text-muted-foreground">
                      Next:{" "}
                      {new Date(app.tuition.nextDueDate).toLocaleDateString()}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">—</p>
                  )}
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <GraduationCap className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No enrolled students yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
