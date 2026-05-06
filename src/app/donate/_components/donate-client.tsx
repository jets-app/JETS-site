"use client";

import { useMemo, useState } from "react";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Heart,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { startPublicDonation } from "@/server/actions/public-donation.actions";

interface SchoolInfo {
  name: string;
  legalName: string;
  ein: string;
  address: string;
  phone: string;
  email: string;
}

const PRESET_AMOUNTS = [
  { value: 1800, label: "$18", note: "Chai" },
  { value: 3600, label: "$36", note: "Double Chai" },
  { value: 18000, label: "$180", note: "10× Chai" },
  { value: 36000, label: "$360", note: "20× Chai" },
  { value: 100000, label: "$1,000" },
  { value: 180000, label: "$1,800", note: "100× Chai" },
];

const PURPOSES = [
  { value: "general", label: "General Fund" },
  { value: "scholarship", label: "Pay-It-Forward Scholarship Fund" },
  { value: "building", label: "Building Fund" },
  { value: "yahrzeit", label: "Yahrzeit / Memorial" },
  { value: "trip", label: "Trip / Event Sponsorship" },
];

function fmt(c: number) {
  return `$${(c / 100).toLocaleString("en-US", { minimumFractionDigits: c % 100 === 0 ? 0 : 2, maximumFractionDigits: 2 })}`;
}

export function DonateClient({
  school,
  stripePublishableKey,
}: {
  school: SchoolInfo;
  stripePublishableKey: string;
}) {
  const stripePromise = useMemo<Promise<Stripe | null>>(
    () => (stripePublishableKey ? loadStripe(stripePublishableKey) : Promise.resolve(null)),
    [stripePublishableKey],
  );

  // Stage 1: amount + details. Stage 2: payment.
  const [stage, setStage] = useState<"details" | "payment" | "complete">(
    "details",
  );

  const [amountCents, setAmountCents] = useState(18000);
  const [customAmount, setCustomAmount] = useState("");
  const [frequency, setFrequency] = useState<"ONE_TIME" | "MONTHLY">("ONE_TIME");
  const [purpose, setPurpose] = useState("general");
  const [inHonorOf, setInHonorOf] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [donor, setDonor] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [intentClientSecret, setIntentClientSecret] = useState<string | null>(
    null,
  );
  const [intentMode, setIntentMode] = useState<"payment" | "setup">("payment");

  const customCents = customAmount
    ? Math.round(parseFloat(customAmount) * 100)
    : 0;
  const effectiveAmount = customAmount ? customCents : amountCents;

  const startCheckout = async () => {
    setErrorMsg(null);
    if (effectiveAmount < 500) {
      setErrorMsg("Minimum donation is $5.");
      return;
    }
    if (!donor.firstName.trim() || !donor.lastName.trim() || !donor.email.includes("@")) {
      setErrorMsg("Please fill in your name and a valid email.");
      return;
    }
    setSubmitting(true);
    try {
      const r = await startPublicDonation({
        amountCents: effectiveAmount,
        frequency,
        purpose,
        inHonorOf: inHonorOf.trim() || undefined,
        donor,
        anonymous,
      });
      if ("error" in r && r.error) {
        setErrorMsg(r.error);
        setSubmitting(false);
        return;
      }
      if ("clientSecret" in r && r.clientSecret) {
        setIntentClientSecret(r.clientSecret);
        setIntentMode(r.mode);
        setStage("payment");
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
              JETS
            </div>
            <span className="font-semibold text-sm">{school.name}</span>
          </a>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" />
            Secure
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10 sm:py-14">
        {stage === "complete" ? (
          <SuccessPanel donor={donor} amount={effectiveAmount} school={school} />
        ) : (
          <>
            {/* Hero */}
            {stage === "details" && (
              <div className="text-center space-y-3 mb-8">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-4 py-1.5 text-xs font-medium">
                  <Heart className="h-3.5 w-3.5" /> Support JETS School
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                  Your donation changes lives
                </h1>
                <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                  Every gift supports the mission of {school.name} — providing
                  young men with a Torah-rich education paired with real-world
                  professional skills.
                </p>
              </div>
            )}

            {stage === "details" ? (
              <DetailsForm
                amountCents={amountCents}
                setAmountCents={setAmountCents}
                customAmount={customAmount}
                setCustomAmount={setCustomAmount}
                frequency={frequency}
                setFrequency={setFrequency}
                purpose={purpose}
                setPurpose={setPurpose}
                inHonorOf={inHonorOf}
                setInHonorOf={setInHonorOf}
                anonymous={anonymous}
                setAnonymous={setAnonymous}
                donor={donor}
                setDonor={setDonor}
                effectiveAmount={effectiveAmount}
                submitting={submitting}
                errorMsg={errorMsg}
                onSubmit={startCheckout}
                school={school}
              />
            ) : (
              intentClientSecret && (
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret: intentClientSecret,
                    appearance: { theme: "stripe" },
                  }}
                >
                  <PaymentForm
                    amount={effectiveAmount}
                    frequency={frequency}
                    mode={intentMode}
                    onBack={() => setStage("details")}
                    onSuccess={() => setStage("complete")}
                  />
                </Elements>
              )
            )}
          </>
        )}

        {/* Trust signals — always visible */}
        <div className="mt-12 pt-8 border-t text-center space-y-3">
          <p className="text-xs text-muted-foreground leading-relaxed max-w-md mx-auto">
            <strong>{school.legalName}</strong> is a 501(c)(3) nonprofit
            organization. <strong>EIN: {school.ein}</strong>. Your donation is
            tax-deductible to the fullest extent allowed by law.
          </p>
          <p className="text-xs text-muted-foreground">
            {school.address} · {school.phone} ·{" "}
            <a
              href={`mailto:${school.email}`}
              className="underline underline-offset-2"
            >
              {school.email}
            </a>
          </p>
          <div className="flex items-center justify-center gap-3 text-[10px] text-muted-foreground/80 pt-2">
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" /> 256-bit SSL
            </span>
            <span>·</span>
            <span>Powered by Stripe</span>
            <span>·</span>
            <span>No credit card data stored on our servers</span>
          </div>
        </div>
      </main>
    </div>
  );
}

interface DonorState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

interface DetailsFormProps {
  amountCents: number;
  setAmountCents: (v: number) => void;
  customAmount: string;
  setCustomAmount: (v: string) => void;
  frequency: "ONE_TIME" | "MONTHLY";
  setFrequency: (v: "ONE_TIME" | "MONTHLY") => void;
  purpose: string;
  setPurpose: (v: string) => void;
  inHonorOf: string;
  setInHonorOf: (v: string) => void;
  anonymous: boolean;
  setAnonymous: (v: boolean) => void;
  donor: DonorState;
  setDonor: (v: DonorState) => void;
  effectiveAmount: number;
  submitting: boolean;
  errorMsg: string | null;
  onSubmit: () => void;
  school: SchoolInfo;
}

function DetailsForm(props: DetailsFormProps) {
  const {
    amountCents,
    setAmountCents,
    customAmount,
    setCustomAmount,
    frequency,
    setFrequency,
    purpose,
    setPurpose,
    inHonorOf,
    setInHonorOf,
    anonymous,
    setAnonymous,
    donor,
    setDonor,
    effectiveAmount,
    submitting,
    errorMsg,
    onSubmit,
  } = props;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="rounded-2xl border bg-card shadow-sm p-6 sm:p-8 space-y-7"
    >
      {/* Frequency tabs */}
      <div className="grid grid-cols-2 rounded-lg border p-1 bg-muted/30">
        <button
          type="button"
          onClick={() => setFrequency("ONE_TIME")}
          className={`rounded-md py-2 text-sm font-medium transition-colors ${
            frequency === "ONE_TIME"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          One-time
        </button>
        <button
          type="button"
          onClick={() => setFrequency("MONTHLY")}
          className={`rounded-md py-2 text-sm font-medium transition-colors ${
            frequency === "MONTHLY"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Monthly
        </button>
      </div>

      {/* Amount picker */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">
          Donation amount{frequency === "MONTHLY" ? " (per month)" : ""}
        </Label>
        <div className="grid grid-cols-3 gap-2">
          {PRESET_AMOUNTS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => {
                setAmountCents(p.value);
                setCustomAmount("");
              }}
              className={`rounded-lg border px-3 py-3 text-center transition-colors ${
                !customAmount && amountCents === p.value
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                  : "hover:border-foreground/30"
              }`}
            >
              <div className="font-semibold">{p.label}</div>
              {p.note && (
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  {p.note}
                </div>
              )}
            </button>
          ))}
        </div>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
            $
          </span>
          <Input
            type="text"
            inputMode="decimal"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value.replace(/[^0-9.]/g, ""))}
            placeholder="Or enter a custom amount"
            className="pl-6"
          />
        </div>
      </div>

      {/* Designation */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Designation</Label>
        <Select value={purpose} onValueChange={(v) => v && setPurpose(v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PURPOSES.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* In honor of */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">
          In honor of / In memory of <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Input
          value={inHonorOf}
          onChange={(e) => setInHonorOf(e.target.value)}
          placeholder="e.g. In memory of my grandfather"
        />
      </div>

      {/* Donor info */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Your information</Label>
        <div className="grid sm:grid-cols-2 gap-3">
          <Input
            placeholder="First name"
            value={donor.firstName}
            onChange={(e) => setDonor({ ...donor, firstName: e.target.value })}
            required
          />
          <Input
            placeholder="Last name"
            value={donor.lastName}
            onChange={(e) => setDonor({ ...donor, lastName: e.target.value })}
            required
          />
        </div>
        <Input
          type="email"
          placeholder="Email (for receipt)"
          value={donor.email}
          onChange={(e) => setDonor({ ...donor, email: e.target.value })}
          required
        />
        <Input
          type="tel"
          placeholder="Phone (optional)"
          value={donor.phone}
          onChange={(e) => setDonor({ ...donor, phone: e.target.value })}
        />
        <Input
          placeholder="Address (optional)"
          value={donor.address}
          onChange={(e) => setDonor({ ...donor, address: e.target.value })}
        />
        <div className="grid grid-cols-3 gap-3">
          <Input
            placeholder="City"
            value={donor.city}
            onChange={(e) => setDonor({ ...donor, city: e.target.value })}
          />
          <Input
            placeholder="State"
            value={donor.state}
            onChange={(e) => setDonor({ ...donor, state: e.target.value })}
          />
          <Input
            placeholder="ZIP"
            value={donor.zipCode}
            onChange={(e) => setDonor({ ...donor, zipCode: e.target.value })}
          />
        </div>
        <label className="flex items-center gap-2 text-xs text-muted-foreground pt-1 cursor-pointer">
          <input
            type="checkbox"
            checked={anonymous}
            onChange={(e) => setAnonymous(e.target.checked)}
            className="accent-primary"
          />
          Make this donation anonymous in public listings
        </label>
      </div>

      {errorMsg && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800 flex items-start gap-2 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <Button
        type="submit"
        size="lg"
        className="w-full text-base"
        disabled={submitting || effectiveAmount < 500}
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading…
          </>
        ) : (
          <>
            Donate {fmt(effectiveAmount)}
            {frequency === "MONTHLY" ? " / month" : ""}
          </>
        )}
      </Button>

      <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
        Continue to the secure payment page.
      </p>
    </form>
  );
}

function PaymentForm({
  amount,
  frequency,
  mode,
  onBack,
  onSuccess,
}: {
  amount: number;
  frequency: "ONE_TIME" | "MONTHLY";
  mode: "payment" | "setup";
  onBack: () => void;
  onSuccess: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true);
    setError(null);

    if (mode === "payment") {
      const { error: err } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: `${window.location.origin}/donate` },
        redirect: "if_required",
      });
      if (err) {
        setError(err.message ?? "Payment failed.");
        setProcessing(false);
        return;
      }
      onSuccess();
    } else {
      const { error: err } = await stripe.confirmSetup({
        elements,
        confirmParams: { return_url: `${window.location.origin}/donate` },
        redirect: "if_required",
      });
      if (err) {
        setError(err.message ?? "Setup failed.");
        setProcessing(false);
        return;
      }
      onSuccess();
    }
  };

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border bg-card shadow-sm p-6 sm:p-8 space-y-5"
    >
      <div className="text-center space-y-1">
        <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
          {frequency === "MONTHLY" ? "Monthly donation" : "One-time donation"}
        </p>
        <h2 className="text-3xl font-bold tracking-tight">
          {fmt(amount)}
          {frequency === "MONTHLY" && (
            <span className="text-base text-muted-foreground font-normal">
              {" / month"}
            </span>
          )}
        </h2>
      </div>

      <PaymentElement />

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800 flex items-start gap-2 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={processing}
        >
          Back
        </Button>
        <Button
          type="submit"
          size="lg"
          className="flex-1"
          disabled={!stripe || processing}
        >
          {processing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing…
            </>
          ) : (
            <>Donate {fmt(amount)}</>
          )}
        </Button>
      </div>
    </form>
  );
}

function SuccessPanel({
  donor,
  amount,
  school,
}: {
  donor: { firstName: string; lastName: string; email: string };
  amount: number;
  school: SchoolInfo;
}) {
  return (
    <div className="rounded-2xl border bg-card shadow-sm p-8 sm:p-10 text-center space-y-5">
      <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
        <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
      </div>
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Thank you, {donor.firstName}!</h2>
        <p className="text-muted-foreground mt-2 leading-relaxed">
          Your gift of {fmt(amount)} has been received. A receipt will arrive at{" "}
          <strong>{donor.email}</strong> shortly.
        </p>
      </div>
      <div className="pt-3 text-sm text-muted-foreground">
        <p>
          {school.legalName} · 501(c)(3) · EIN {school.ein}
        </p>
      </div>
    </div>
  );
}
