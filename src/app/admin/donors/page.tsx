import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import {
  getDonors,
  getDonorStats,
  getTopDonors,
  getDonationsByCampaign,
} from "@/server/actions/donor.actions";
import { DonorDashboard } from "./_components/donor-dashboard";

interface PageProps {
  searchParams: Promise<{ search?: string; page?: string }>;
}

export default async function DonorsPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const search = params.search ?? "";
  const page = params.page ? parseInt(params.page, 10) : 1;

  const [donorData, stats, topDonors, campaigns] = await Promise.all([
    getDonors({ search: search || undefined, page, pageSize: 50 }),
    getDonorStats(),
    getTopDonors(10),
    getDonationsByCampaign(),
  ]);

  return (
    <div className="max-w-7xl mx-auto">
      <DonorDashboard
        donors={donorData.donors}
        total={donorData.total}
        stats={stats}
        topDonors={topDonors}
        campaigns={campaigns}
        search={search}
      />
    </div>
  );
}
