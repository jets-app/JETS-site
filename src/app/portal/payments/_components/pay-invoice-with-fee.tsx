"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
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
  Building2,
  CheckCircle2,
  CreditCard,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { calcProcessingFee } from "@/lib/payment-fees";
import { chargeInvoice } from "@/server/actions/auto-pay.actions";
import { useRouter } from "next/navigation";
import { LinkButton } from "@/components/shared/link-button";

interface MethodLite {
  id: string;
  type: "CREDIT_CARD" | "BANK_ACCOUNT";
  last4: string;
  brand: string | null;
  bankName: string | null;
  isDefault: boolean;
}

function fmt(c: number) {
  return `$${(c / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

export function PayInvoiceWithFee({
  invoiceId,
  invoiceNumber,
  amount,
  methods,
}: {
  invoiceId: string;
  invoiceNumber: string;
  amount: number;
  methods: MethodLite[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [selectedId, setSelectedId] = useState<string>(
    methods.find((m) => m.isDefault)?.id ?? methods[0]?.id ?? ""
  );

  const selected = methods.find((m) => m.id === selectedId);
  const fee = selected ? calcProcessingFee(amount, selected.type) : 0;
  const totalToCharge = amount + fee;

  const submit = () => {
    if (!selectedId) {
      setMsg({ type: "error", text: "Choose a payment method first." });
      return;
    }
    startTransition(async () => {
      const r = await chargeInvoice(invoiceId, selectedId);
      if ("error" in r && r.error) setMsg({ type: "error", text: r.error });
      else if ("message" in r && r.message) {
        setMsg({ type: "success", text: r.message });
        setTimeout(() => {
          setOpen(false);
          router.refresh();
        }, 900);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" />}>
        <CreditCard className="h-3.5 w-3.5" /> Pay Now
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pay Invoice {invoiceNumber}</DialogTitle>
          <DialogDescription>Confirm payment details below.</DialogDescription>
        </DialogHeader>

        {methods.length === 0 ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 p-4 text-sm space-y-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 text-amber-700 dark:text-amber-400" />
              <p className="text-amber-900 dark:text-amber-200">
                You don&apos;t have any saved payment methods yet.
              </p>
            </div>
            <LinkButton href="/portal/payments/methods" size="sm">
              Add Payment Method
            </LinkButton>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <p className="text-sm font-medium">Payment Method</p>
              {methods.map((m) => (
                <label
                  key={m.id}
                  className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer text-sm ${
                    selectedId === m.id
                      ? "border-primary bg-primary/5"
                      : "hover:border-foreground/20"
                  }`}
                >
                  <input
                    type="radio"
                    checked={selectedId === m.id}
                    onChange={() => setSelectedId(m.id)}
                    className="accent-primary"
                  />
                  {m.type === "CREDIT_CARD" ? (
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="flex-1">
                    {m.type === "CREDIT_CARD"
                      ? `${m.brand ?? "Card"} •••• ${m.last4}`
                      : `${m.bankName ?? "Bank"} •••• ${m.last4}`}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {m.type === "CREDIT_CARD" ? "3% fee" : "$0.50 fee"}
                  </span>
                </label>
              ))}
            </div>

            <div className="rounded-lg border bg-muted/40 p-3 text-sm space-y-1">
              <Row label="Invoice amount" value={fmt(amount)} />
              <Row
                label={
                  selected?.type === "CREDIT_CARD"
                    ? "Processing fee (3%)"
                    : "ACH fee"
                }
                value={fmt(fee)}
              />
              <div className="border-t pt-1 mt-1">
                <Row label="Total charged" value={fmt(totalToCharge)} bold />
              </div>
            </div>

            {msg && (
              <div
                className={`rounded-lg p-3 text-sm flex items-start gap-2 ${
                  msg.type === "success"
                    ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300"
                    : "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                }`}
              >
                {msg.type === "success" ? (
                  <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                )}
                <span>{msg.text}</span>
              </div>
            )}
          </>
        )}

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          {methods.length > 0 && (
            <Button onClick={submit} disabled={pending}>
              {pending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Processing...
                </>
              ) : (
                <>Pay {fmt(totalToCharge)}</>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "font-semibold" : ""}`}>
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}
