import { auth } from "@/server/auth";
import { redirect, notFound } from "next/navigation";
import { getAlumniById } from "@/server/actions/alumni.actions";
import { AlumniProfile } from "../_components/alumni-profile";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AlumniDetailPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const { id } = await params;

  let alumni;
  try {
    alumni = await getAlumniById(id);
  } catch {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto">
      <AlumniProfile alumni={alumni} />
    </div>
  );
}
