import { auth } from "@/server/auth";
import { isStaff } from "@/lib/roles";
import { redirect, notFound } from "next/navigation";
import { getApplicationDetail, getValidTransitions } from "@/server/actions/admin.actions";
import { ApplicationDetailView } from "../_components/application-detail-view";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ApplicationDetailPage({ params }: PageProps) {
  const session = await auth();
  const role = session?.user?.role;
  if (!session?.user || !isStaff(role)) {
    redirect("/dashboard");
  }

  const { id } = await params;

  let application;
  try {
    application = await getApplicationDetail(id);
  } catch {
    notFound();
  }

  const validTransitions = await getValidTransitions(application.status, application.type);

  return (
    <ApplicationDetailView
      application={JSON.parse(JSON.stringify(application))}
      validTransitions={validTransitions}
      currentUserId={session.user.id!}
      currentUserRole={role}
    />
  );
}
