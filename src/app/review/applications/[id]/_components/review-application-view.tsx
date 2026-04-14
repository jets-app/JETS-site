"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LinkButton } from "@/components/shared/link-button";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/shared/status-badge";
import { ReviewTimeline } from "@/components/review/review-timeline";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  GraduationCap,
  FileText,
  Star,
  Calendar,
  Shield,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ArrowRightLeft,
  Video,
  ExternalLink,
  Clock,
} from "lucide-react";
import {
  moveToInterview,
  markInterviewCompleted,
  acceptStudent,
  rejectStudent,
  requestMoreInfo,
} from "@/server/actions/review.actions";
import type { ApplicationStatus } from "@prisma/client";

interface ReviewApplicationViewProps {
  application: Record<string, any>;
  timeline: any[];
  calendlyUrl: string | null;
}

export function ReviewApplicationView({
  application,
  timeline,
  calendlyUrl,
}: ReviewApplicationViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [comments, setComments] = useState("");
  const [activeAction, setActiveAction] = useState<string | null>(null);

  const student = application.student;
  const parent = application.parent;
  const status = application.status as ApplicationStatus;

  const handleAction = (
    action: () => Promise<any>,
    confirmMessage: string
  ) => {
    if (!confirm(confirmMessage)) return;
    startTransition(async () => {
      try {
        await action();
        setComments("");
        setActiveAction(null);
        router.refresh();
      } catch (err: any) {
        alert(err.message ?? "Action failed");
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <LinkButton
            href="/review/dashboard"
            variant="ghost"
            size="icon-sm"
          >
            <ArrowLeft className="h-4 w-4" />
          </LinkButton>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                {student
                  ? `${student.firstName} ${student.lastName}`
                  : "Application"}
              </h1>
              <StatusBadge status={application.status} />
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              Ref: {application.referenceNumber} &middot;{" "}
              {application.academicYear}
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-6">
        {/* Main content — read-only application view */}
        <div className="space-y-6">
          {/* Student Information */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Student Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {student ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    {student.photoUrl ? (
                      <img
                        src={student.photoUrl}
                        alt=""
                        className="w-14 h-14 rounded-full object-cover ring-2 ring-border"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
                        {student.firstName[0]}
                        {student.lastName[0]}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold">
                        {student.firstName}{" "}
                        {student.middleName ? `${student.middleName} ` : ""}
                        {student.lastName}
                      </p>
                      {student.preferredName && (
                        <p className="text-sm text-muted-foreground">
                          Goes by &ldquo;{student.preferredName}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1.5 text-sm">
                    {student.dateOfBirth && (
                      <InfoRow
                        icon={Calendar}
                        label="DOB"
                        value={new Date(
                          student.dateOfBirth
                        ).toLocaleDateString()}
                      />
                    )}
                    {student.gender && (
                      <InfoRow icon={User} label="Gender" value={student.gender} />
                    )}
                    {student.email && (
                      <InfoRow icon={Mail} label="Email" value={student.email} />
                    )}
                    {student.phone && (
                      <InfoRow icon={Phone} label="Phone" value={student.phone} />
                    )}
                  </div>
                  {(student.addressLine1 || student.city) && (
                    <div className="sm:col-span-2 text-sm">
                      <InfoRow
                        icon={MapPin}
                        label="Address"
                        value={[
                          student.addressLine1,
                          student.addressLine2,
                          [student.city, student.state, student.zipCode]
                            .filter(Boolean)
                            .join(", "),
                          student.country,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground italic">
                  No student information has been entered yet.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Parent Information */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Parent Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <InfoRow icon={User} label="Name" value={parent.name} />
                <InfoRow icon={Mail} label="Email" value={parent.email} />
                {parent.phone && (
                  <InfoRow icon={Phone} label="Phone" value={parent.phone} />
                )}
              </div>
              {application.fatherInfo && (
                <JsonDataSection
                  title="Father Details"
                  data={application.fatherInfo}
                />
              )}
              {application.motherInfo && (
                <JsonDataSection
                  title="Mother Details"
                  data={application.motherInfo}
                />
              )}
              {application.guardianInfo && (
                <JsonDataSection
                  title="Guardian Details"
                  data={application.guardianInfo}
                />
              )}
            </CardContent>
          </Card>

          {/* School History */}
          {application.schoolHistory && (
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-primary" />
                  School History
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <JsonDataSection data={application.schoolHistory} />
              </CardContent>
            </Card>
          )}

          {/* Parent Questions & Applicant Assessment */}
          {application.parentQuestions && (
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Parent Questions
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <JsonDataSection data={application.parentQuestions} />
              </CardContent>
            </Card>
          )}
          {application.applicantAssessment && (
            <Card>
              <CardHeader className="border-b">
                <CardTitle>Applicant Assessment</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <JsonDataSection data={application.applicantAssessment} />
              </CardContent>
            </Card>
          )}

          {/* Studies & Trade Preferences */}
          {application.studiesInfo && (
            <Card>
              <CardHeader className="border-b">
                <CardTitle>Studies Information</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <JsonDataSection data={application.studiesInfo} />
              </CardContent>
            </Card>
          )}
          {application.tradePreferences && (
            <Card>
              <CardHeader className="border-b">
                <CardTitle>Trade Preferences</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <JsonDataSection data={application.tradePreferences} />
              </CardContent>
            </Card>
          )}
          {application.extracurricular && (
            <Card>
              <CardHeader className="border-b">
                <CardTitle>Extracurricular Activities</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <JsonDataSection data={application.extracurricular} />
              </CardContent>
            </Card>
          )}

          {/* Additional Questions & Essay */}
          {application.additionalQuestions && (
            <Card>
              <CardHeader className="border-b">
                <CardTitle>Additional Questions</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <JsonDataSection data={application.additionalQuestions} />
              </CardContent>
            </Card>
          )}
          {application.essay && (
            <Card>
              <CardHeader className="border-b">
                <CardTitle>Essay</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {application.essay}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Recommendations (Confidential) */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                Recommendations
                <span className="text-xs font-normal text-muted-foreground ml-1">
                  (Confidential)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {application.recommendations?.length > 0 ? (
                application.recommendations.map((rec: any) => (
                  <div
                    key={rec.id}
                    className="rounded-lg border p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{rec.refereeName}</p>
                        <p className="text-xs text-muted-foreground">
                          {rec.refereeEmail} &middot; {rec.refereeRelation}
                        </p>
                      </div>
                      <StatusBadge
                        status={
                          rec.status === "COMPLETED"
                            ? "ACCEPTED"
                            : rec.status === "EXPIRED"
                              ? "REJECTED"
                              : "SUBMITTED"
                        }
                        className="text-[10px]"
                      />
                    </div>
                    {rec.status === "COMPLETED" && rec.responses && (
                      <div className="mt-3 border-t pt-3">
                        <JsonDataSection data={rec.responses} />
                      </div>
                    )}
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>
                        Sent: {new Date(rec.sentAt).toLocaleDateString()}
                      </span>
                      {rec.viewedAt && (
                        <span>
                          Viewed:{" "}
                          {new Date(rec.viewedAt).toLocaleDateString()}
                        </span>
                      )}
                      {rec.submittedAt && (
                        <span>
                          Completed:{" "}
                          {new Date(rec.submittedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground italic text-sm">
                  No recommendations requested yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar — Action Panel & Timeline */}
        <div className="space-y-6">
          {/* Action Panel */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-sm flex items-center gap-2">
                <Star className="h-3.5 w-3.5" />
                Review Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {/* Contextual actions based on status */}
              {status === "PRINCIPAL_REVIEW" && (
                <>
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Add comments (optional)..."
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      className="min-h-[60px]"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      disabled={isPending}
                      onClick={() =>
                        handleAction(
                          () => moveToInterview(application.id, comments),
                          "Move this student to interview scheduling?"
                        )
                      }
                    >
                      <Calendar className="h-3.5 w-3.5 mr-1.5" />
                      Move to Interview
                    </Button>
                    <Button
                      variant="destructive"
                      disabled={isPending}
                      onClick={() =>
                        handleAction(
                          () => rejectStudent(application.id, comments),
                          "Are you sure you want to reject this application?"
                        )
                      }
                    >
                      <XCircle className="h-3.5 w-3.5 mr-1.5" />
                      Reject
                    </Button>
                    <Button
                      variant="outline"
                      disabled={isPending}
                      onClick={() =>
                        handleAction(
                          () => requestMoreInfo(application.id, comments),
                          "Send this application back to the office for more information?"
                        )
                      }
                    >
                      <ArrowRightLeft className="h-3.5 w-3.5 mr-1.5" />
                      Request More Info
                    </Button>
                  </div>
                </>
              )}

              {status === "INTERVIEW_SCHEDULED" && (
                <>
                  {/* Calendly Link */}
                  {calendlyUrl && (
                    <div className="rounded-lg border border-indigo-200 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-950/30 p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <Video className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                          Interview Scheduling
                        </p>
                      </div>
                      <p className="text-xs text-indigo-600 dark:text-indigo-400">
                        Share this link with the parents to schedule their
                        interview:
                      </p>
                      <a
                        href={calendlyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-700 dark:text-indigo-300 hover:underline break-all"
                      >
                        {calendlyUrl}
                        <ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                    </div>
                  )}

                  {application.interviewDate && (
                    <div className="rounded-lg border p-3 text-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          Interview Date
                        </span>
                      </div>
                      <p className="font-medium">
                        {new Date(
                          application.interviewDate
                        ).toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Textarea
                      placeholder="Interview notes (optional)..."
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      className="min-h-[80px]"
                    />
                  </div>
                  <Button
                    disabled={isPending}
                    onClick={() =>
                      handleAction(
                        () =>
                          markInterviewCompleted(application.id, comments),
                        "Mark this interview as completed?"
                      )
                    }
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                    Mark Interview Completed
                  </Button>
                </>
              )}

              {status === "INTERVIEW_COMPLETED" && (
                <>
                  {application.interviewNotes && (
                    <div className="rounded-lg border p-3 text-sm space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">
                        Interview Notes
                      </p>
                      <p className="text-sm">{application.interviewNotes}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Textarea
                      placeholder="Decision comments (optional)..."
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      className="min-h-[60px]"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      disabled={isPending}
                      onClick={() =>
                        handleAction(
                          () => acceptStudent(application.id, comments),
                          "Accept this student? This will notify the office."
                        )
                      }
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                      Accept Student
                    </Button>
                    <Button
                      variant="destructive"
                      disabled={isPending}
                      onClick={() =>
                        handleAction(
                          () => rejectStudent(application.id, comments),
                          "Are you sure you want to reject this application?"
                        )
                      }
                    >
                      <XCircle className="h-3.5 w-3.5 mr-1.5" />
                      Reject
                    </Button>
                  </div>
                </>
              )}

              {(status === "ACCEPTED" || status === "REJECTED") && (
                <div className="rounded-lg border border-dashed p-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    This application has been{" "}
                    <span className="font-medium">
                      {status === "ACCEPTED" ? "accepted" : "rejected"}
                    </span>
                    . No further review actions available.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Application Details Sidebar */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-sm">Details</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <StatusBadge status={application.status} />
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Academic Year</span>
                <span className="font-medium">{application.academicYear}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fee Paid</span>
                <span>
                  {application.applicationFeePaid ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600 inline" />
                  ) : (
                    <XCircle className="h-4 w-4 text-muted-foreground inline" />
                  )}
                </span>
              </div>
              {application.submittedAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Submitted</span>
                  <span className="text-xs">
                    {new Date(application.submittedAt).toLocaleDateString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Interview</span>
                <span className="font-medium capitalize text-xs">
                  {application.interviewStatus
                    .toLowerCase()
                    .replace("_", " ")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Recommendations</span>
                <span className="text-xs">
                  {application.recommendations?.filter(
                    (r: any) => r.status === "COMPLETED"
                  ).length ?? 0}{" "}
                  / {application.recommendations?.length ?? 0} completed
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Interview Info */}
          {(application.interviewStatus !== "PENDING" ||
            application.interviewDate) && (
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5" />
                  Interview
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className="font-medium capitalize">
                    {application.interviewStatus
                      .toLowerCase()
                      .replace("_", " ")}
                  </span>
                </div>
                {application.interviewDate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date</span>
                    <span className="text-xs">
                      {new Date(
                        application.interviewDate
                      ).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {application.interviewNotes && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">Notes</p>
                    <p className="text-sm mt-1">
                      {application.interviewNotes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Review Timeline */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-3.5 w-3.5" />
                Review Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ReviewTimeline
                timeline={timeline}
                currentStatus={application.status}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ---------- Helper Components ----------

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
      <div>
        <span className="text-muted-foreground">{label}: </span>
        <span className="font-medium">{value}</span>
      </div>
    </div>
  );
}

function JsonDataSection({
  title,
  data,
}: {
  title?: string;
  data: unknown;
}) {
  if (!data) return null;

  const entries =
    typeof data === "object" && !Array.isArray(data)
      ? Object.entries(data as Record<string, unknown>)
      : [];

  if (Array.isArray(data)) {
    return (
      <div className="mt-3">
        {title && (
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            {title}
          </p>
        )}
        <div className="space-y-2">
          {data.map((item, i) => (
            <div key={i} className="rounded border p-2">
              {typeof item === "object" && item !== null ? (
                <JsonDataSection data={item} />
              ) : (
                <p className="text-sm">{String(item)}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3">
      {title && (
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          {title}
        </p>
      )}
      <dl className="grid sm:grid-cols-2 gap-x-4 gap-y-2">
        {entries.map(([key, value]) => (
          <div key={key}>
            <dt className="text-xs text-muted-foreground capitalize">
              {key.replace(/([A-Z])/g, " $1").replace(/_/g, " ").trim()}
            </dt>
            <dd className="text-sm font-medium">
              {value === null || value === undefined
                ? "--"
                : typeof value === "object"
                  ? JSON.stringify(value)
                  : typeof value === "boolean"
                    ? value
                      ? "Yes"
                      : "No"
                    : String(value)}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
