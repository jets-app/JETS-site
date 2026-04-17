import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import {
  getAlumni,
  getAlumniYears,
  getAlumniStats,
  getAlumniPrograms,
} from "@/server/actions/alumni.actions";
import { AlumniDashboard } from "./_components/alumni-dashboard";

interface PageProps {
  searchParams: Promise<{
    year?: string;
    search?: string;
    page?: string;
    program?: string;
    location?: string;
  }>;
}

export default async function AlumniPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const yearParam = params.year ? parseInt(params.year, 10) : undefined;
  const search = params.search ?? "";
  const page = params.page ? parseInt(params.page, 10) : 1;
  const program = params.program ?? undefined;
  const location = params.location ?? undefined;

  const [alumniData, years, stats, programs] = await Promise.all([
    getAlumni({
      graduationYear: yearParam,
      search: search || undefined,
      program,
      city: location,
      page,
      pageSize: 100,
    }),
    getAlumniYears(),
    getAlumniStats(),
    getAlumniPrograms(),
  ]);

  return (
    <div className="max-w-7xl mx-auto">
      <AlumniDashboard
        alumni={alumniData.alumni}
        total={alumniData.total}
        years={years}
        programs={programs}
        selectedYear={yearParam ?? null}
        selectedProgram={program ?? null}
        selectedLocation={location ?? null}
        search={search}
        stats={stats}
      />
    </div>
  );
}
