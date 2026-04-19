import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { getMentors, getMentorshipMatches, getMentorStats } from "@/server/actions/mentorship.actions";
import { getAlumni } from "@/server/actions/alumni.actions";
import { MentorDashboard } from "./_components/mentor-dashboard";
import { AlumniTabs } from "../_components/alumni-tabs";

export default async function MentorsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const [mentorsData, matches, stats, alumniData] = await Promise.all([
    getMentors(),
    getMentorshipMatches(),
    getMentorStats(),
    getAlumni({ pageSize: 500 }),
  ]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Alumni</h1>
        <p className="text-muted-foreground">Mentorship program management.</p>
      </div>

      <AlumniTabs />

      <MentorDashboard
        mentors={mentorsData.mentors}
        matches={matches}
        stats={stats}
        alumni={alumniData.alumni}
      />
    </div>
  );
}
