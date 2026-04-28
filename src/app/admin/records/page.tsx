import { auth } from "@/server/auth";
import { isStaff } from "@/lib/roles";
import { redirect } from "next/navigation";
import { getStudentRecords } from "@/server/actions/school-year.actions";
import { ModeHeader } from "@/components/shared/mode-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LinkButton } from "@/components/shared/link-button";
import {
  CheckCircle2,
  XCircle,
  ClipboardList,
  FileSignature,
  ShieldAlert,
  Eye,
} from "lucide-react";

interface SearchParamsShape {
  filter?: string;
}

export default async function RecordsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsShape>;
}) {
  const session = await auth();
  if (!session?.user || !isStaff(session.user.role)) {
    redirect("/dashboard");
  }

  const sp = await searchParams;
  const records = await getStudentRecords();

  const filter = sp.filter;
  const filtered = records.filter((r) => {
    if (filter === "medical") return r.hasMedicalForm;
    if (filter === "handbook") return r.hasHandbook;
    if (filter === "emergency") return r.hasEmergencyContact;
    return true;
  });

  const withMedical = records.filter((r) => r.hasMedicalForm).length;
  const withHandbook = records.filter((r) => r.hasHandbook).length;
  const withEmergency = records.filter((r) => r.hasEmergencyContact).length;

  const filters = [
    { key: undefined, label: "All" },
    { key: "medical", label: "Medical form on file" },
    { key: "handbook", label: "Handbook signed" },
    { key: "emergency", label: "Emergency contact" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <ModeHeader
        mode="school_year"
        section="Student Records"
        title="Student Records"
        description="Medical forms, signed documents, and emergency contacts for enrolled students."
      />

      {/* Summary cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          {
            label: "Medical Forms on File",
            value: `${withMedical} / ${records.length}`,
            icon: ShieldAlert,
          },
          {
            label: "Handbooks Signed",
            value: `${withHandbook} / ${records.length}`,
            icon: FileSignature,
          },
          {
            label: "Emergency Contacts",
            value: `${withEmergency} / ${records.length}`,
            icon: ClipboardList,
          },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <s.icon className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => {
          const active = (f.key ?? undefined) === filter;
          return (
            <a
              key={f.label}
              href={f.key ? `/admin/records?filter=${f.key}` : "/admin/records"}
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                active
                  ? "bg-emerald-600 border-emerald-600 text-white"
                  : "bg-background hover:bg-muted"
              }`}
            >
              {f.label}
            </a>
          );
        })}
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        {filtered.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Parent</TableHead>
                <TableHead className="text-center">Medical</TableHead>
                <TableHead className="text-center">Handbook</TableHead>
                <TableHead className="text-center">Emergency</TableHead>
                <TableHead className="text-center">Docs</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.application.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-xs font-semibold">
                        {r.student
                          ? `${r.student.firstName[0]}${r.student.lastName[0]}`
                          : "--"}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {r.student
                            ? `${r.student.firstName} ${r.student.lastName}`
                            : "—"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {r.application.referenceNumber}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{r.parent.name}</TableCell>
                  <TableCell className="text-center">
                    {r.hasMedicalForm ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 inline" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground/40 inline" />
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {r.hasHandbook ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 inline" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground/40 inline" />
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {r.hasEmergencyContact ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 inline" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground/40 inline" />
                    )}
                  </TableCell>
                  <TableCell className="text-center text-sm">
                    {r.documentsCount}
                  </TableCell>
                  <TableCell className="text-right">
                    <LinkButton
                      href={`/admin/students/${r.application.id}`}
                      variant="outline"
                      size="xs"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </LinkButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="p-12 text-center text-sm text-muted-foreground">
            No records match this filter
          </div>
        )}
      </div>
    </div>
  );
}
