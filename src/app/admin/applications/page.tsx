import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { getAllApplications, getApplicationStats, getAcademicYears } from "@/server/actions/admin.actions";
import { ApplicationsTable } from "./_components/applications-table";
import { ApplicationsTabs } from "./_components/applications-tabs";
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
      <div className="space-y-1">
        <h1 className="admin-page-title">
          Leads &amp; Applications
        </h1>
        <p className="admin-page-subtitle">
          Manage and review all student applications for {stats.academicYear}.
        </p>
      </div>

      <ApplicationsTabs />

      {/* Status summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Draft", key: "DRAFT", badgeClass: "admin-badge admin-badge-gray" },
          { label: "Submitted", key: "SUBMITTED", badgeClass: "admin-badge admin-badge-blue" },
          { label: "In Review", key: "OFFICE_REVIEW", badgeClass: "admin-badge admin-badge-yellow" },
          { label: "Accepted", key: "ACCEPTED", badgeClass: "admin-badge admin-badge-green" },
          { label: "Enrolled", key: "ENROLLED", badgeClass: "admin-badge admin-badge-emerald" },
          { label: "Rejected", key: "REJECTED", badgeClass: "admin-badge admin-badge-red" },
        ].map((s) => (
          <div
            key={s.key}
            className="admin-stat-card text-center"
          >
            <p className="admin-stat-value !text-2xl">{stats.statusMap[s.key] ?? 0}</p>
            <p className={`mt-2 ${s.badgeClass}`}>
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
