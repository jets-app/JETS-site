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
  FileSignature,
  MessageSquare,
  GraduationCap,
  Send,
  UserCheck,
  CalendarCheck,
  Clock,
  XCircle,
  BookOpen,
} from "lucide-react";

// Status display config
const STATUS_CONFIG: Record<
  string,
  { label: string; description: string; color: string; icon: React.ElementType }
> = {
  DRAFT: {
    label: "Application in Progress",
    description: "Complete all steps and submit your application.",
    color: "text-muted-foreground bg-muted",
    icon: FileText,
  },
  SUBMITTED: {
    label: "Application Submitted",
    description: "Your application is awaiting review by our office.",
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
    label: "Interview Requested",
    description: "Please schedule your interview using the link in your email.",
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
    label: "Congratulations — You're Accepted!",
    description: "Please complete the enrollment documents below.",
    color: "text-emerald-700 bg-emerald-50",
    icon: CheckCircle2,
  },
  DOCUMENTS_PENDING: {
    label: "Enrollment Documents Pending",
    description: "Sign and return your enrollment documents to complete your enrollment.",
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
    label: "Officially Enrolled",
    description: "Welcome to JETS School! Your enrollment is complete.",
    color: "text-emerald-700 bg-emerald-50",
    icon: GraduationCap,
  },
  REJECTED: {
    label: "Application Not Accepted",
    description: "We regret to inform you that your application was not accepted at this time.",
    color: "text-red-700 bg-red-50",
    icon: XCircle,
  },
  WAITLISTED: {
    label: "Waitlisted",
    description: "Your application has been placed on our waitlist.",
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

  // Upcoming tuition invoice (for enrolled students)
  let upcomingInvoice: {
    id: string;
    invoiceNumber: string;
    dueDate: Date;
    balance: number;
  } | null = null;
  if (application?.status === "ENROLLED") {
    const next = await db.invoice.findFirst({
      where: {
        applicationId: application.id,
        status: { not: "paid" },
      },
      orderBy: { dueDate: "asc" },
    });
    if (next) {
      upcomingInvoice = {
        id: next.id,
        invoiceNumber: next.invoiceNumber,
        dueDate: next.dueDate,
        balance: next.total - next.amountPaid,
      };
    }
  }

  // Signed documents for enrolled students
  let signedDocuments: { id: string; title: string; token: string; signedAt: Date | null }[] = [];
  if (application?.status === "ENROLLED") {
    const docs = await db.document.findMany({
      where: {
        applicationId: application.id,
        status: "COMPLETED",
      },
      orderBy: { signedAt: "desc" },
      select: { id: true, title: true, token: true, signedAt: true },
      take: 6,
    });
    signedDocuments = docs;
  }

  const status = application?.status ?? null;
  const statusConfig = status ? STATUS_CONFIG[status] : null;
  const StatusIcon = statusConfig?.icon ?? FileText;

  const isAccepted = status
    ? ["ACCEPTED", "DOCUMENTS_PENDING", "SCHOLARSHIP_REVIEW"].includes(status)
    : false;
  const isEnrolled = status === "ENROLLED";
  const isInterviewStage = status === "INTERVIEW_SCHEDULED";

  const studentName = application?.student
    ? `${application.student.firstName} ${application.student.lastName}`
    : null;

  // Counts
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

  // ============ Build tasks list — what's actionable RIGHT NOW ============
  type Task = {
    title: string;
    description: string;
    icon: React.ElementType;
    href: string;
    action: string;
    color: string;
    priority: number;
  };

  const tasks: Task[] = [];

  if (!application) {
    tasks.push({
      title: "Start Your Application",
      description: "Begin your application to JETS School for the upcoming year.",
      icon: Plus,
      href: "/portal/applications/new",
      action: "Start Application",
      color: "text-primary bg-primary/10",
      priority: 1,
    });
  } else if (status === "DRAFT") {
    // Application phase — 4 steps
    const step1Complete = application.completionPct >= 90;
    const step2Complete = !!application.student?.photoUrl;
    const step3Complete =
      application.recommendations.filter((r) => r.status === "COMPLETED").length >= 2;
    const step3HasReferees = application.recommendations.length >= 2;
    const step4Complete = application.applicationFeePaid;

    // Always show continue application button
    tasks.push({
      title: step1Complete ? "Continue Application" : "Complete Application Form",
      description: step1Complete
        ? "Review your application or update your information."
        : application.completionPct > 0
          ? `Continue where you left off — ${application.completionPct}% done`
          : "Fill out the 10-section application form",
      icon: FileText,
      href: `/portal/applications/${application.id}/edit`,
      action: step1Complete ? "Open Application" : (application.completionPct > 0 ? "Continue" : "Start"),
      color: "text-primary bg-primary/10",
      priority: 1,
    });
    if (!step2Complete) {
      tasks.push({
        title: "Upload Student Photo",
        description: "Add a recent photo of the applicant to your application.",
        icon: Camera,
        href: `/portal/applications/${application.id}/photo`,
        action: "Upload Photo",
        color: "text-blue-600 bg-blue-500/10",
        priority: 2,
      });
    }
    if (!step3Complete) {
      tasks.push({
        title: !step3HasReferees ? "Send Recommendation Letters" : "Waiting for Recommendations",
        description: !step3HasReferees
          ? "Send requests to 2 referees (past teachers, principals, or rabbis)."
          : `${application.recommendations.filter((r) => r.status === "COMPLETED").length} of 2 received — view status and resend if needed`,
        icon: Mail,
        href: `/portal/applications/${application.id}/recommendations`,
        action: !step3HasReferees ? "Send Requests" : "View Status",
        color: "text-violet-600 bg-violet-500/10",
        priority: 3,
      });
    }
    if (!step4Complete) {
      tasks.push({
        title: "Pay Application Fee",
        description: "$500 application fee — pay to finalize your submission.",
        icon: CreditCard,
        href: `/portal/applications/${application.id}/payment`,
        action: "Pay $500",
        color: "text-emerald-600 bg-emerald-500/10",
        priority: 4,
      });
    }
    if (step1Complete && step2Complete && step3Complete && step4Complete) {
      tasks.push({
        title: "Submit Your Application",
        description: "All steps complete! Review and submit your application.",
        icon: Send,
        href: `/portal/applications/${application.id}/edit`,
        action: "Review & Submit",
        color: "text-primary bg-primary/15",
        priority: 0,
      });
    }
  } else if (isInterviewStage) {
    tasks.push({
      title: "Schedule Your Interview",
      description: "Book your interview using the Calendly link sent to your email.",
      icon: CalendarCheck,
      href: `/portal/applications/${application!.id}/edit`,
      action: "View Details",
      color: "text-indigo-600 bg-indigo-500/10",
      priority: 1,
    });
  } else if (isAccepted && pendingDocuments > 0) {
    tasks.push({
      title: "Sign Enrollment Documents",
      description: `${pendingDocuments} document${pendingDocuments > 1 ? "s" : ""} pending your signature (medical form, handbook, tuition contract, enrollment agreement).`,
      icon: FileSignature,
      href: "/portal/documents",
      action: "Sign Documents",
      color: "text-orange-600 bg-orange-500/10",
      priority: 1,
    });
  } else if (isEnrolled) {
    if (upcomingInvoice) {
      const dueStr = upcomingInvoice.dueDate.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
      const isOverdue = upcomingInvoice.dueDate < new Date();
      tasks.push({
        title: isOverdue
          ? `Overdue Tuition Payment — ${dueStr}`
          : `Upcoming Tuition Payment Due ${dueStr}`,
        description: `Invoice ${upcomingInvoice.invoiceNumber} · $${(upcomingInvoice.balance / 100).toFixed(2)} due.`,
        icon: CreditCard,
        href: "/portal/payments",
        action: "Pay Tuition",
        color: isOverdue
          ? "text-red-600 bg-red-500/10"
          : "text-emerald-600 bg-emerald-500/10",
        priority: 1,
      });
    } else {
      tasks.push({
        title: "Tuition Payment Portal",
        description:
          "View your tuition, scholarship, and monthly payment schedule.",
        icon: CreditCard,
        href: "/portal/payments",
        action: "View Tuition",
        color: "text-emerald-600 bg-emerald-500/10",
        priority: 1,
      });
    }
  }

  // Messages always at the end
  if (unreadMessages > 0) {
    tasks.push({
      title: `${unreadMessages} New Message${unreadMessages > 1 ? "s" : ""}`,
      description: "You have unread messages from the school.",
      icon: MessageSquare,
      href: "/portal/messages",
      action: "Read Messages",
      color: "text-blue-600 bg-blue-500/10",
      priority: 5,
    });
  }

  tasks.sort((a, b) => a.priority - b.priority);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Welcome back, {firstName}
        </h1>
        <p className="text-muted-foreground">
          {isEnrolled && studentName
            ? `${studentName} · Enrolled Student at JETS`
            : studentName
              ? `Application for ${studentName}`
              : "Manage your application and track your progress."}
        </p>
      </div>

      {/* Status Banner */}
      {application && statusConfig && (
        <div className={`rounded-xl border p-5 flex items-start gap-4 ${statusConfig.color}`}>
          <div className="w-10 h-10 rounded-lg bg-white/60 flex items-center justify-center shrink-0">
            <StatusIcon className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold">{statusConfig.label}</h3>
              <span className="text-xs opacity-60">
                {application.academicYear}
              </span>
            </div>
            <p className="text-sm opacity-80">{statusConfig.description}</p>
          </div>
        </div>
      )}

      {/* ============ NEXT ACTIONS (task-focused) ============ */}
      {tasks.length > 0 && (
        <div>
          <h2 className="font-semibold mb-4">
            {isEnrolled ? "Quick Actions" : "Next Steps"}
          </h2>
          <div className="space-y-3">
            {tasks.map((task) => {
              const Icon = task.icon;
              return (
                <div
                  key={task.title}
                  className="group rounded-xl border bg-card p-5 hover:shadow-md hover:border-primary/20 transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${task.color}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold">{task.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {task.description}
                      </p>
                    </div>
                    <LinkButton href={task.href} size="sm" className="shrink-0 min-w-[140px] justify-center">
                      {task.action}
                      <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </LinkButton>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============ NO TASKS — Just Submitted or Between Stages ============ */}
      {application && tasks.length === 0 && (
        <div className="rounded-xl border bg-card p-12 text-center">
          <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
          <h3 className="font-semibold mb-1">All caught up!</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Your application is with our team. We&apos;ll notify you as soon as there&apos;s an update.
          </p>
        </div>
      )}

      {/* ============ ENROLLED STUDENT DOCUMENTS ============ */}
      {isEnrolled && (
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Student Documents</h2>
            <LinkButton href="/portal/documents" size="sm" variant="outline">
              View All
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </LinkButton>
          </div>
          {signedDocuments.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Your signed enrollment documents will appear here (handbook,
              medical form, tuition contract, enrollment agreement).
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-2">
              {signedDocuments.map((doc) => (
                <a
                  key={doc.id}
                  href={`/d/${doc.token}`}
                  className="flex items-center gap-3 rounded-lg border p-3 hover:border-primary/30 hover:bg-muted/30 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{doc.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Signed{" "}
                      {doc.signedAt
                        ? new Date(doc.signedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "—"}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============ Application Progress Timeline ============ */}
      {application && status && status !== "DRAFT" && !isEnrolled && (
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
                done: (status as string) === "ENROLLED",
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
    </div>
  );
}
