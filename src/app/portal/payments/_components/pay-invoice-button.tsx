"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { CreditCard, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { payInvoice } from "@/server/actions/tuition-payment.actions";

interface PaymentMethod {
  type: "card" | "bank";
  last4: string;
  label: string;
}

export function PayInvoiceButton({
  invoiceId,
  invoiceNumber,
  amount,
  methods,
}: {
  invoiceId: string;
  invoiceNumber: string;
  amount: number;
  methods: PaymentMethod[];
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [selectedIdx, setSelectedIdx] = useState(0);

  function handlePay() {
    setMessage(null);
    const method = methods[selectedIdx];
    startTransition(async () => {
      const result = await payInvoice(
        invoiceId,
        method
          ? { type: method.type, last4: method.last4 }
          : { type: "card" }
      );
      if ("error" in result && result.error) {
        setMessage({ type: "error", text: result.error });
      } else if ("success" in result) {
        setMessage({
          type: "success",
          text: result.message ?? "Payment processed.",
        });
        setTimeout(() => setOpen(false), 1200);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm">
            <CreditCard className="mr-1.5 h-3.5 w-3.5" />
            Pay Now
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pay Invoice {invoiceNumber}</DialogTitle>
          <DialogDescription>
            Pay ${(amount / 100).toFixed(2)} to JETS School.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {methods.length === 0 ? (
            <div className="rounded-lg border bg-amber-50 dark:bg-amber-900/20 p-3 text-sm text-amber-700 dark:text-amber-300 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                No payment methods saved. A test payment will still be recorded.
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm font-medium">Payment Method</p>
              <div className="space-y-1.5">
                {methods.map((m, idx) => (
                  <label
                    key={idx}
                    className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer text-sm transition-colors ${
                      selectedIdx === idx
                        ? "border-primary bg-primary/5"
                        : "hover:border-foreground/20"
                    }`}
                  >
                    <input
                      type="radio"
                      checked={selectedIdx === idx}
                      onChange={() => setSelectedIdx(idx)}
                      className="accent-primary"
                    />
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span>{m.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
            <span className="font-medium">Test mode:</span> No real payment will
            be processed. The invoice will be marked as paid.
          </div>

          {message && (
            <div
              className={`rounded-lg p-3 text-sm flex items-start gap-2 ${
                message.type === "success"
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"
                  : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              )}
              <span>{message.text}</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button onClick={handlePay} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Processing...
              </>
            ) : (
              <>Pay ${(amount / 100).toFixed(2)}</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
