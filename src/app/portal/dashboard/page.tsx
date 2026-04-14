import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { LinkButton } from "@/components/shared/link-button";
import {
  FileText,
  Clock,
  CheckCircle2,
  ArrowRight,
  Plus,
} from "lucide-react";

export default async function PortalDashboard() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const firstName = session.user.name?.split(" ")[0] || "there";

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Welcome back, {firstName}
        </h1>
        <p className="text-muted-foreground">
          Manage your applications and track your progress.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="group relative overflow-hidden rounded-xl border bg-card p-6 hover:shadow-lg hover:border-primary/20 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Plus className="h-5 w-5 text-primary" />
            </div>
          </div>
          <h3 className="font-semibold mb-1">Start New Application</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Begin your application to JETS School for the upcoming year.
          </p>
          <LinkButton href="/portal/applications/new" size="sm" variant="default">
            Apply Now
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </LinkButton>
        </div>

        <div className="group relative overflow-hidden rounded-xl border bg-card p-6 hover:shadow-lg hover:border-primary/20 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
          </div>
          <h3 className="font-semibold mb-1">Pending Applications</h3>
          <p className="text-sm text-muted-foreground mb-4">
            You have no pending applications at this time.
          </p>
          <LinkButton
            href="/portal/applications"
            size="sm"
            variant="outline"
          >
            View All
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </LinkButton>
        </div>

        <div className="group relative overflow-hidden rounded-xl border bg-card p-6 hover:shadow-lg hover:border-primary/20 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
          <h3 className="font-semibold mb-1">Documents</h3>
          <p className="text-sm text-muted-foreground mb-4">
            No documents pending your signature.
          </p>
          <LinkButton
            href="/portal/documents"
            size="sm"
            variant="outline"
          >
            View Documents
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </LinkButton>
        </div>
      </div>

      {/* Application Status */}
      <div className="rounded-xl border bg-card">
        <div className="px-6 py-4 border-b">
          <h2 className="font-semibold">Your Applications</h2>
        </div>
        <div className="p-12 text-center">
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
      </div>
    </div>
  );
}
