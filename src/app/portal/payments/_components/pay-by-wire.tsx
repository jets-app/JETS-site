"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Landmark,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { recordWirePending } from "@/server/actions/wire-payment.actions";
import { useRouter } from "next/navigation";

export interface WireInstructions {
  bankName: string | null;
  accountName: string | null;
  routingNumber: string | null;
  accountNumber: string | null;
  swiftCode: string | null;
  bankAddress: string | null;
  notes: string | null;
  schoolName: string;
  schoolEmail: string;
}

function fmt(c: number) {
  return `$${(c / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

export function PayByWire({
  invoiceId,
  invoiceNumber,
  amount,
  instructions,
}: {
  invoiceId: string;
  invoiceNumber: string;
  amount: number;
  instructions: WireInstructions;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [reference, setReference] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    setError(null);
    startTransition(async () => {
      const r = await recordWirePending({
        invoiceId,
        reference: reference.trim() || undefined,
      });
      if ("error" in r && r.error) {
        setError(r.error);
        return;
      }
      setSubmitted(true);
      setTimeout(() => {
        setOpen(false);
        router.refresh();
      }, 1400);
    });
  };

  const close = () => {
    if (pending) return;
    setOpen(false);
    if (submitted) {
      // Reset for next time
      setSubmitted(false);
      setReference("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : close())}>
      <DialogTrigger render={<Button size="sm" variant="outline" />}>
        <Landmark className="h-3.5 w-3.5" /> Pay by Wire
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Pay {fmt(amount)} by Wire</DialogTitle>
          <DialogDescription>
            Send a wire transfer from your bank using the details below.
            Reference invoice <strong>{invoiceNumber}</strong> in the memo.
          </DialogDescription>
        </DialogHeader>

        {!submitted ? (
          <>
            <div className="rounded-lg border bg-muted/30 divide-y">
              <Field label="Pay to" value={instructions.accountName ?? instructions.schoolName} />
              <Field label="Bank" value={instructions.bankName} />
              {instructions.bankAddress && (
                <Field label="Bank address" value={instructions.bankAddress} />
              )}
              <Field
                label="Routing (ABA)"
                value={instructions.routingNumber}
                copyable
              />
              <Field
                label="Account number"
                value={instructions.accountNumber}
                copyable
              />
              {instructions.swiftCode && (
                <Field label="SWIFT" value={instructions.swiftCode} copyable />
              )}
              <Field label="Reference / memo" value={invoiceNumber} copyable highlight />
              <Field label="Amount" value={fmt(amount)} />
            </div>

            {instructions.notes && (
              <div className="rounded-lg border bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800 p-3 text-sm text-amber-900 dark:text-amber-200">
                {instructions.notes}
              </div>
            )}

            <div>
              <Label htmlFor="wire-ref" className="text-sm">
                Wire confirmation # (optional)
              </Label>
              <Input
                id="wire-ref"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="From your bank's wire receipt"
                className="mt-1.5"
                disabled={pending}
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Helps the office match your wire to this invoice faster.
              </p>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-3 text-sm flex items-start gap-2 text-red-800 dark:text-red-300">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>
                Cancel
              </DialogClose>
              <Button onClick={submit} disabled={pending}>
                {pending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Notifying…
                  </>
                ) : (
                  <>I&apos;ve sent the wire</>
                )}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="py-6 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="font-semibold">Got it — we&apos;ll watch for it</p>
              <p className="text-sm text-muted-foreground mt-1">
                The office will mark this invoice paid once the wire lands. You
                can close this window.
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  value,
  copyable,
  highlight,
}: {
  label: string;
  value: string | null;
  copyable?: boolean;
  highlight?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  if (!value) return null;

  function copy() {
    navigator.clipboard.writeText(value!);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div
      className={`flex items-center justify-between gap-3 px-3 py-2.5 text-sm ${
        highlight ? "bg-primary/5" : ""
      }`}
    >
      <span className="text-muted-foreground text-xs uppercase tracking-wide">
        {label}
      </span>
      <span className="font-mono font-medium tabular-nums flex items-center gap-2">
        {value}
        {copyable && (
          <button
            type="button"
            onClick={copy}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label={`Copy ${label}`}
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-600" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        )}
      </span>
    </div>
  );
}
