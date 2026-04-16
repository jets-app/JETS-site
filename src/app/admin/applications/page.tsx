import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getAllApplications, getApplicationStats, getAcademicYears } from "@/server/actions/admin.actions";
import { ApplicationsTable } from "./_components/applications-table";
import type { ApplicationStatus } from "@prisma/client";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    status?: ApplicationStatus;
    year?: string;
    page?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }>;
}

export default async function AdminApplicationsPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const params = await searchParams;

  const [data, stats, academicYears] = await Promise.all([
    getAllApplications({
      search: params.search,
      status: params.status,
      academicYear: params.year,
      page: params.page ? parseInt(params.page) : 1,
      pageSize: 20,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
    }),
    getApplicationStats(),
    getAcademicYears(),
  ]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Applications
          </h1>
          <p className="text-muted-foreground">
            Manage and review all student applications for {stats.academicYear}.
          </p>
        </div>
        <Link
          href="/admin/applications/pipeline"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="opacity-60">
            <rect x="1" y="1" width="4" height="14" rx="1" stroke="currentColor" strokeWidth="1.5"/>
            <rect x="6" y="4" width="4" height="11" rx="1" stroke="currentColor" strokeWidth="1.5"/>
            <rect x="11" y="7" width="4" height="8" rx="1" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
          Pipeline View
        </Link>
      </div>

      {/* Status summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Draft", key: "DRAFT", color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" },
          { label: "Submitted", key: "SUBMITTED", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
          { label: "In Review", key: "OFFICE_REVIEW", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300" },
          { label: "Accepted", key: "ACCEPTED", color: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" },
          { label: "Enrolled", key: "ENROLLED", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" },
          { label: "Rejected", key: "REJECTED", color: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" },
        ].map((s) => (
          <div
            key={s.key}
            className="rounded-xl border bg-card p-3 text-center"
          >
            <p className="text-2xl font-bold">{stats.statusMap[s.key] ?? 0}</p>
            <p className={`text-xs font-medium mt-1 inline-flex px-2 py-0.5 rounded-full ${s.color}`}>
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Table */}
      <ApplicationsTable
        applications={data.applications}
        pagination={data.pagination}
        academicYears={academicYears}
        currentFilters={{
          search: params.search ?? "",
          status: params.status ?? "",
          year: params.year ?? "",
        }}
      />
    </div>
  );
}
