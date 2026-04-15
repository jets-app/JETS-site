"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Loader2, Tag, CheckCircle2 } from "lucide-react";
import {
  createApplicationFeeCheckout,
  applyDiscountCode,
} from "@/server/actions/payment.actions";

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
  const [isPayPending, startPayTransition] = useTransition();
  const [isCodePending, startCodeTransition] = useTransition();
  const [code, setCode] = useState("");
  const [codeMessage, setCodeMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [payError, setPayError] = useState<string | null>(null);

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

  function handlePay() {
    setPayError(null);
    startPayTransition(async () => {
      const result = await createApplicationFeeCheckout(applicationId);
      if ("error" in result && result.error) {
        setPayError(result.error);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-5">
      {/* Discount code section */}
      {!hasDiscount ? (
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
      ) : (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 dark:bg-emerald-900/10 p-3 flex items-center gap-2 text-sm">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span className="text-emerald-800 dark:text-emerald-300">
            Discount code {existingCode && <strong>{existingCode}</strong>}{" "}
            applied.
          </span>
        </div>
      )}

      {/* Pay button */}
      <div className="space-y-2">
        <Button
          onClick={handlePay}
          disabled={isPayPending}
          className="w-full"
          size="lg"
        >
          {isPayPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <CreditCard className="mr-2 h-4 w-4" />
          )}
          Pay ${(finalAmount / 100).toFixed(2)}
        </Button>
        {payError && (
          <p className="text-xs text-destructive text-center">{payError}</p>
        )}
      </div>
    </div>
  );
}
