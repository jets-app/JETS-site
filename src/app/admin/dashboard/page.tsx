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
    <div className="max-w-4xl mx-auto space-y-10 pt-4 lg:pt-8">
      <div className="text-center space-y-3">
        <h1 className="admin-page-title !text-[32px] sm:!text-[36px]">
          Welcome to JETS Admin
        </h1>
        <p className="admin-page-subtitle !text-[15px]">
          Choose which system you&apos;d like to work in. You can switch anytime from
          the sidebar.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <Link
          href="/admin/admissions"
          className="group admin-card admin-card-interactive relative overflow-hidden p-7 sm:p-8 block"
        >
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full -mr-20 -mt-20 transition-transform duration-500 group-hover:scale-[1.8]"
            style={{ background: "rgba(163, 0, 24, 0.04)" }}
          />
          <div className="relative space-y-5">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: "#A30018" }}
            >
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em]"
                style={{ color: "#A30018" }}
              >
                Pre-Enrollment
              </div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">Admissions</h2>
              <p className="text-[13px] text-gray-500 leading-relaxed">
                Manage applications, review candidates, scholarships, and
                enrollment documents for the upcoming school year.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-[11px] text-gray-500">
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 font-medium">
                <FileText className="h-3 w-3" /> Applications
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 font-medium">
                <Sparkles className="h-3 w-3" /> Scholarships
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 font-medium">
                Reviews
              </span>
            </div>
            <div className="flex items-center gap-2 text-[13px] font-semibold"
              style={{ color: "#A30018" }}
            >
              Enter Admissions
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1.5 transition-transform duration-200" />
            </div>
          </div>
        </Link>

        <Link
          href="/admin/students"
          className="group admin-card admin-card-interactive relative overflow-hidden p-7 sm:p-8 block"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/[0.04] rounded-full -mr-20 -mt-20 transition-transform duration-500 group-hover:scale-[1.8]" />
          <div className="relative space-y-5">
            <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center">
              <School className="h-6 w-6 text-white" />
            </div>
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-600">
                Post-Enrollment
              </div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">School Year</h2>
              <p className="text-[13px] text-gray-500 leading-relaxed">
                Manage enrolled students, families, tuition, payments, and
                student records for the current academic year.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-[11px] text-gray-500">
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 font-medium">
                <Users className="h-3 w-3" /> Students
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 font-medium">
                <CreditCard className="h-3 w-3" /> Tuition
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 font-medium">
                Families
              </span>
            </div>
            <div className="flex items-center gap-2 text-[13px] font-semibold text-emerald-700">
              Enter School Year
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1.5 transition-transform duration-200" />
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
