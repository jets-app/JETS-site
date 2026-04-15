"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { CalendarPlus, Mail, Zap, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  generateMonthlyInvoices,
  runEndOfMonthJob,
  sendOverdueReminders,
} from "@/server/actions/invoice-generation.actions";

export function BillingActions() {
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState<string | null>(null);

  const run = (label: string, fn: () => Promise<unknown>) => {
    setBusy(label);
    startTransition(async () => {
      try {
        const res = (await fn()) as { success?: boolean; error?: string; message?: string };
        if (res?.error) toast.error(res.error);
        else toast.success(res?.message ?? "Done.");
      } catch (e) {
        toast.error("Action failed.");
      } finally {
        setBusy(null);
      }
    });
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        size="sm"
        variant="default"
        disabled={pending}
        onClick={() => run("gen", () => generateMonthlyInvoices())}
      >
        {busy === "gen" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CalendarPlus className="h-3.5 w-3.5" />}
        Generate Next Month&apos;s Invoices
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() => run("rem", () => sendOverdueReminders())}
      >
        {busy === "rem" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Mail className="h-3.5 w-3.5" />}
        Send Reminders
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() => run("ap", () => runEndOfMonthJob())}
      >
        {busy === "ap" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
        Run Auto-Pay Now
      </Button>
    </div>
  );
}
