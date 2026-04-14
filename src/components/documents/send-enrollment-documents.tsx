"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Send, Loader2, CheckCircle2 } from "lucide-react";
import { sendEnrollmentPackage } from "@/server/actions/document.actions";

interface SendEnrollmentDocumentsProps {
  applicationId: string;
  hasExistingDocuments: boolean;
}

export function SendEnrollmentDocuments({
  applicationId,
  hasExistingDocuments,
}: SendEnrollmentDocumentsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{
    success?: boolean;
    error?: string;
    count?: number;
  } | null>(null);

  const handleSend = () => {
    const message = hasExistingDocuments
      ? "Documents have already been sent for this application. Send a new enrollment package? (Existing unsigned documents will remain active.)"
      : "This will send the enrollment document package (Medical Form, Student Handbook, Tuition Contract, and Enrollment Agreement) to the parent and student. Continue?";

    if (!confirm(message)) {
      return;
    }

    setResult(null);
    startTransition(async () => {
      try {
        const res = await sendEnrollmentPackage(applicationId);
        setResult({ success: true, count: res.documentCount });
        router.refresh();
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to send enrollment documents";
        setResult({ error: message });
      }
    });
  };

  return (
    <div className="space-y-2">
      <Button
        onClick={handleSend}
        disabled={isPending}
        size="sm"
      >
        {isPending ? (
          <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
        ) : (
          <Send className="h-3.5 w-3.5 mr-1.5" />
        )}
        {hasExistingDocuments
          ? "Resend Enrollment Documents"
          : "Send Enrollment Documents"}
      </Button>

      {result?.success && (
        <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
          <CheckCircle2 className="h-4 w-4" />
          <span>
            {result.count} document{result.count !== 1 ? "s" : ""} sent
            successfully.
          </span>
        </div>
      )}

      {result?.error && (
        <p className="text-sm text-destructive">{result.error}</p>
      )}
    </div>
  );
}
