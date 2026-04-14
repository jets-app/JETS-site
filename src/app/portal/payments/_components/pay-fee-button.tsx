"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2 } from "lucide-react";
import { createApplicationFeeCheckout } from "@/server/actions/payment.actions";

export function PayApplicationFeeButton({
  applicationId,
  amount,
}: {
  applicationId: string;
  amount: number;
}) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function handlePay() {
    startTransition(async () => {
      const result = await createApplicationFeeCheckout(applicationId);
      if (result.error) {
        setMessage(result.error);
      } else {
        setMessage(result.message ?? "Payment processed!");
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Button onClick={handlePay} disabled={isPending} size="sm">
        {isPending ? (
          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
        ) : (
          <CreditCard className="mr-1.5 h-3.5 w-3.5" />
        )}
        Pay ${(amount / 100).toFixed(2)}
      </Button>
      {message && (
        <span className="text-sm text-muted-foreground">{message}</span>
      )}
    </div>
  );
}
