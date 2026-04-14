import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { db } from "@/server/db";
import { LinkButton } from "@/components/shared/link-button";
import {
  FileText,
  Clock,
  CheckCircle2,
  ArrowRight,
  Plus,
  FileSignature,
  CreditCard,
  MessageSquare,
  GraduationCap,
  Send,
  UserCheck,
  CalendarCheck,
  Loader2,
  XCircle,
} from "lucide-react";

// Status display config
const STATUS_CONFIG: Record<
  string,
  { label: string; description: string; color: string; icon: React.ElementType }
> = {
  DRAFT: {
    label: "Draft",
    description: "Your application is in progress. Complete all steps and submit.",
    color: "text-muted-foreground bg-muted",
    icon: FileText,
  },
  SUBMITTED: {
    label: "Submitted",
    description: "Your application has been submitted and is awaiting review by our office.",
    color: "text-blue-700 bg-blue-50",
    icon: Send,
  },
  OFFICE_REVIEW: {
    label: "Under Review",
    description: "Our admissions office is currently reviewing your application.",
    color: "text-amber-700 bg-amber-50",
    icon: Clock,
  },
  PRINCIPAL_REVIEW: {
    label: "Principal Review",
    description: "Your application has been forwarded to the principals for review.",
    color: "text-purple-700 bg-purple-50",
    icon: UserCheck,
  },
  INTERVIEW_SCHEDULED: {
    label: "Interview Scheduled",
    description: "An interview has been requested. Please check your email for the scheduling link.",
    color: "text-indigo-700 bg-indigo-50",
    icon: CalendarCheck,
  },
  INTERVIEW_COMPLETED: {
    label: "Interview Completed",
    description: "Your interview is complete. A decision will be made shortly.",
    color: "text-cyan-700 bg-cyan-50",
    icon: CalendarCheck,
  },
  ACCEPTED: {
    label: "Accepted",
    description: "Congratulations! You have been accepted to JETS School. Please complete the enrollment documents.",
    color: "text-emerald-700 bg-emerald-50",
    icon: CheckCircle2,
  },
  DOCUMENTS_PENDING: {
    label: "Documents Pending",
    description: "Please sign and return your enrollment documents to complete the process.",
    color: "text-orange-700 bg-orange-50",
    icon: FileSignature,
  },
  SCHOLARSHIP_REVIEW: {
    label: "Scholarship Under Review",
    description: "Your scholarship application is being reviewed.",
    color: "text-pink-700 bg-pink-50",
    icon: GraduationCap,
  },
  ENROLLED: {
    label: "Enrolled",
    description: "Welcome to JETS School! All enrollment steps are complete.",
    color: "text-emerald-700 bg-emerald-50",
    icon: GraduationCap,
  },
  REJECTED: {
    label: "Not Accepted",
    description: "We regret to inform you that your application was not accepted at this time.",
    color: "text-red-700 bg-red-50",
    icon: XCircle,
  },
  WAITLISTED: {
    label: "Waitlisted",
    description: "Your application has been placed on our waitlist. We will contact you if a spot opens.",
    color: "text-amber-700 bg-amber-50",
    icon: Clock,
  },
  WITHDRAWN: {
    label: "Withdrawn",
    description: "This application has been withdrawn.",
    color: "text-muted-foreground bg-muted",
    icon: XCircle,
  },
};

export default async function PortalDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const firstName = session.user.name?.split(" ")[0] || "there";

  // Get user's application (one per account)
  const application = await db.application.findFirst({
    where: { parentId: session.user.id },
    include: {
      student: true,
      recommendations: { select: { id: true, status: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const status = application?.status ?? null;
  const statusConfig = status ? STATUS_CONFIG[status] : null;
  const StatusIcon = statusConfig?.icon ?? FileText;

  const isAccepted = status
    ? ["ACCEPTED", "DOCUMENTS_PENDING", "SCHOLARSHIP_REVIEW", "ENROLLED"].includes(status)
    : false;

  const studentName = application?.student
    ? `${application.student.firstName} ${application.student.lastName}`
    : null;

  // Get counts for accepted students
  let pendingDocuments = 0;
  let unreadMessages = 0;

  try {
    const [docCount, msgCount] = await Promise.all([
      application && isAccepted
        ? db.document.count({
            where: {
              applicationId: application.id,
              status: { in: ["SENT", "VIEWED"] },
            },
          })
        : Promise.resolve(0),
      db.message.count({
        where: { receiverId: session.user.id, isRead: false },
      }),
    ]);
    pendingDocuments = docCount;
    unreadMessages = msgCount;
  } catch {
    // Silently fail
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Welcome back, {firstName}
        </h1>
        <p className="text-muted-foreground">
          {studentName
            ? `Application for ${studentName}`
            : "Manage your application and track your progress."}
        </p>
      </div>

      {/* ============ NO APPLICATION YET ============ */}
      {!application && (
        <div className="rounded-xl border bg-card p-8 sm:p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold mb-2">Ready to Apply?</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            Start your application to JETS School for the upcoming academic year.
            You can save your progress and come back anytime.
          </p>
          <LinkButton href="/portal/applications/new" size="lg">
            <Plus className="mr-2 h-4 w-4" />
            Start Your Application
          </LinkButton>
        </div>
      )}

      {/* ============ HAS APPLICATION ============ */}
      {application && statusConfig && (
        <>
          {/* Status Banner */}
          <div className={`rounded-xl border p-5 flex items-start gap-4 ${statusConfig.color}`}>
            <div className="w-10 h-10 rounded-lg bg-white/60 flex items-center justify-center shrink-0">
              <StatusIcon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold">{statusConfig.label}</h3>
                <span className="text-xs opacity-60">
                  {application.referenceNumber}
                </span>
              </div>
              <p className="text-sm opacity-80">{statusConfig.description}</p>
            </div>
            {status === "DRAFT" && (
              <LinkButton
                href={`/portal/applications/${application.id}/edit`}
                size="sm"
                className="shrink-0"
              >
                Continue
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </LinkButton>
            )}
          </div>

          {/* Action Cards — change based on status */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Application Card — always visible */}
            <div className="group rounded-xl border bg-card p-6 hover:shadow-lg hover:border-primary/20 transition-all duration-300">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">
                {status === "DRAFT" ? "Complete Application" : "View Application"}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {status === "DRAFT"
                  ? `Step ${application.currentStep} of 10 — ${application.completionPct}% complete`
                  : "View your submitted application details"}
              </p>
              <LinkButton
                href={
                  status === "DRAFT"
                    ? `/portal/applications/${application.id}/edit`
                    : `/portal/applications`
                }
                size="sm"
                variant={status === "DRAFT" ? "default" : "outline"}
              >
                {status === "DRAFT" ? "Continue Form" : "View Details"}
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </LinkButton>
            </div>

            {/* Documents Card — only after acceptance */}
            {isAccepted && (
              <div className="group rounded-xl border bg-card p-6 hover:shadow-lg hover:border-primary/20 transition-all duration-300">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center mb-4">
                  <FileSignature className="h-5 w-5 text-orange-600" />
                </div>
                <h3 className="font-semibold mb-1">Enrollment Documents</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {pendingDocuments > 0
                    ? `${pendingDocuments} document${pendingDocuments > 1 ? "s" : ""} pending your signature`
                    : "All documents completed"}
                </p>
                <LinkButton
                  href="/portal/documents"
                  size="sm"
                  variant="outline"
                >
                  {pendingDocuments > 0 ? "Sign Documents" : "View Documents"}
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </LinkButton>
              </div>
            )}

            {/* Payments Card — only after acceptance */}
            {isAccepted && (
              <div className="group rounded-xl border bg-card p-6 hover:shadow-lg hover:border-primary/20 transition-all duration-300">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4">
                  <CreditCard className="h-5 w-5 text-emerald-600" />
                </div>
                <h3 className="font-semibold mb-1">Tuition & Payments</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  View invoices and make tuition payments.
                </p>
                <LinkButton
                  href="/portal/payments"
                  size="sm"
                  variant="outline"
                >
                  View Payments
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </LinkButton>
              </div>
            )}

            {/* Messages Card — always visible */}
            <div className="group rounded-xl border bg-card p-6 hover:shadow-lg hover:border-primary/20 transition-all duration-300">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
                <MessageSquare className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-1">Messages</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {unreadMessages > 0
                  ? `${unreadMessages} unread message${unreadMessages > 1 ? "s" : ""}`
                  : "No new messages"}
              </p>
              <LinkButton
                href="/portal/messages"
                size="sm"
                variant="outline"
              >
                View Messages
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </LinkButton>
            </div>

            {/* Recommendation Status — only during application phase */}
            {status && ["DRAFT", "SUBMITTED", "OFFICE_REVIEW", "PRINCIPAL_REVIEW"].includes(status) && (
              <div className="group rounded-xl border bg-card p-6 hover:shadow-lg hover:border-primary/20 transition-all duration-300">
                <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center mb-4">
                  <UserCheck className="h-5 w-5 text-violet-600" />
                </div>
                <h3 className="font-semibold mb-1">Recommendations</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {application.recommendations.filter((r) => r.status === "COMPLETED").length} of{" "}
                  {application.recommendations.length} received
                </p>
                <LinkButton
                  href={`/portal/applications/${application.id}/edit`}
                  size="sm"
                  variant="outline"
                >
                  View Status
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </LinkButton>
              </div>
            )}
          </div>

          {/* Progress Timeline for submitted applications */}
          {status && status !== "DRAFT" && (
            <div className="rounded-xl border bg-card p-6">
              <h2 className="font-semibold mb-4">Application Progress</h2>
              <div className="space-y-3">
                {[
                  { step: "Application Submitted", done: true },
                  {
                    step: "Office Review",
                    done: ["OFFICE_REVIEW", "PRINCIPAL_REVIEW", "INTERVIEW_SCHEDULED", "INTERVIEW_COMPLETED", "ACCEPTED", "DOCUMENTS_PENDING", "SCHOLARSHIP_REVIEW", "ENROLLED"].includes(status) || status === "REJECTED",
                  },
                  {
                    step: "Principal Review",
                    done: ["PRINCIPAL_REVIEW", "INTERVIEW_SCHEDULED", "INTERVIEW_COMPLETED", "ACCEPTED", "DOCUMENTS_PENDING", "SCHOLARSHIP_REVIEW", "ENROLLED"].includes(status) || status === "REJECTED",
                  },
                  {
                    step: "Interview",
                    done: ["INTERVIEW_COMPLETED", "ACCEPTED", "DOCUMENTS_PENDING", "SCHOLARSHIP_REVIEW", "ENROLLED"].includes(status),
                  },
                  {
                    step: "Decision",
                    done: ["ACCEPTED", "DOCUMENTS_PENDING", "SCHOLARSHIP_REVIEW", "ENROLLED", "REJECTED"].includes(status),
                  },
                  {
                    step: "Enrollment Documents",
                    done: ["ENROLLED"].includes(status),
                  },
                  {
                    step: "Enrolled",
                    done: status === "ENROLLED",
                  },
                ].map((item, idx) => (
                  <div key={item.step} className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                        item.done
                          ? "bg-emerald-500 text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {item.done ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : (
                        <span className="text-xs">{idx + 1}</span>
                      )}
                    </div>
                    <span
                      className={`text-sm ${
                        item.done ? "font-medium" : "text-muted-foreground"
                      }`}
                    >
                      {item.step}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
