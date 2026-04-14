import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { db } from "@/server/db";
import { LinkButton } from "@/components/shared/link-button";
import {
  FileText,
  Camera,
  Mail,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  Plus,
  Lock,
  Loader2,
  Send,
} from "lucide-react";

export default async function ApplicationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Get the single application for this parent (one per account)
  const application = await db.application.findFirst({
    where: { parentId: session.user.id },
    include: {
      student: true,
      recommendations: { select: { id: true, status: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // No application yet — show Start button
  if (!application) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            My Application
          </h1>
          <p className="text-muted-foreground">
            Your application to JETS School for the upcoming academic year.
          </p>
        </div>

        <div className="rounded-xl border bg-card p-8 sm:p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold mb-2">Start Your Application</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            Begin your application to JETS School. You can save your progress
            and return at any time.
          </p>
          <LinkButton href="/portal/applications/new" size="lg">
            <Plus className="mr-2 h-4 w-4" />
            Start Application
          </LinkButton>
        </div>
      </div>
    );
  }

  const isSubmitted = application.status !== "DRAFT";
  const studentName = application.student
    ? `${application.student.firstName} ${application.student.lastName}`
    : "Your Application";

  // Determine completion of each of the 4 steps
  const step1_FormComplete = application.completionPct >= 90; // application form mostly done
  const step2_PhotoUploaded = !!application.student?.photoUrl;
  const step3_RecommendationsAdded = application.recommendations.length >= 2;
  const step3_RecommendationsCompleted =
    application.recommendations.filter((r) => r.status === "COMPLETED").length >=
    2;
  const step4_FeePaid = application.applicationFeePaid;

  const allStepsComplete =
    step1_FormComplete &&
    step2_PhotoUploaded &&
    step3_RecommendationsCompleted &&
    step4_FeePaid;

  const steps = [
    {
      number: 1,
      title: "Complete Application Form",
      description: "Fill out all 10 sections of the application.",
      icon: FileText,
      complete: step1_FormComplete,
      locked: false,
      href: `/portal/applications/${application.id}/edit`,
      status:
        application.completionPct > 0 && !step1_FormComplete
          ? `${application.completionPct}% complete`
          : undefined,
      action: step1_FormComplete ? "Review" : application.completionPct > 0 ? "Continue" : "Start",
    },
    {
      number: 2,
      title: "Upload Student Photo",
      description: "A recent photo of the applicant for our records.",
      icon: Camera,
      complete: step2_PhotoUploaded,
      locked: false,
      href: `/portal/applications/${application.id}/photo`,
      action: step2_PhotoUploaded ? "Change Photo" : "Upload Photo",
    },
    {
      number: 3,
      title: "Send Recommendation Letters",
      description: "Send requests to 2 referees (past teachers, principals, or rabbis).",
      icon: Mail,
      complete: step3_RecommendationsCompleted,
      locked: false,
      href: `/portal/applications/${application.id}/recommendations`,
      status: !step3_RecommendationsAdded
        ? undefined
        : step3_RecommendationsCompleted
          ? undefined
          : `${application.recommendations.filter((r) => r.status === "COMPLETED").length} of 2 received`,
      action: !step3_RecommendationsAdded
        ? "Add References"
        : step3_RecommendationsCompleted
          ? "View Status"
          : "View Status",
    },
    {
      number: 4,
      title: "Pay Application Fee",
      description: "$500 non-refundable application fee.",
      icon: CreditCard,
      complete: step4_FeePaid,
      locked: false,
      href: `/portal/applications/${application.id}/payment`,
      action: step4_FeePaid ? "View Receipt" : "Pay $500",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          {studentName}
        </h1>
        <p className="text-muted-foreground">
          {application.referenceNumber} &middot; {application.academicYear}
          {isSubmitted && (
            <span className="ml-2 inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
              <CheckCircle2 className="h-3 w-3" />
              Submitted
            </span>
          )}
        </p>
      </div>

      {/* Submitted state */}
      {isSubmitted && (
        <div className="rounded-xl border bg-emerald-50 text-emerald-700 p-5">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Application Submitted</p>
              <p className="text-sm opacity-80 mt-0.5">
                Your application has been submitted successfully. You&apos;ll be
                notified as it progresses through review.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4-Step Checklist */}
      {!isSubmitted && (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Application Steps</h2>
            <span className="text-sm text-muted-foreground">
              {steps.filter((s) => s.complete).length} of {steps.length} complete
            </span>
          </div>

          <div className="space-y-3">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.number}
                  className={`rounded-xl border bg-card p-5 transition-all ${
                    step.complete
                      ? "border-emerald-200 bg-emerald-50/30"
                      : step.locked
                        ? "opacity-60"
                        : "hover:border-primary/20 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Number / Check icon */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        step.complete
                          ? "bg-emerald-500 text-white"
                          : step.locked
                            ? "bg-muted text-muted-foreground"
                            : "bg-primary/10 text-primary"
                      }`}
                    >
                      {step.complete ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : step.locked ? (
                        <Lock className="h-4 w-4" />
                      ) : (
                        <span className="font-semibold text-sm">
                          {step.number}
                        </span>
                      )}
                    </div>

                    {/* Icon + text */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                        <h3 className="font-semibold truncate">
                          {step.title}
                        </h3>
                        {step.complete && (
                          <span className="text-xs font-medium text-emerald-600 shrink-0">
                            Complete
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {step.description}
                      </p>
                      {step.status && (
                        <p className="text-xs text-amber-600 mt-1 font-medium">
                          <Loader2 className="inline h-3 w-3 mr-1 animate-spin" />
                          {step.status}
                        </p>
                      )}
                    </div>

                    {/* Action button */}
                    {!step.locked && (
                      <LinkButton
                        href={step.href}
                        variant={step.complete ? "outline" : "default"}
                        size="sm"
                        className="shrink-0"
                      >
                        {step.action}
                        <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                      </LinkButton>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Submit application */}
          {allStepsComplete && (
            <div className="rounded-xl border-2 border-primary bg-primary/5 p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <Send className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Ready to Submit</h3>
                  <p className="text-sm text-muted-foreground">
                    All steps complete. Submit your application to JETS School.
                  </p>
                </div>
                <LinkButton
                  href={`/portal/applications/${application.id}/edit`}
                  size="lg"
                >
                  Review & Submit
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </LinkButton>
              </div>
            </div>
          )}

          {!allStepsComplete && (
            <div className="rounded-xl border bg-muted/30 p-5 flex items-center gap-3">
              <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
              <p className="text-sm text-muted-foreground">
                Complete all 4 steps above to submit your application.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
