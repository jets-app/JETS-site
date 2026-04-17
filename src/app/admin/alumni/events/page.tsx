import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { getAlumniEvents, getEventStats } from "@/server/actions/alumni-events.actions";
import { EventsDashboard } from "./_components/events-dashboard";

interface PageProps {
  searchParams: Promise<{ status?: string; search?: string }>;
}

export default async function EventsPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const statusFilter = params.status as "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED" | undefined;

  const [eventsData, stats] = await Promise.all([
    getAlumniEvents({
      status: statusFilter,
      search: params.search || undefined,
    }),
    getEventStats(),
  ]);

  return (
    <div className="max-w-7xl mx-auto">
      <EventsDashboard
        events={eventsData.events}
        total={eventsData.total}
        stats={stats}
        selectedStatus={statusFilter ?? null}
        search={params.search ?? ""}
      />
    </div>
  );
}
