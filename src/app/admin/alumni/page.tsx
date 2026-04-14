import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { getAlumni, getAlumniYears } from "@/server/actions/alumni.actions";
import { AlumniDashboard } from "./_components/alumni-dashboard";

interface PageProps {
  searchParams: Promise<{ year?: string; search?: string; page?: string }>;
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

  const [alumniData, years] = await Promise.all([
    getAlumni({
      graduationYear: yearParam,
      search: search || undefined,
      page,
      pageSize: 100,
    }),
    getAlumniYears(),
  ]);

  return (
    <div className="max-w-7xl mx-auto">
      <AlumniDashboard
        alumni={alumniData.alumni}
        total={alumniData.total}
        years={years}
        selectedYear={yearParam ?? null}
        search={search}
      />
    </div>
  );
}
