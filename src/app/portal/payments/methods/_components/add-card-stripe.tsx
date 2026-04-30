"use client";

import { useEffect, useState } from "react";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Loader2, Lock } from "lucide-react";
import { createSetupIntent } from "@/server/actions/auto-pay.actions";

let stripePromise: Promise<Stripe | null> | null = null;
function getStripe() {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!key) return null;
    stripePromise = loadStripe(key);
  }
  return stripePromise;
}

/**
 * Adds a credit card via Stripe's Setup Intent flow. Card details go directly
 * from the parent's browser to Stripe — never touch our servers. After
 * successful confirmation Stripe fires `setup_intent.succeeded` to our
 * webhook which creates the PaymentMethod row in our DB.
 */
export function AddCardStripe({ onAdded }: { onAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Lazy-load the Setup Intent only when the dialog opens
  useEffect(() => {
    if (!open) {
      setClientSecret(null);
      setError(null);
      return;
    }
    let cancelled = false;
    (async () => {
      const result = await createSetupIntent();
      if (cancelled) return;
      if ("error" in result && result.error) {
        setError(result.error);
        return;
      }
      if ("clientSecret" in result && result.clientSecret) {
        setClientSecret(result.clientSecret);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  const stripe = getStripe();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant="default" />}>
        <Plus className="h-3.5 w-3.5" /> Add Credit Card
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Credit Card</DialogTitle>
          <DialogDescription>
            Card details are processed securely by Stripe. JETS never sees or
            stores your card number.
          </DialogDescription>
        </DialogHeader>

        {!stripe ? (
          <p className="text-sm text-destructive">
            Stripe is not configured. Please contact support.
          </p>
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : !clientSecret ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : (
          <Elements
            stripe={stripe}
            options={{
              clientSecret,
              appearance: {
                theme: "stripe",
                variables: {
                  colorPrimary: "#A30018",
                  borderRadius: "8px",
                  fontFamily: "inherit",
                },
              },
            }}
          >
            <SetupForm
              onSuccess={() => {
                setOpen(false);
                toast.success("Card saved. It'll appear in your list shortly.");
                // The webhook (setup_intent.succeeded) creates the row server-side.
                // Give it a beat then refresh.
                setTimeout(() => onAdded(), 1500);
              }}
            />
          </Elements>
        )}
      </DialogContent>
    </Dialog>
  );
}

function SetupForm({ onSuccess }: { onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message ?? "Please check your card details.");
      setSubmitting(false);
      return;
    }

    const { error: confirmError } = await stripe.confirmSetup({
      elements,
      redirect: "if_required",
    });

    if (confirmError) {
      setError(confirmError.message ?? "Couldn't save card. Please try again.");
      setSubmitting(false);
      return;
    }

    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement
        options={{
          wallets: { applePay: "auto", googlePay: "never" },
        }}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <DialogFooter>
        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving
            </>
          ) : (
            <>
              <Lock className="mr-2 h-4 w-4" />
              Save card
            </>
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}
