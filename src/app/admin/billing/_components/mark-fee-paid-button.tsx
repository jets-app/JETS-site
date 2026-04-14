"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2 } from "lucide-react";
import { markApplicationFeePaid } from "@/server/actions/payment.actions";

interface Application {
  id: string;
  referenceNumber: string;
  student: { firstName: string; lastName: string } | null;
  parent: { name: string } | null;
}

export function MarkFeePaidButton({
  applications,
}: {
  applications: Application[];
}) {
  const [selectedId, setSelectedId] = useState(applications[0]?.id ?? "");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function handleMark() {
    if (!selectedId) return;
    startTransition(async () => {
      const result = await markApplicationFeePaid(selectedId);
      if (result.error) {
        setMessage(result.error);
      } else {
        setMessage("Fee marked as paid!");
      }
    });
  }

  return (
    <div className="space-y-3">
      <select
        value={selectedId}
        onChange={(e) => setSelectedId(e.target.value)}
        className="w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm"
      >
        {applications.map((app) => (
          <option key={app.id} value={app.id}>
            {app.referenceNumber} -{" "}
            {app.student
              ? `${app.student.firstName} ${app.student.lastName}`
              : app.parent?.name ?? "Unknown"}
          </option>
        ))}
      </select>
      <Button onClick={handleMark} disabled={isPending} size="sm" className="w-full">
        {isPending ? (
          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
        ) : (
          <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
        )}
        Mark as Paid
      </Button>
      {message && <p className="text-xs text-muted-foreground">{message}</p>}
    </div>
  );
}
