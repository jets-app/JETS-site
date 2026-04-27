"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Tag, CheckCircle2 } from "lucide-react";
import {
  createApplicationFeePaymentIntent,
  confirmApplicationFeePaid,
  applyDiscountCode,
} from "@/server/actions/payment.actions";
import { StripePaymentForm } from "@/components/payments/stripe-payment-form";

export function PaymentClient({
  applicationId,
  finalAmount,
  hasDiscount,
  existingCode,
}: {
  applicationId: string;
  finalAmount: number;
  hasDiscount: boolean;
  existingCode: string | null;
}) {
  const router = useRouter();
  const [isCodePending, startCodeTransition] = useTransition();
  const [isStartPending, startStartTransition] = useTransition();
  const [code, setCode] = useState("");
  const [codeMessage, setCodeMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [intentAmount, setIntentAmount] = useState<number | null>(null);

  const waived = finalAmount <= 0;

  // If a discount drops the fee to $0 mid-flow, drop the existing intent
  useEffect(() => {
    if (waived && clientSecret) {
      setClientSecret(null);
      setIntentAmount(null);
    }
  }, [waived, clientSecret]);

  function handleApplyCode() {
    if (!code.trim()) {
      setCodeMessage({ type: "error", text: "Enter a discount code." });
      return;
    }
    setCodeMessage(null);
    startCodeTransition(async () => {
      const result = await applyDiscountCode(applicationId, code);
      if ("error" in result && result.error) {
        setCodeMessage({ type: "error", text: result.error });
      } else if ("success" in result) {
        setCodeMessage({
          type: "success",
          text: result.message ?? "Discount applied!",
        });
        setCode("");
        router.refresh();
      }
    });
  }

  function handleStartPayment() {
    setError(null);
    startStartTransition(async () => {
      const result = await createApplicationFeePaymentIntent(applicationId);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.waived) {
        router.refresh();
        return;
      }
      if (result.clientSecret) {
        setClientSecret(result.clientSecret);
        setIntentAmount(result.amount ?? finalAmount);
      }
    });
  }

  async function handlePaymentSuccess(paymentIntentId: string) {
    const result = await confirmApplicationFeePaid(applicationId, paymentIntentId);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-5">
      {/* Discount code section — hide once payment form has started */}
      {!hasDiscount && !clientSecret && (
        <div className="space-y-2">
          <Label htmlFor="discount-code" className="flex items-center gap-1.5">
            <Tag className="h-3.5 w-3.5" />
            Have a discount code?
          </Label>
          <div className="flex gap-2">
            <Input
              id="discount-code"
              placeholder="Enter code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              disabled={isCodePending}
              className="uppercase"
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleApplyCode}
              disabled={isCodePending}
            >
              {isCodePending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Apply"
              )}
            </Button>
          </div>
          {codeMessage && (
            <p
              className={`text-xs ${
                codeMessage.type === "success"
                  ? "text-emerald-600"
                  : "text-destructive"
              }`}
            >
              {codeMessage.text}
            </p>
          )}
        </div>
      )}

      {hasDiscount && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 dark:bg-emerald-900/10 p-3 flex items-center gap-2 text-sm">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span className="text-emerald-800 dark:text-emerald-300">
            Discount code {existingCode && <strong>{existingCode}</strong>} applied.
          </span>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Show "Continue to payment" until they click, then swap to the Stripe form */}
      {!waived && !clientSecret && (
        <Button
          onClick={handleStartPayment}
          disabled={isStartPending}
          size="lg"
          className="w-full"
        >
          {isStartPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Preparing checkout...
            </>
          ) : (
            `Continue to payment · $${(finalAmount / 100).toFixed(2)}`
          )}
        </Button>
      )}

      {!waived && clientSecret && intentAmount !== null && (
        <StripePaymentForm
          clientSecret={clientSecret}
          amountCents={intentAmount}
          onSuccess={handlePaymentSuccess}
          submitLabel={`Pay $${(intentAmount / 100).toFixed(2)}`}
        />
      )}

      {waived && (
        <Button
          onClick={handleStartPayment}
          disabled={isStartPending}
          size="lg"
          className="w-full"
        >
          {isStartPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Completing...
            </>
          ) : (
            <>
              Complete (Fee Waived)
              <CheckCircle2 className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      )}
    </div>
  );
}
