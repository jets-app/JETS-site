"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LinkButton } from "@/components/shared/link-button";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge, getStatusLabel } from "@/components/shared/status-badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowLeft,
  Printer,
  Send,
  StickyNote,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  GraduationCap,
  FileText,
  Star,
  DollarSign,
  Calendar,
  Shield,
  AlertCircle,
  FileSignature,
} from "lucide-react";
import {
  updateApplicationStatus,
  addApplicationNote,
} from "@/server/actions/admin.actions";
import {
  updateStudentInfo,
  updateParentInfo,
  updateApplicationDetails,
} from "@/server/actions/admin-application.actions";
import {
  beginOfficeReview,
  forwardToPrincipals,
  sendToDocuments,
} from "@/server/actions/review.actions";
import { EditableField } from "../[id]/_components/editable-field";
import { DocumentStatusTracker } from "@/components/documents/document-status-tracker";
import { SendEnrollmentDocuments } from "@/components/documents/send-enrollment-documents";
import { TuitionSettingsCard } from "./tuition-settings-card";
import type { ApplicationStatus } from "@prisma/client";

interface ApplicationDetailViewProps {
  application: Record<string, any>;
  validTransitions: ApplicationStatus[];
  currentUserId: string;
  currentUserRole?: string;
}

const ALL_STATUSES: ApplicationStatus[] = [
  "DRAFT",
  "SUBMITTED",
  "OFFICE_REVIEW",
  "PRINCIPAL_REVIEW",
  "INTERVIEW_SCHEDULED",
  "INTERVIEW_COMPLETED",
  "ACCEPTED",
  "DOCUMENTS_PENDING",
  "SCHOLARSHIP_REVIEW",
  "ENROLLED",
  "WAITLISTED",
  "REJECTED",
  "WITHDRAWN",
];

// Map statuses to friendly action button labels
const STATUS_ACTION_LABELS: Partial<Record<ApplicationStatus, string>> = {
  OFFICE_REVIEW: "Move to Office Review",
  PRINCIPAL_REVIEW: "Move to Principal Review",
  INTERVIEW_SCHEDULED: "Schedule Interview",
  INTERVIEW_COMPLETED: "Mark Interview Complete",
  ACCEPTED: "Accept Student",
  DOCUMENTS_PENDING: "Send Enrollment Documents",
  SCHOLARSHIP_REVIEW: "Send to Scholarship Review",
  ENROLLED: "Mark Enrolled",
  REJECTED: "Reject",
  WAITLISTED: "Add to Waitlist",
  WITHDRAWN: "Mark Withdrawn",
  SUBMITTED: "Send Back to Submitted",
};

const STATUS_BUTTON_VARIANT: Partial<
  Record<ApplicationStatus, "default" | "outline" | "destructive" | "secondary" | "ghost">
> = {
  ACCEPTED: "default",
  ENROLLED: "default",
  REJECTED: "destructive",
  WITHDRAWN: "destructive",
};

export function ApplicationDetailView({
  application,
  validTransitions,
  currentUserId,
  currentUserRole,
}: ApplicationDetailViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [noteContent, setNoteContent] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);
  const isAdmin = currentUserRole === "ADMIN";

  const handleStatusChange = (newStatus: ApplicationStatus) => {
    if (
      !confirm(
        `Are you sure you want to change the status to "${getStatusLabel(newStatus)}"?`
      )
    ) {
      return;
    }
    startTransition(async () => {
      try {
        // Use specialized actions for certain transitions to create review records
        if (
          newStatus === "OFFICE_REVIEW" &&
          application.status === "SUBMITTED"
        ) {
          await beginOfficeReview(application.id);
        } else if (
          newStatus === "PRINCIPAL_REVIEW" &&
          application.status === "OFFICE_REVIEW"
        ) {
          await forwardToPrincipals(application.id);
        } else if (
          newStatus === "DOCUMENTS_PENDING" &&
          application.status === "ACCEPTED"
        ) {
          await sendToDocuments(application.id);
        } else {
          await updateApplicationStatus(application.id, newStatus);
        }
        router.refresh();
      } catch (err: any) {
        alert(err.message ?? "Failed to update status");
      }
    });
  };

  const handleAddNote = () => {
    if (!noteContent.trim()) return;
    setIsAddingNote(true);
    startTransition(async () => {
      try {
        await addApplicationNote(application.id, noteContent);
        setNoteContent("");
        router.refresh();
      } catch (err: any) {
        alert(err.message ?? "Failed to add note");
      } finally {
        setIsAddingNote(false);
      }
    });
  };

  const student = application.student;
  const parent = application.parent;

  // Completion checklist
  const checklist = [
    {
      label: "Student information",
      done: !!student,
      icon: User,
    },
    {
      label: "Application fee paid",
      done: application.applicationFeePaid,
      icon: DollarSign,
    },
    {
      label: "Student photo uploaded",
      done: !!student?.photoUrl,
      icon: FileText,
    },
    {
      label: "Father information",
      done: !!application.fatherInfo,
      icon: User,
    },
    {
      label: "Mother information",
      done: !!application.motherInfo,
      icon: User,
    },
    {
      label: "School history",
      done: !!application.schoolHistory,
      icon: GraduationCap,
    },
    {
      label: "Parent questions",
      done: !!application.parentQuestions,
      icon: FileText,
    },
    {
      label: "Applicant assessment",
      done: !!application.applicantAssessment,
      icon: Star,
    },
    {
      label: "Recommendations sent",
      done: (application.recommendations?.length ?? 0) > 0,
      icon: Send,
    },
    {
      label: "At least one recommendation completed",
      done: application.recommendations?.some(
        (r: any) => r.status === "COMPLETED"
      ),
      icon: CheckCircle2,
    },
  ];

  const completedCount = checklist.filter((c) => c.done).length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <LinkButton
            href="/admin/applications"
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
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
          >
            <Printer className="h-3.5 w-3.5 mr-1.5" />
            Print
          </Button>
          {validTransitions
            // Admins use the override dropdown for "rewind"/withdrawal —
            // the dedicated buttons are kept for principals/secretaries who
            // don't have the dropdown.
            .filter(
              (status) =>
                !isAdmin || (status !== "SUBMITTED" && status !== "WITHDRAWN"),
            )
            .map((status) => (
              <Button
                key={status}
                variant={STATUS_BUTTON_VARIANT[status] ?? "outline"}
                size="sm"
                disabled={isPending}
                onClick={() => handleStatusChange(status)}
              >
                {STATUS_ACTION_LABELS[status] ?? getStatusLabel(status)}
              </Button>
            ))}
          {isAdmin && (
            <select
              disabled={isPending}
              value=""
              onChange={(e) => {
                const v = e.target.value as ApplicationStatus;
                if (v) handleStatusChange(v);
                e.target.value = "";
              }}
              className="h-9 rounded-md border border-input bg-background px-3 text-xs font-medium hover:bg-accent transition-colors"
              title="Admin override — set to any status"
            >
              <option value="">Override → any status…</option>
              {ALL_STATUSES.filter((s) => s !== application.status).map((s) => (
                <option key={s} value={s}>
                  {getStatusLabel(s)}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        {/* Main content */}
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
                  <div className="flex items-center gap-3 sm:col-span-2">
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
                  <EditableField
                    label="First Name"
                    value={student.firstName ?? ""}
                    onSave={async (v) => { await updateStudentInfo(student.id, { firstName: v }); router.refresh(); }}
                    type="text"
                  />
                  <EditableField
                    label="Last Name"
                    value={student.lastName ?? ""}
                    onSave={async (v) => { await updateStudentInfo(student.id, { lastName: v }); router.refresh(); }}
                    type="text"
                  />
                  <EditableField
                    label="Date of Birth"
                    value={student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split("T")[0] : ""}
                    onSave={async (v) => { await updateStudentInfo(student.id, { dateOfBirth: v }); router.refresh(); }}
                    type="date"
                  />
                  <EditableField
                    label="Email"
                    value={student.email ?? ""}
                    onSave={async (v) => { await updateStudentInfo(student.id, { email: v }); router.refresh(); }}
                    type="email"
                  />
                  <EditableField
                    label="Phone"
                    value={student.phone ?? ""}
                    onSave={async (v) => { await updateStudentInfo(student.id, { phone: v }); router.refresh(); }}
                    type="tel"
                  />
                  <EditableField
                    label="Address"
                    value={student.addressLine1 ?? ""}
                    onSave={async (v) => { await updateStudentInfo(student.id, { addressLine1: v }); router.refresh(); }}
                    type="text"
                  />
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
              <div className="grid sm:grid-cols-2 gap-4">
                <EditableField
                  label="Name"
                  value={parent.name ?? ""}
                  onSave={async (v) => { await updateParentInfo(parent.id, { name: v }); router.refresh(); }}
                  type="text"
                />
                <EditableField
                  label="Email"
                  value={parent.email ?? ""}
                  onSave={async (v) => { await updateParentInfo(parent.id, { email: v }); router.refresh(); }}
                  type="email"
                />
                <EditableField
                  label="Phone"
                  value={parent.phone ?? ""}
                  onSave={async (v) => { await updateParentInfo(parent.id, { phone: v }); router.refresh(); }}
                  type="tel"
                />
              </div>

              {/* Father and Mother info from JSON */}
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

          {/* Hebrew Names */}
          {application.hebrewNames && (
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-primary" />
                  Hebrew Names
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <JsonDataSection data={application.hebrewNames} />
              </CardContent>
            </Card>
          )}

          {/* Emergency Contact */}
          {application.emergencyContact && (
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-primary" />
                  Emergency Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <JsonDataSection data={application.emergencyContact} />
              </CardContent>
            </Card>
          )}

          {/* Siblings & Grandparents */}
          {application.siblings && (
            <Card>
              <CardHeader className="border-b">
                <CardTitle>Siblings</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <JsonDataSection data={application.siblings} />
              </CardContent>
            </Card>
          )}
          {application.grandparents && (
            <Card>
              <CardHeader className="border-b">
                <CardTitle>Grandparents</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <JsonDataSection data={application.grandparents} />
              </CardContent>
            </Card>
          )}

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
                        Sent:{" "}
                        {new Date(rec.sentAt).toLocaleDateString()}
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

          {/* Reviews */}
          {application.reviews?.length > 0 && (
            <Card>
              <CardHeader className="border-b">
                <CardTitle>Reviews</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                {application.reviews.map((review: any) => (
                  <div
                    key={review.id}
                    className="rounded-lg border p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">
                          {review.reviewer.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {review.department}
                        </p>
                      </div>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          review.decision === "APPROVED"
                            ? "bg-green-100 text-green-700"
                            : review.decision === "REJECTED"
                              ? "bg-red-100 text-red-700"
                              : review.decision === "NEEDS_INFO"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {review.decision}
                      </span>
                    </div>
                    {review.comments && (
                      <p className="text-sm text-muted-foreground">
                        {review.comments}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {new Date(review.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Payments */}
          {application.payments?.length > 0 && (
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  Payments
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-2">
                  {application.payments.map((payment: any) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="text-sm font-medium">{payment.type}</p>
                        <p className="text-xs text-muted-foreground">
                          {payment.description ??
                            `${payment.type.replace("_", " ")}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm">
                          ${(payment.amount / 100).toFixed(2)}
                        </p>
                        <span
                          className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                            payment.status === "SUCCEEDED"
                              ? "bg-green-100 text-green-700"
                              : payment.status === "FAILED"
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {payment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Enrollment Documents */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <FileSignature className="h-4 w-4 text-primary" />
                Enrollment Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {(application.status === "ACCEPTED" ||
                application.status === "DOCUMENTS_PENDING" ||
                application.status === "ENROLLED") && (
                <SendEnrollmentDocuments
                  applicationId={application.id}
                  hasExistingDocuments={
                    (application.documents?.length ?? 0) > 0
                  }
                />
              )}
              <DocumentStatusTracker
                documents={application.documents ?? []}
                applicationId={application.id}
              />
            </CardContent>
          </Card>

          {/* Tuition Pricing — relevant once the family is on the enrollment path */}
          {(application.status === "ACCEPTED" ||
            application.status === "DOCUMENTS_PENDING" ||
            application.status === "SCHOLARSHIP_REVIEW" ||
            application.status === "ENROLLED") && (
            <TuitionSettingsCard
              applicationId={application.id}
              tuitionTotalCents={application.tuitionTotalCents ?? 3950000}
              tuitionScholarshipCents={application.tuitionScholarshipCents ?? 0}
              tuitionDepositCents={application.tuitionDepositCents ?? null}
              tuitionInstallmentCount={
                application.tuitionInstallmentCount ?? null
              }
              tuitionPaymentPlan={application.tuitionPaymentPlan ?? null}
              tuitionPlanLockedAt={application.tuitionPlanLockedAt ?? null}
            />
          )}

          {/* Internal Notes */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <StickyNote className="h-4 w-4 text-primary" />
                Internal Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Add an internal note..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="min-h-[60px]"
                />
                <Button
                  size="sm"
                  disabled={!noteContent.trim() || isAddingNote}
                  onClick={handleAddNote}
                  className="self-end"
                >
                  Add
                </Button>
              </div>
              {application.notes?.length > 0 ? (
                <div className="space-y-3">
                  {application.notes.map((note: any) => (
                    <div
                      key={note.id}
                      className={`rounded-lg border p-3 ${
                        note.content.startsWith("Status changed")
                          ? "bg-muted/30 border-dashed"
                          : ""
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-medium">
                          {note.author.name}
                          <span className="text-muted-foreground font-normal ml-1.5">
                            {note.author.role}
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(note.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <p className="text-sm">{note.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground italic text-sm">
                  No notes yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Completion Checklist */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-sm">
                Completion ({completedCount}/{checklist.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-2">
                {checklist.map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    {item.done ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                    )}
                    <span
                      className={`text-xs ${
                        item.done
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">
                    Progress
                  </span>
                  <span className="text-xs font-medium">
                    {application.completionPct}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${application.completionPct}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Application Details */}
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
                <span className="text-muted-foreground">Current Step</span>
                <span className="font-medium">
                  {application.currentStep}/10
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Fee Paid</span>
                <button
                  className="font-medium cursor-pointer"
                  onClick={() => {
                    startTransition(async () => {
                      await updateApplicationDetails(application.id, {
                        applicationFeePaid: !application.applicationFeePaid,
                      });
                      router.refresh();
                    });
                  }}
                  title="Click to toggle"
                >
                  {application.applicationFeePaid ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600 inline" />
                  ) : (
                    <XCircle className="h-4 w-4 text-muted-foreground inline" />
                  )}
                </button>
              </div>
              <EditableField
                label="Fee Amount"
                value={application.applicationFeeAmount ? `${(application.applicationFeeAmount / 100).toFixed(2)}` : "0.00"}
                onSave={async (v) => {
                  const cents = Math.round(parseFloat(v) * 100);
                  await updateApplicationDetails(application.id, { applicationFeeAmount: cents });
                  router.refresh();
                }}
                type="text"
              />
              {application.discountCode && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="font-mono text-xs">
                    {application.discountCode}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span className="text-xs">
                  {new Date(application.createdAt).toLocaleDateString()}
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
                    {application.interviewStatus.toLowerCase().replace("_", " ")}
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

          {/* Scholarship */}
          {application.scholarship && (
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Star className="h-3.5 w-3.5" />
                  Scholarship
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className="font-medium capitalize">
                    {application.scholarship.status
                      .toLowerCase()
                      .replace("_", " ")}
                  </span>
                </div>
                {application.scholarship.requestedAmount && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Requested</span>
                    <span className="font-medium">
                      $
                      {(
                        application.scholarship.requestedAmount / 100
                      ).toFixed(2)}
                    </span>
                  </div>
                )}
                {application.scholarship.approvedAmount && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Approved</span>
                    <span className="font-medium text-green-600">
                      $
                      {(
                        application.scholarship.approvedAmount / 100
                      ).toFixed(2)}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Activity Timeline */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-3.5 w-3.5" />
                Activity Log
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {application.notes?.filter((n: any) =>
                n.content.startsWith("Status changed")
              ).length > 0 ? (
                <div className="space-y-3">
                  {application.notes
                    .filter((n: any) =>
                      n.content.startsWith("Status changed")
                    )
                    .map((note: any) => (
                      <div
                        key={note.id}
                        className="flex gap-3 items-start"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                        <div>
                          <p className="text-xs">{note.content}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {note.author.name} &middot;{" "}
                            {new Date(note.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-muted-foreground italic text-xs">
                  No status changes recorded.
                </p>
              )}
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

  const entries = typeof data === "object" && !Array.isArray(data)
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
