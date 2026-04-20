import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { db } from "@/server/db";
import { LinkButton } from "@/components/shared/link-button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  GraduationCap,
  FileSignature,
  User,
  Calendar,
  School,
} from "lucide-react";

function formatDate(d: Date | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function ApplicationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const application = await db.application.findFirst({
    where: { parentId: session.user.id },
    include: {
      student: true,
      recommendations: { select: { id: true, status: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // No application yet
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

  const isEnrolled = application.status === "ENROLLED";
  const studentName = application.student
    ? `${application.student.firstName} ${application.student.lastName}`
    : "Your Application";

  // ==================== ENROLLED: Student Details View ====================
  if (isEnrolled && application.student) {
    const student = application.student;

    // Find an enrollment date — prefer latest completed document signedAt
    const enrollmentDoc = await db.document.findFirst({
      where: {
        applicationId: application.id,
        status: "COMPLETED",
      },
      orderBy: { signedAt: "desc" },
      select: { signedAt: true },
    });

    const enrollmentDate = enrollmentDoc?.signedAt ?? application.updatedAt;

    const addressLine = [
      student.addressLine1,
      student.addressLine2,
      [student.city, student.state, student.zipCode]
        .filter(Boolean)
        .join(", "),
    ]
      .filter(Boolean)
      .join(" · ");

    return (
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Student Details
          </h1>
          <p className="text-muted-foreground">
            {studentName} · Enrolled Student at JETS School
          </p>
        </div>

        {/* Status banner */}
        <div className="rounded-xl border bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-900/40 p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-white/60 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
            <GraduationCap className="h-5 w-5 text-emerald-700 dark:text-emerald-300" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-emerald-900 dark:text-emerald-200">
                Officially Enrolled
              </h3>
              <Badge
                variant="outline"
                className="border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
              >
                {application.academicYear}
              </Badge>
            </div>
            <p className="text-sm text-emerald-800/80 dark:text-emerald-300/80">
              Enrollment complete as of {formatDate(enrollmentDate)} for the{" "}
              {application.academicYear} academic year.
            </p>
          </div>
        </div>

        {/* Student Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Student Information
            </CardTitle>
            <CardDescription>
              On file with JETS School admissions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-4">
              <InfoRow label="Full Name" value={studentName} />
              <InfoRow
                label="Preferred Name"
                value={student.preferredName ?? "—"}
              />
              <InfoRow
                label="Date of Birth"
                value={formatDate(student.dateOfBirth)}
              />
              <InfoRow label="Gender" value={student.gender ?? "—"} />
              <InfoRow label="Email" value={student.email ?? "—"} />
              <InfoRow label="Phone" value={student.phone ?? "—"} />
              <div className="sm:col-span-2">
                <InfoRow label="Address" value={addressLine || "—"} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Program & Enrollment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <School className="h-5 w-5" />
              Program & Enrollment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-4">
              <InfoRow label="School" value="JETS School" />
              <InfoRow label="Academic Year" value={application.academicYear} />
              <InfoRow
                label="Current Status"
                value={
                  <Badge
                    variant="outline"
                    className="border-transparent bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                  >
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Enrolled
                  </Badge>
                }
              />
              <InfoRow
                label="Enrollment Date"
                value={
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    {formatDate(enrollmentDate)}
                  </span>
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Card className="hover:border-primary/30 transition-colors">
            <CardContent className="pt-0">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                  <FileSignature className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Documents</p>
                  <p className="text-xs text-muted-foreground">
                    Review signed enrollment documents.
                  </p>
                </div>
                <LinkButton
                  href="/portal/documents"
                  variant="outline"
                  size="sm"
                >
                  View
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </LinkButton>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:border-primary/30 transition-colors">
            <CardContent className="pt-0">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Tuition</p>
                  <p className="text-xs text-muted-foreground">
                    Schedule, balance, and payment history.
                  </p>
                </div>
                <LinkButton
                  href="/portal/payments"
                  variant="outline"
                  size="sm"
                >
                  View
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </LinkButton>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ==================== PRE-ENROLLMENT: Application checklist ====================
  const isSubmitted = application.status !== "DRAFT";

  // Determine completion of each of the 4 steps
  const step1_FormComplete = application.completionPct >= 90 &&
    !!application.student &&
    !!application.hebrewNames &&
    !!application.fatherInfo &&
    !!application.essay;
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
      action: step1_FormComplete
        ? "Review"
        : application.completionPct > 0
          ? "Continue"
          : "Start",
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
      description:
        "Send requests to 2 referees (past teachers, principals, or rabbis).",
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
          Application for {application.academicYear}
          {isSubmitted && (
            <span className="ml-2 inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
              <CheckCircle2 className="h-3 w-3" />
              Submitted
            </span>
          )}
        </p>
      </div>

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

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                        <h3 className="font-semibold truncate">{step.title}</h3>
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

                    {!step.locked && (
                      <LinkButton
                        href={step.href}
                        variant={step.complete ? "outline" : "default"}
                        size="sm"
                        className="shrink-0 min-w-[140px] justify-center"
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
                  href={`/portal/applications/${application.id}/submit`}
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

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
        {label}
      </p>
      <div className="text-sm">{value}</div>
    </div>
  );
}
