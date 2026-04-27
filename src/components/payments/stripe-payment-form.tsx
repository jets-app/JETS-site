"use client";

import { useEffect, useState, useTransition } from "react";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Loader2, Lock, CheckCircle2 } from "lucide-react";

let stripePromise: Promise<Stripe | null> | null = null;
function getStripePromise() {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!key) {
      console.error("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set");
      return null;
    }
    stripePromise = loadStripe(key);
  }
  return stripePromise;
}

interface Props {
  clientSecret: string;
  amountCents: number;
  onSuccess: (paymentIntentId: string) => Promise<void>;
  submitLabel?: string;
}

export function StripePaymentForm({
  clientSecret,
  amountCents,
  onSuccess,
  submitLabel,
}: Props) {
  const promise = getStripePromise();
  if (!promise) {
    return (
      <p className="text-sm text-destructive">
        Payment is not configured. Please contact support.
      </p>
    );
  }

  return (
    <Elements
      stripe={promise}
      options={{
        clientSecret,
        appearance: {
          theme: "stripe",
          variables: {
            colorPrimary: "#0f172a",
            borderRadius: "8px",
            fontFamily: "inherit",
          },
        },
      }}
    >
      <InnerForm amountCents={amountCents} onSuccess={onSuccess} submitLabel={submitLabel} />
    </Elements>
  );
}

function InnerForm({
  amountCents,
  onSuccess,
  submitLabel,
}: {
  amountCents: number;
  onSuccess: (paymentIntentId: string) => Promise<void>;
  submitLabel?: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isReady, setIsReady] = useState(false);
  const [succeeded, setSucceeded] = useState(false);

  useEffect(() => {
    if (stripe && elements) setIsReady(true);
  }, [stripe, elements]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setError(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message ?? "Please check your card details.");
      return;
    }

    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (confirmError) {
      setError(confirmError.message ?? "Payment failed. Please try again.");
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      setSucceeded(true);
      startTransition(async () => {
        await onSuccess(paymentIntent.id);
      });
    } else {
      setError(
        `Payment is ${paymentIntent?.status ?? "pending"} — please try again.`,
      );
    }
  }

  if (succeeded) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <p className="font-medium">Payment successful</p>
        <p className="text-sm text-muted-foreground">
          {isPending ? "Finalizing..." : "Redirecting..."}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Card form + Apple Pay button on supporting devices. Google Pay and
          other wallets are hidden — keeps the UI focused on credit card. */}
      <PaymentElement
        options={{
          wallets: { applePay: "auto", googlePay: "never" },
        }}
      />
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}
      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={!isReady || isPending}
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing…
          </>
        ) : (
          <>
            <Lock className="mr-2 h-4 w-4" />
            {submitLabel ?? `Pay ${formatMoney(amountCents)}`}
          </>
        )}
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        Payments are processed securely by Stripe. Your card details are never
        stored on our servers.
      </p>
    </form>
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
