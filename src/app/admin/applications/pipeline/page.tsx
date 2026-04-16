import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  getApplicationsByStatus,
  getApplicationStats,
} from "@/server/actions/admin.actions";
import { PipelineBoard } from "./_components/pipeline-board";

export default async function PipelinePage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const [{ grouped, academicYear }, stats] = await Promise.all([
    getApplicationsByStatus(),
    getApplicationStats(),
  ]);

  const total = Object.values(stats.statusMap).reduce((a, b) => a + b, 0);

  return (
    <div className="max-w-full mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Application Pipeline
          </h1>
          <p className="text-muted-foreground">
            {total} applications for {academicYear} — drag to change status.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/applications"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="opacity-60">
              <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
              <rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
              <rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
              <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            Table View
          </Link>
        </div>
      </div>

      <PipelineBoard grouped={grouped as Record<string, never[]>} />
    </div>
  );
}
