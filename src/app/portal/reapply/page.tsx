import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { db } from "@/server/db";
import { ReapplicationForm } from "./_components/reapplication-form";
import { GraduationCap } from "lucide-react";

export const metadata = {
  title: "Reapplication — JETS Portal",
};

export default async function PortalReapplyPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/portal/reapply");

  // If already has a reapplication for current year, send them to its payment page
  const settings = await db.systemSettings.findFirst();
  const currentYear = settings?.currentAcademicYear ?? "2026-2027";
  const openYears = settings?.openSchoolYears ?? [currentYear];

  const existing = await db.application.findFirst({
    where: {
      parentId: session.user.id,
      type: "REAPPLICATION",
      academicYear: currentYear,
    },
    orderBy: { createdAt: "desc" },
    select: { id: true, applicationFeePaid: true },
  });

  if (existing && !existing.applicationFeePaid) {
    redirect(`/portal/reapply/${existing.id}/payment`);
  }
  if (existing && existing.applicationFeePaid) {
    redirect("/portal/dashboard");
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
          <GraduationCap className="h-3.5 w-3.5" />
          Reapplication for {currentYear}
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Welcome back to JETS
        </h1>
        <p className="text-muted-foreground">
          Just a few quick details and you&apos;re done.
        </p>
      </div>

      <ReapplicationForm openYears={openYears} defaultYear={currentYear} />
    </div>
  );
}
