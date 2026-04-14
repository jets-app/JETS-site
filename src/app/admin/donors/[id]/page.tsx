import { auth } from "@/server/auth";
import { redirect, notFound } from "next/navigation";
import { getDonorById } from "@/server/actions/donor.actions";
import { DonorProfile } from "../_components/donor-profile";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DonorDetailPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const { id } = await params;

  let donor;
  try {
    donor = await getDonorById(id);
  } catch {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto">
      <DonorProfile donor={donor} />
    </div>
  );
}
