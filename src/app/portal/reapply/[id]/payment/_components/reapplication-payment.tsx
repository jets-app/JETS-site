"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { applyReapplicationDiscount } from "@/server/actions/reapplication.actions";
import {
  createApplicationFeePaymentIntent,
  confirmApplicationFeePaid,
} from "@/server/actions/payment.actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Tag, CheckCircle2 } from "lucide-react";
import { StripePaymentForm } from "@/components/payments/stripe-payment-form";

interface Props {
  applicationId: string;
  academicYear: string;
  studentName: string;
  feeAmountCents: number;
  existingDiscountCode: string | null;
  existingDiscountAmount: number;
}

export function ReapplicationPayment({
  applicationId,
  academicYear,
  studentName,
  feeAmountCents,
  existingDiscountCode,
  existingDiscountAmount,
}: Props) {
  const router = useRouter();
  const [code, setCode] = useState(existingDiscountCode ?? "");
  const [discountAmount, setDiscountAmount] = useState(existingDiscountAmount);
  const [appliedCode, setAppliedCode] = useState<string | null>(existingDiscountCode);
  const [error, setError] = useState<string | null>(null);
  const [isApplying, startApplying] = useTransition();

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [intentAmount, setIntentAmount] = useState<number | null>(null);
  const [isStartingPayment, startStartingPayment] = useTransition();
  const [isCompleting, startCompleting] = useTransition();

  const finalCents = Math.max(0, feeAmountCents - discountAmount);
  const waived = finalCents === 0;

  // If the discount makes the fee $0 and the user had started a payment, reset it.
  useEffect(() => {
    if (waived && clientSecret) {
      setClientSecret(null);
      setIntentAmount(null);
    }
  }, [waived, clientSecret]);

  function handleApplyCode() {
    setError(null);
    if (!code.trim()) return;
    startApplying(async () => {
      const result = await applyReapplicationDiscount(applicationId, code.trim());
      if (result.error) {
        setError(result.error);
        return;
      }
      setDiscountAmount(result.discountAmount ?? 0);
      setAppliedCode(code.trim());
      if (result.waived) {
        router.refresh();
      }
    });
  }

  function handleStartPayment() {
    setError(null);
    startStartingPayment(async () => {
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
        setIntentAmount(result.amount ?? finalCents);
      }
    });
  }

  function handleCompleteWaived() {
    setError(null);
    startCompleting(async () => {
      const result = await createApplicationFeePaymentIntent(applicationId);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
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
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Complete registration
        </h1>
        <p className="text-muted-foreground">
          {studentName} · {academicYear}
        </p>
      </div>

      <div className="bg-card border rounded-2xl p-6 lg:p-8 space-y-6">
        {/* Price summary */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Registration Fee</span>
            <span>{formatMoney(feeAmountCents)}</span>
          </div>
          {appliedCode && discountAmount > 0 && (
            <div className="flex items-center justify-between text-sm text-emerald-600">
              <span className="flex items-center gap-2">
                <Tag className="h-3.5 w-3.5" />
                Discount ({appliedCode})
              </span>
              <span>−{formatMoney(discountAmount)}</span>
            </div>
          )}
          <div className="h-px bg-border" />
          <div className="flex items-center justify-between">
            <span className="font-semibold">Total</span>
            <span className="text-2xl font-bold">
              {waived ? "Free" : formatMoney(finalCents)}
            </span>
          </div>
        </div>

        {/* Discount code — hidden once payment form has started */}
        {!waived && !clientSecret && (
          <div className="space-y-2">
            <Label htmlFor="discountCode" className="text-sm">
              Discount code (optional)
            </Label>
            <div className="flex gap-2">
              <Input
                id="discountCode"
                placeholder="e.g. early2026"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                disabled={isApplying}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleApplyCode}
                disabled={isApplying || !code.trim()}
              >
                {isApplying ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
              </Button>
            </div>
            {appliedCode && discountAmount > 0 && (
              <p className="text-xs text-emerald-600 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                &quot;{appliedCode}&quot; applied
              </p>
            )}
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Waived — single button to complete */}
        {waived && (
          <Button
            onClick={handleCompleteWaived}
            disabled={isCompleting}
            size="lg"
            className="w-full"
          >
            {isCompleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Completing...
              </>
            ) : (
              <>
                Complete Reapplication
                <CheckCircle2 className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        )}

        {/* Paid flow — initially show "Continue to payment" button, then replace with Stripe form */}
        {!waived && !clientSecret && (
          <Button
            onClick={handleStartPayment}
            disabled={isStartingPayment}
            size="lg"
            className="w-full"
          >
            {isStartingPayment ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Preparing checkout...
              </>
            ) : (
              `Continue to payment · ${formatMoney(finalCents)}`
            )}
          </Button>
        )}

        {!waived && clientSecret && intentAmount !== null && (
          <StripePaymentForm
            clientSecret={clientSecret}
            amountCents={intentAmount}
            onSuccess={handlePaymentSuccess}
            submitLabel={`Pay ${formatMoney(intentAmount)}`}
          />
        )}
      </div>
    </div>
  );
}

function formatMoney(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}
