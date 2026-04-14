import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import {
  FileText,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  DollarSign,
  GraduationCap,
} from "lucide-react";

export default async function AdminDashboard() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground">
          Overview of applications, students, and school operations.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Applications",
            value: "0",
            change: "2026-2027",
            icon: FileText,
            color: "text-primary bg-primary/10",
          },
          {
            label: "Pending Review",
            value: "0",
            change: "Needs attention",
            icon: Clock,
            color: "text-amber-600 bg-amber-500/10",
          },
          {
            label: "Accepted",
            value: "0",
            change: "This year",
            icon: CheckCircle2,
            color: "text-emerald-600 bg-emerald-500/10",
          },
          {
            label: "Enrolled",
            value: "0",
            change: "Active students",
            icon: GraduationCap,
            color: "text-blue-600 bg-blue-500/10",
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
            <span className="text-xs text-muted-foreground">View all</span>
          </div>
          <div className="p-12 text-center">
            <FileText className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No applications yet
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl border bg-card">
          <div className="px-6 py-4 border-b">
            <h2 className="font-semibold">Quick Actions</h2>
          </div>
          <div className="p-4 space-y-2">
            {[
              {
                label: "Review Applications",
                desc: "Check pending applications",
                icon: FileText,
                href: "/admin/applications",
              },
              {
                label: "Send Message",
                desc: "Message parents or students",
                icon: Users,
                href: "/admin/messages",
              },
              {
                label: "Manage Billing",
                desc: "Invoices and payments",
                icon: DollarSign,
                href: "/admin/billing",
              },
              {
                label: "View Reports",
                desc: "Analytics and insights",
                icon: TrendingUp,
                href: "/admin/settings",
              },
            ].map((action) => (
              <a
                key={action.label}
                href={action.href}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <action.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">{action.label}</p>
                  <p className="text-xs text-muted-foreground">{action.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
