"use client";

import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { reviewScholarship } from "@/server/actions/scholarship.actions";

export function ScholarshipReviewForm({
  scholarshipId,
  requestedAmount,
}: {
  scholarshipId: string;
  requestedAmount: number | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const amountRef = useRef<HTMLInputElement>(null);
  const notesRef = useRef<HTMLTextAreaElement>(null);

  function handleDecision(decision: "APPROVED" | "DENIED") {
    const approvedAmount = parseFloat(amountRef.current?.value ?? "0");
    const notes = notesRef.current?.value ?? "";

    startTransition(async () => {
      const result = await reviewScholarship(
        scholarshipId,
        decision,
        decision === "APPROVED" ? Math.round(approvedAmount * 100) : undefined,
        notes || undefined
      );
      if (result.error) {
        setMessage({ text: result.error, type: "error" });
      } else {
        setMessage({
          text: `Scholarship ${decision === "APPROVED" ? "approved" : "denied"}.`,
          type: "success",
        });
      }
    });
  }

  return (
    <div className="rounded-lg border border-dashed p-4 space-y-3">
      <p className="text-sm font-medium">Review Decision</p>
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Approved Amount ($)</Label>
          <Input
            ref={amountRef}
            type="number"
            step="0.01"
            placeholder="0.00"
            defaultValue={requestedAmount ? (requestedAmount / 100).toFixed(2) : ""}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Notes</Label>
          <Textarea
            ref={notesRef}
            placeholder="Review notes..."
            rows={2}
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          onClick={() => handleDecision("APPROVED")}
          disabled={isPending}
          size="sm"
        >
          {isPending ? (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          ) : (
            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
          )}
          Approve
        </Button>
        <Button
          type="button"
          variant="destructive"
          onClick={() => handleDecision("DENIED")}
          disabled={isPending}
          size="sm"
        >
          {isPending ? (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          ) : (
            <XCircle className="mr-1.5 h-3.5 w-3.5" />
          )}
          Deny
        </Button>
      </div>
      {message && (
        <p className={`text-xs ${message.type === "error" ? "text-destructive" : "text-green-600"}`}>
          {message.text}
        </p>
      )}
    </div>
  );
}
