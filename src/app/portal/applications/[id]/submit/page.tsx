import { notFound, redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { LinkButton } from "@/components/shared/link-button";
import { ChevronLeft, CheckCircle2 } from "lucide-react";
import { SubmitButton } from "./submit-button";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ReviewSubmitPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const application = await db.application.findUnique({
    where: { id },
    include: {
      student: true,
      recommendations: { select: { id: true, status: true } },
    },
  });

  if (!application) notFound();
  if (application.parentId !== session.user.id) notFound();

  if (application.status !== "DRAFT") {
    redirect("/portal/applications");
  }

  const step1Complete = application.completionPct >= 90 &&
    !!application.student && !!application.hebrewNames &&
    !!application.fatherInfo && !!application.essay;
  const step2Complete = !!application.student?.photoUrl;
  const step3Complete = application.recommendations.filter(r => r.status === "COMPLETED").length >= 2;
  const step4Complete = application.applicationFeePaid;

  const allComplete = step1Complete && step2Complete && step3Complete && step4Complete;

  if (!allComplete) {
    redirect("/portal/applications");
  }

  const studentName = application.student
    ? `${application.student.firstName} ${application.student.lastName}`
    : "the applicant";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <LinkButton href="/portal/applications" variant="ghost" size="sm" className="-ml-2">
          <ChevronLeft className="size-4" />
          Back to Application
        </LinkButton>
      </div>

      <div className="rounded-xl border bg-card p-8 space-y-6">
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Submit Your Application</h1>
          <p className="text-muted-foreground">
            All 4 steps are complete. Review the summary below and submit{" "}
            {studentName}&apos;s application to JETS.
          </p>
        </div>

        <div className="space-y-2 pt-4">
          {[
            { label: "Application Form", complete: step1Complete },
            { label: "Student Photo", complete: step2Complete },
            { label: "Recommendation Letters", complete: step3Complete },
            { label: "Application Fee Paid", complete: step4Complete },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <span className="text-sm font-medium">{item.label}</span>
              <span className="text-xs font-medium text-emerald-600 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                Complete
              </span>
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-medium mb-1">Before you submit</p>
          <p>Once submitted, you cannot make further changes to your application. Make sure all information is accurate.</p>
        </div>

        <SubmitButton applicationId={application.id} />
      </div>
    </div>
  );
}
