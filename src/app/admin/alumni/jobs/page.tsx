import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { getJobPostings, getJobStats } from "@/server/actions/jobs.actions";
import { JobBoardDashboard } from "./_components/job-board-dashboard";

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
    <div className="max-w-7xl mx-auto">
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
