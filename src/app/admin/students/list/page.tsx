import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { getEnrolledStudents } from "@/server/actions/school-year.actions";
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
import { GraduationCap, Eye } from "lucide-react";

function formatMoney(cents: number) {
  return `$${(cents / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function TuitionBadge({
  status,
}: {
  status: "paid" | "overdue" | "current";
}) {
  const map = {
    paid: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    overdue: "bg-red-500/10 text-red-700 dark:text-red-300",
    current: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        map[status]
      )}
    >
      {status === "paid"
        ? "Paid"
        : status === "overdue"
        ? "Overdue"
        : "Current"}
    </span>
  );
}

export default async function StudentsListPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const students = await getEnrolledStudents();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <ModeHeader
        mode="school_year"
        section="Students"
        title="Students Directory"
        description={`${students.length} enrolled student${
          students.length === 1 ? "" : "s"
        } this school year.`}
      />

      <div className="rounded-xl border bg-card overflow-hidden">
        {students.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Program / Year</TableHead>
                <TableHead>Parent</TableHead>
                <TableHead>Tuition</TableHead>
                <TableHead>Next Payment</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((app) => (
                <TableRow key={app.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-xs font-semibold">
                        {app.student
                          ? `${app.student.firstName[0]}${app.student.lastName[0]}`
                          : "--"}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {app.student
                            ? `${app.student.firstName} ${app.student.lastName}`
                            : app.referenceNumber}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {app.referenceNumber}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {app.academicYear}
                  </TableCell>
                  <TableCell className="text-sm">
                    <div>
                      <p>{app.parent.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {app.parent.email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <TuitionBadge
                      status={
                        app.tuition.status as "paid" | "overdue" | "current"
                      }
                    />
                  </TableCell>
                  <TableCell className="text-sm">
                    {app.tuition.nextDueDate
                      ? new Date(
                          app.tuition.nextDueDate
                        ).toLocaleDateString()
                      : "—"}
                  </TableCell>
                  <TableCell className="text-sm font-semibold">
                    {formatMoney(app.tuition.balance)}
                  </TableCell>
                  <TableCell className="text-right">
                    <LinkButton
                      href={`/admin/students/${app.id}`}
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
          <div className="p-12 text-center">
            <GraduationCap className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No enrolled students yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
