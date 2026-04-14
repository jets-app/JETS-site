"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText,
  RotateCcw,
  Ban,
  ExternalLink,
  CheckCircle2,
  Clock,
  Eye,
  Send,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { voidDocument, resendDocument } from "@/server/actions/document.actions";
import { cn } from "@/lib/utils";

type DocumentStatus =
  | "DRAFT"
  | "SENT"
  | "VIEWED"
  | "PARTIALLY_SIGNED"
  | "COMPLETED"
  | "EXPIRED"
  | "VOIDED";

type DocumentRecipientType = "PARENT" | "STUDENT";

interface DocumentItem {
  id: string;
  title: string;
  status: DocumentStatus;
  recipientType: DocumentRecipientType;
  token: string;
  sentAt: string | null;
  viewedAt: string | null;
  signedAt: string | null;
  signerName: string | null;
  expiresAt: string | null;
  template: {
    name: string;
    type: string;
  } | null;
}

interface DocumentStatusTrackerProps {
  documents: DocumentItem[];
  applicationId: string;
}

const STATUS_CONFIG: Record<
  DocumentStatus,
  { label: string; className: string; icon: React.ComponentType<{ className?: string }> }
> = {
  DRAFT: {
    label: "Draft",
    className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    icon: FileText,
  },
  SENT: {
    label: "Sent",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    icon: Send,
  },
  VIEWED: {
    label: "Viewed",
    className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
    icon: Eye,
  },
  PARTIALLY_SIGNED: {
    label: "Partially Signed",
    className: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
    icon: Clock,
  },
  COMPLETED: {
    label: "Signed",
    className: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    icon: CheckCircle2,
  },
  EXPIRED: {
    label: "Expired",
    className: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    icon: AlertTriangle,
  },
  VOIDED: {
    label: "Voided",
    className: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
    icon: XCircle,
  },
};

function DocumentStatusBadge({ status }: { status: DocumentStatus }) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn("border-transparent font-medium gap-1", config.className)}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

function RecipientBadge({ type }: { type: DocumentRecipientType }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "border-transparent font-medium",
        type === "PARENT"
          ? "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300"
          : "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"
      )}
    >
      {type === "PARENT" ? "Parent" : "Student"}
    </Badge>
  );
}

export function DocumentStatusTracker({
  documents,
  applicationId,
}: DocumentStatusTrackerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [actioningId, setActioningId] = useState<string | null>(null);

  const handleVoid = (docId: string) => {
    if (!confirm("Are you sure you want to void this document? This cannot be undone.")) {
      return;
    }
    setActioningId(docId);
    startTransition(async () => {
      try {
        await voidDocument(docId);
        router.refresh();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to void document";
        alert(message);
      } finally {
        setActioningId(null);
      }
    });
  };

  const handleResend = (docId: string) => {
    if (!confirm("Resend this document? The recipient will get a new email with the signing link.")) {
      return;
    }
    setActioningId(docId);
    startTransition(async () => {
      try {
        await resendDocument(docId);
        router.refresh();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to resend document";
        alert(message);
      } finally {
        setActioningId(null);
      }
    });
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <FileText className="h-8 w-8 mx-auto mb-2 opacity-40" />
        <p className="text-sm">No documents have been sent for this application.</p>
      </div>
    );
  }

  // Summary counts
  const completed = documents.filter((d) => d.status === "COMPLETED").length;
  const active = documents.filter((d) =>
    ["SENT", "VIEWED", "PARTIALLY_SIGNED"].includes(d.status)
  ).length;
  const total = documents.filter((d) => d.status !== "VOIDED").length;

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <span className="font-medium">{completed}/{total} signed</span>
        </div>
        {active > 0 && (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{active} awaiting signature</span>
          </div>
        )}
        {completed === total && total > 0 && (
          <Badge
            variant="outline"
            className="border-transparent bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
          >
            All Documents Complete
          </Badge>
        )}
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-green-600 transition-all duration-500"
          style={{ width: total > 0 ? `${(completed / total) * 100}%` : "0%" }}
        />
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Document</TableHead>
            <TableHead>Recipient</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Sent</TableHead>
            <TableHead>Signed</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => (
            <TableRow
              key={doc.id}
              className={cn(
                doc.status === "VOIDED" && "opacity-50"
              )}
            >
              <TableCell>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="font-medium text-sm">
                    {doc.template?.name ?? doc.title}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <RecipientBadge type={doc.recipientType} />
              </TableCell>
              <TableCell>
                <DocumentStatusBadge status={doc.status} />
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {doc.sentAt
                  ? new Date(doc.sentAt).toLocaleDateString()
                  : "--"}
              </TableCell>
              <TableCell>
                {doc.signedAt ? (
                  <div>
                    <p className="text-sm">
                      {new Date(doc.signedAt).toLocaleDateString()}
                    </p>
                    {doc.signerName && (
                      <p className="text-xs text-muted-foreground">
                        by {doc.signerName}
                      </p>
                    )}
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">--</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  {doc.status !== "COMPLETED" && doc.status !== "VOIDED" && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        disabled={isPending && actioningId === doc.id}
                        onClick={() => handleResend(doc.id)}
                        title="Resend"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        disabled={isPending && actioningId === doc.id}
                        onClick={() => handleVoid(doc.id)}
                        title="Void"
                      >
                        <Ban className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </>
                  )}
                  {doc.status !== "VOIDED" && (
                    <a
                      href={`/d/${doc.token}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open signing page"
                    >
                      <Button variant="ghost" size="icon-xs">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </a>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
