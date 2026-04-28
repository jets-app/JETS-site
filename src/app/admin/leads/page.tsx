import { auth } from "@/server/auth";
import { isStaff } from "@/lib/roles";
import { redirect } from "next/navigation";
import { getInquiries } from "@/server/actions/inquiry.actions";
import { LeadsTable } from "./_components/leads-table";
import { ApplicationsTabs } from "../applications/_components/applications-tabs";

export default async function LeadsPage() {
  const session = await auth();
  if (!session?.user || !isStaff(session.user.role)) {
    redirect("/dashboard");
  }

  const { inquiries, total } = await getInquiries({ limit: 100 });

  const serialized = inquiries.map((inq) => ({
    ...inq,
    createdAt: inq.createdAt.toISOString(),
    updatedAt: inq.updatedAt.toISOString(),
    preferredDate: inq.preferredDate?.toISOString() ?? null,
    followUpAt: inq.followUpAt?.toISOString() ?? null,
  }));

  const newCount = inquiries.filter((i) => i.status === "NEW").length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Leads &amp; Applications
        </h1>
        <p className="text-muted-foreground">
          {total} total inquiries{newCount > 0 ? ` — ${newCount} new` : ""}.
          Manage leads from website contact and inquiry forms.
        </p>
      </div>

      <ApplicationsTabs />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "New", count: inquiries.filter((i) => i.status === "NEW").length, color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
          { label: "Contacted", count: inquiries.filter((i) => i.status === "CONTACTED").length, color: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" },
          { label: "Tour Scheduled", count: inquiries.filter((i) => i.status === "TOUR_SCHEDULED").length, color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300" },
          { label: "Converted", count: inquiries.filter((i) => i.status === "CONVERTED").length, color: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border bg-card p-3 text-center">
            <p className="text-2xl font-bold">{s.count}</p>
            <p className={`text-xs font-medium mt-1 inline-flex px-2 py-0.5 rounded-full ${s.color}`}>
              {s.label}
            </p>
          </div>
        ))}
      </div>

      <LeadsTable inquiries={serialized} total={total} />
    </div>
  );
}
