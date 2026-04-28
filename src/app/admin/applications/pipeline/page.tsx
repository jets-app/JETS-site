import { auth } from "@/server/auth";
import { isStaff } from "@/lib/roles";
import { redirect } from "next/navigation";
import { ApplicationsTabs } from "../_components/applications-tabs";
import {
  getApplicationsByStatus,
  getApplicationStats,
} from "@/server/actions/admin.actions";
import { PipelineBoard } from "./_components/pipeline-board";

export default async function PipelinePage() {
  const session = await auth();
  if (!session?.user || !isStaff(session.user.role)) {
    redirect("/dashboard");
  }

  const [{ grouped, academicYear }, stats] = await Promise.all([
    getApplicationsByStatus(),
    getApplicationStats(),
  ]);

  const total = Object.values(stats.statusMap).reduce((a, b) => a + b, 0);

  return (
    <div className="max-w-full mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Leads &amp; Applications
        </h1>
        <p className="text-muted-foreground">
          {total} applications for {academicYear} — drag to change status.
        </p>
      </div>

      <ApplicationsTabs />

      <PipelineBoard grouped={grouped as Record<string, never[]>} />
    </div>
  );
}
