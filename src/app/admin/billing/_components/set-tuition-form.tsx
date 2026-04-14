"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, FileText } from "lucide-react";
import { setStudentTuition } from "@/server/actions/tuition.actions";
import type { PaymentPlan } from "@/server/actions/tuition.actions";

interface AppOption {
  id: string;
  referenceNumber: string;
  parentId: string;
  label: string;
}

export function SetTuitionForm({
  applications,
}: {
  applications: AppOption[];
}) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const applicationId = fd.get("applicationId")?.toString() ?? "";
    const amount = parseFloat(fd.get("amount")?.toString() ?? "0");
    const plan = (fd.get("paymentPlan")?.toString() ?? "FULL") as PaymentPlan;

    if (!applicationId || amount <= 0) {
      setMessage({ text: "Please select an application and enter a valid amount.", type: "error" });
      return;
    }

    startTransition(async () => {
      const result = await setStudentTuition(applicationId, Math.round(amount * 100), plan);
      if (result.error) {
        setMessage({ text: result.error, type: "error" });
      } else {
        setMessage({ text: result.message ?? "Tuition set!", type: "success" });
        (e.target as HTMLFormElement).reset();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1.5">
        <Label>Application</Label>
        <select
          name="applicationId"
          className="w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm"
        >
          <option value="">Select application...</option>
          {applications.map((app) => (
            <option key={app.id} value={app.id}>
              {app.label}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <Label>Annual Tuition ($)</Label>
        <Input name="amount" type="number" step="0.01" placeholder="0.00" />
      </div>
      <div className="space-y-1.5">
        <Label>Payment Plan</Label>
        <select
          name="paymentPlan"
          className="w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm"
        >
          <option value="FULL">Full Payment (1x)</option>
          <option value="SEMESTER">Semester (2 payments)</option>
          <option value="QUARTERLY">Quarterly (4 payments)</option>
          <option value="MONTHLY">Monthly (10 payments)</option>
        </select>
      </div>
      <Button type="submit" disabled={isPending} size="sm" className="w-full">
        {isPending ? (
          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
        ) : (
          <FileText className="mr-1.5 h-3.5 w-3.5" />
        )}
        Set Tuition & Generate Invoices
      </Button>
      {message && (
        <p className={`text-xs ${message.type === "error" ? "text-destructive" : "text-green-600"}`}>
          {message.text}
        </p>
      )}
    </form>
  );
}
