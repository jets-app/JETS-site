import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { getMentors, getMentorshipMatches, getMentorStats } from "@/server/actions/mentorship.actions";
import { getAlumni } from "@/server/actions/alumni.actions";
import { MentorDashboard } from "./_components/mentor-dashboard";

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
    <div className="max-w-7xl mx-auto">
      <MentorDashboard
        mentors={mentorsData.mentors}
        matches={matches}
        stats={stats}
        alumni={alumniData.alumni}
      />
    </div>
  );
}
