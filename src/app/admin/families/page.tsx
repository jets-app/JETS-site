import { auth } from "@/server/auth";
import { isStaff } from "@/lib/roles";
import { redirect } from "next/navigation";
import { getFamilies } from "@/server/actions/school-year.actions";
import { ModeHeader } from "@/components/shared/mode-header";
import {
  Mail,
  Phone,
  HomeIcon,
  GraduationCap,
  Users,
} from "lucide-react";

function formatMoney(cents: number) {
  return `$${(cents / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default async function FamiliesPage() {
  const session = await auth();
  if (!session?.user || !isStaff(session.user.role)) {
    redirect("/dashboard");
  }

  const families = await getFamilies();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <ModeHeader
        mode="school_year"
        section="Families"
        title="Families"
        description={`${families.length} famil${
          families.length === 1 ? "y" : "ies"
        } with enrolled students.`}
      />

      {families.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-4">
          {families.map((family) => (
            <div
              key={family.parent.id}
              className="rounded-xl border bg-card overflow-hidden"
            >
              <div className="px-6 py-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                    <HomeIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold">
                      The {family.parent.name?.split(" ").pop() ?? "Family"}{" "}
                      Family
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {family.students.length} student
                      {family.students.length === 1 ? "" : "s"} enrolled
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`text-sm font-semibold ${
                      family.balance > 0
                        ? "text-amber-600"
                        : "text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    {formatMoney(family.balance)}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase">
                    Balance
                  </p>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {/* Parent contact */}
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Parent</p>
                  <p className="text-sm font-medium">{family.parent.name}</p>
                  <div className="mt-1 space-y-0.5 text-sm text-muted-foreground">
                    {family.parent.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        <span>{family.parent.email}</span>
                      </div>
                    )}
                    {family.parent.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3" />
                        <span>{family.parent.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Students */}
                <div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Students Enrolled
                  </p>
                  <div className="space-y-1">
                    {family.students.map((app) => (
                      <a
                        key={app.id}
                        href={`/admin/students/${app.id}`}
                        className="flex items-center gap-2 rounded-lg border px-3 py-2 hover:bg-muted/50 transition-colors"
                      >
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {app.student
                            ? `${app.student.firstName} ${app.student.lastName}`
                            : app.referenceNumber}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>

                {/* Billing summary */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t text-center">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">
                      Billed
                    </p>
                    <p className="text-sm font-semibold">
                      {formatMoney(family.totalBilled)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">
                      Paid
                    </p>
                    <p className="text-sm font-semibold">
                      {formatMoney(family.totalPaid)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">
                      Balance
                    </p>
                    <p className="text-sm font-semibold">
                      {formatMoney(family.balance)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border bg-card p-12 text-center">
          <Users className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            No enrolled families yet
          </p>
        </div>
      )}
    </div>
  );
}
