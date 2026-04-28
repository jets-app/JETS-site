import { auth } from "@/server/auth";
import { isStaff } from "@/lib/roles";
import { redirect } from "next/navigation";
import { getDocumentTemplates, getDocumentStats, seedDefaultTemplates } from "@/server/actions/document.actions";
import { DocumentTemplateList } from "./_components/document-template-list";

export default async function DocumentsPage() {
  const session = await auth();
  if (!session?.user || !isStaff(session.user.role)) {
    redirect("/dashboard");
  }

  const [templates, stats] = await Promise.all([
    getDocumentTemplates(),
    getDocumentStats(),
  ]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Document Templates
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage enrollment documents and e-signing templates.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Total Documents",
            value: stats.total,
            color: "text-foreground",
          },
          {
            label: "Awaiting Signature",
            value:
              (stats.statusMap["SENT"] ?? 0) +
              (stats.statusMap["VIEWED"] ?? 0),
            color: "text-blue-600",
          },
          {
            label: "Completed",
            value: stats.statusMap["COMPLETED"] ?? 0,
            color: "text-green-600",
          },
          {
            label: "Expired / Voided",
            value:
              (stats.statusMap["EXPIRED"] ?? 0) +
              (stats.statusMap["VOIDED"] ?? 0),
            color: "text-muted-foreground",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border bg-card p-4 ring-1 ring-foreground/10"
          >
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <DocumentTemplateList
        templates={JSON.parse(JSON.stringify(templates))}
      />
    </div>
  );
}
