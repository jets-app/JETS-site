import { auth } from "@/server/auth";
import { isStaff } from "@/lib/roles";
import { redirect } from "next/navigation";
import {
  getEnrollmentFunnelReport,
  getFinancialReport,
  getApplicationTimelineReport,
  getRecommendationReport,
  getDonorReport,
} from "@/server/actions/reports.actions";
import { ReportsDashboard } from "./_components/reports-dashboard";

export default async function ReportsPage() {
  const session = await auth();
  if (!session?.user || !isStaff(session.user.role)) {
    redirect("/dashboard");
  }

  const [funnel, financial, timeline, recommendations, donors] =
    await Promise.all([
      getEnrollmentFunnelReport(),
      getFinancialReport(),
      getApplicationTimelineReport(),
      getRecommendationReport(),
      getDonorReport(),
    ]);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Reports
        </h1>
        <p className="text-muted-foreground">
          Enrollment, financial, and operational analytics for{" "}
          {funnel.academicYear}.
        </p>
      </div>

      <ReportsDashboard
        funnel={funnel}
        financial={financial}
        timeline={timeline}
        recommendations={recommendations}
        donors={donors}
      />
    </div>
  );
}
