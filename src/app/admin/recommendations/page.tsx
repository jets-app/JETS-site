import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { db } from "@/server/db";
import { ModeHeader } from "@/components/shared/mode-header";
import { LinkButton } from "@/components/shared/link-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Mail, Clock, CheckCircle2, Eye, FileText } from "lucide-react";

const statusStyles: Record<string, string> = {
  PENDING: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  SENT: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  VIEWED:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  COMPLETED:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  EXPIRED: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

export default async function RecommendationsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const recs = await db.recommendation.findMany({
    orderBy: { sentAt: "desc" },
    take: 200,
    include: {
      application: {
        include: {
          student: {
            select: { firstName: true, lastName: true },
          },
        },
      },
    },
  });

  const byStatus = {
    total: recs.length,
    pending: recs.filter((r) => r.status === "PENDING").length,
    sent: recs.filter((r) => r.status === "SENT").length,
    viewed: recs.filter((r) => r.status === "VIEWED").length,
    completed: recs.filter((r) => r.status === "COMPLETED").length,
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <ModeHeader
        mode="admissions"
        section="Recommendations"
        title="Recommendations"
        description="Track recommendation letter requests sent to referees."
      />

      <div className="grid sm:grid-cols-4 gap-4">
        {[
          {
            label: "Total",
            value: byStatus.total,
            icon: FileText,
          },
          {
            label: "Pending / Sent",
            value: byStatus.pending + byStatus.sent,
            icon: Mail,
          },
          {
            label: "Viewed",
            value: byStatus.viewed,
            icon: Eye,
          },
          {
            label: "Completed",
            value: byStatus.completed,
            icon: CheckCircle2,
          },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <s.icon className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        {recs.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Referee</TableHead>
                <TableHead>Applicant</TableHead>
                <TableHead>Relation</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sent</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recs.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">{r.refereeName}</p>
                      <p className="text-xs text-muted-foreground">
                        {r.refereeEmail}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {r.application.student
                      ? `${r.application.student.firstName} ${r.application.student.lastName}`
                      : r.application.referenceNumber}
                  </TableCell>
                  <TableCell className="text-sm">
                    {r.refereeRelation}
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                        statusStyles[r.status] ?? "bg-muted"
                      )}
                    >
                      {r.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(r.sentAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(r.expiresAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <LinkButton
                      href={`/admin/applications/${r.applicationId}`}
                      variant="outline"
                      size="xs"
                    >
                      View App
                    </LinkButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="p-12 text-center">
            <Clock className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No recommendations yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
