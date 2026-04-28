"use client";

import Link from "next/link";
import { CreditCard } from "lucide-react";

/**
 * Sends the parent to the dedicated inline-Stripe payment page instead of
 * trying to render a standalone checkout button. Keeps a single payment flow
 * for the entire app (the legacy Stripe Checkout redirect was removed).
 */
export function PayApplicationFeeButton({
  applicationId,
  amount,
}: {
  applicationId: string;
  amount: number;
}) {
  return (
    <Link
      href={`/portal/applications/${applicationId}/payment`}
      className="inline-flex items-center justify-center gap-1.5 h-9 px-4 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
    >
      <CreditCard className="h-3.5 w-3.5" />
      Pay ${(amount / 100).toFixed(2)}
    </Link>
  );
}
