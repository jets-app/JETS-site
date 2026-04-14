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
  FileSignature,
  CheckCircle2,
  Clock,
  ExternalLink,
  AlertCircle,
} from "lucide-react";

function formatDate(d: Date | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function statusBadge(status: string) {
  const config: Record<string, { label: string; className: string }> = {
    DRAFT: {
      label: "Draft",
      className:
        "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    },
    SENT: {
      label: "Awaiting Signature",
      className:
        "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    },
    VIEWED: {
      label: "Viewed",
      className:
        "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    },
    PARTIALLY_SIGNED: {
      label: "Partially Signed",
      className:
        "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    },
    COMPLETED: {
      label: "Signed",
      className:
        "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    },
    EXPIRED: {
      label: "Expired",
      className: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    },
    VOIDED: {
      label: "Voided",
      className:
        "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    },
  };
  const c = config[status] ?? {
    label: status,
    className: "bg-gray-100 text-gray-700",
  };
  return (
    <Badge
      variant="outline"
      className={`border-transparent font-medium ${c.className}`}
    >
      {c.label}
    </Badge>
  );
}

export default async function PortalDocumentsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const application = await db.application.findFirst({
    where: { parentId: session.user.id },
    select: {
      id: true,
      status: true,
      student: { select: { firstName: true, lastName: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!application) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <FileText className="h-10 w-10 mx-auto mb-3 opacity-40 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No application found.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const documents = await db.document.findMany({
    where: { applicationId: application.id },
    orderBy: { createdAt: "asc" },
  });

  const studentName = application.student
    ? `${application.student.firstName} ${application.student.lastName}`
    : "Student";

  const isEnrolled = application.status === "ENROLLED";
  const pendingDocs = documents.filter((d) =>
    ["SENT", "VIEWED", "PARTIALLY_SIGNED"].includes(d.status)
  );
  const signedDocs = documents.filter((d) => d.status === "COMPLETED");

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          {isEnrolled ? "Student Documents" : "Enrollment Documents"}
        </h1>
        <p className="text-muted-foreground">
          {studentName} ·{" "}
          {isEnrolled
            ? "Review your signed enrollment documents at any time."
            : "Sign and return your enrollment documents."}
        </p>
      </div>

      {/* Pending docs callout */}
      {pendingDocs.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-900/40 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-900 dark:text-amber-200">
              {pendingDocs.length} document{pendingDocs.length > 1 ? "s" : ""}{" "}
              awaiting your signature
            </p>
            <p className="text-sm text-amber-800/80 dark:text-amber-300/80">
              Please review and sign the documents below to complete your
              enrollment.
            </p>
          </div>
        </div>
      )}

      {/* All documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSignature className="h-5 w-5" />
            All Documents
          </CardTitle>
          <CardDescription>
            {documents.length === 0
              ? "No documents yet."
              : `${signedDocs.length} signed · ${pendingDocs.length} pending`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <FileText className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p>No documents have been sent yet.</p>
              <p className="text-sm mt-1">
                Documents will appear here once your application is accepted.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => {
                const isSigned = doc.status === "COMPLETED";
                const needsSigning = ["SENT", "VIEWED", "PARTIALLY_SIGNED"].includes(
                  doc.status
                );
                return (
                  <div
                    key={doc.id}
                    className={`flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg border p-4 ${
                      isSigned
                        ? "bg-green-50/30 dark:bg-green-900/10 border-green-200/50"
                        : needsSigning
                          ? "bg-amber-50/30 dark:bg-amber-900/10 border-amber-200/50"
                          : ""
                    }`}
                  >
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                        isSigned
                          ? "bg-green-500/10 text-green-600"
                          : needsSigning
                            ? "bg-amber-500/10 text-amber-600"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isSigned ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : needsSigning ? (
                        <FileSignature className="h-5 w-5" />
                      ) : (
                        <Clock className="h-5 w-5" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-0.5">
                        <h3 className="font-semibold">{doc.title}</h3>
                        {statusBadge(doc.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {isSigned
                          ? `Signed ${formatDate(doc.signedAt)}${
                              doc.signerName ? ` by ${doc.signerName}` : ""
                            }`
                          : needsSigning
                            ? `Sent ${formatDate(doc.sentAt)}`
                            : `Created ${formatDate(doc.createdAt)}`}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {needsSigning && (
                        <LinkButton
                          href={`/d/${doc.token}`}
                          size="sm"
                        >
                          <FileSignature className="mr-1.5 h-3.5 w-3.5" />
                          Sign Now
                        </LinkButton>
                      )}
                      {isSigned && (
                        <LinkButton
                          href={`/d/${doc.token}`}
                          size="sm"
                          variant="outline"
                        >
                          <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                          View
                        </LinkButton>
                      )}
                      {!needsSigning && !isSigned && (
                        <LinkButton
                          href={`/d/${doc.token}`}
                          size="sm"
                          variant="outline"
                        >
                          View
                        </LinkButton>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
