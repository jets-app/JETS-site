import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  School,
  ArrowRight,
  Users,
  CreditCard,
  Sparkles,
} from "lucide-react";

export default async function AdminDashboardPicker() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Welcome to JETS Admin
        </h1>
        <p className="text-muted-foreground">
          Choose which system you'd like to work in. You can switch anytime from
          the sidebar.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Link
          href="/admin/admissions"
          className="group relative overflow-hidden rounded-2xl border bg-card p-8 hover:shadow-xl transition-all hover:-translate-y-1"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform" />
          <div className="relative space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center">
              <FileText className="h-7 w-7" />
            </div>
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary">
                Pre-Enrollment
              </div>
              <h2 className="text-2xl font-bold">Admissions</h2>
              <p className="text-sm text-muted-foreground">
                Manage applications, review candidates, scholarships, and
                enrollment documents for the upcoming school year.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1">
                <FileText className="h-3 w-3" /> Applications
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1">
                <Sparkles className="h-3 w-3" /> Scholarships
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1">
                Reviews
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-primary">
              Enter Admissions
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>

        <Link
          href="/admin/students"
          className="group relative overflow-hidden rounded-2xl border bg-card p-8 hover:shadow-xl transition-all hover:-translate-y-1"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform" />
          <div className="relative space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white dark:bg-emerald-500 flex items-center justify-center">
              <School className="h-7 w-7" />
            </div>
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Post-Enrollment
              </div>
              <h2 className="text-2xl font-bold">School Year</h2>
              <p className="text-sm text-muted-foreground">
                Manage enrolled students, families, tuition, payments, and
                student records for the current academic year.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1">
                <Users className="h-3 w-3" /> Students
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1">
                <CreditCard className="h-3 w-3" /> Tuition
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1">
                Families
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
              Enter School Year
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
