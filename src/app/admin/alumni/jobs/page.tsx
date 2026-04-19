import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { getJobPostings, getJobStats } from "@/server/actions/jobs.actions";
import { JobBoardDashboard } from "./_components/job-board-dashboard";
import { AlumniTabs } from "../_components/alumni-tabs";

interface PageProps {
  searchParams: Promise<{ status?: string; search?: string }>;
}

export default async function JobBoardPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const statusFilter = params.status as "ACTIVE" | "CLOSED" | "EXPIRED" | undefined;

  const [jobsData, stats] = await Promise.all([
    getJobPostings({
      status: statusFilter,
      search: params.search || undefined,
    }),
    getJobStats(),
  ]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Alumni</h1>
        <p className="text-muted-foreground">Job board for alumni career opportunities.</p>
      </div>

      <AlumniTabs />

      <JobBoardDashboard
        jobs={jobsData.jobs}
        total={jobsData.total}
        stats={stats}
        selectedStatus={statusFilter ?? null}
        search={params.search ?? ""}
      />
    </div>
  );
}
