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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ShieldCheck,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Lock,
  Heart,
  Sparkles,
  ArrowRight,
  ChevronDown,
  ArrowLeft,
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
  { value: 1800, label: "$18", note: "Chai", impact: "1 day of learning materials" },
  { value: 3600, label: "$36", note: "Double Chai", impact: "A week of breakfasts" },
  { value: 18000, label: "$180", note: "10× Chai", impact: "1 month of meals for a student" },
  { value: 36000, label: "$360", note: "20× Chai", impact: "Sponsor a Shabbaton weekend" },
  { value: 100000, label: "$1,000", impact: "1 month of full tuition support" },
  { value: 180000, label: "$1,800", note: "100× Chai", impact: "1 semester of dorm housing" },
];

const PURPOSES = [
  { value: "general", label: "General Fund" },
  { value: "scholarship", label: "Pay-It-Forward Scholarship" },
  { value: "building", label: "Building Fund" },
  { value: "yahrzeit", label: "Yahrzeit / Memorial" },
  { value: "trip", label: "Trip / Event Sponsorship" },
];

const PURPOSE_LABEL: Record<string, string> = Object.fromEntries(
  PURPOSES.map((p) => [p.value, p.label]),
);

function fmtMoney(c: number) {
  return `$${(c / 100).toLocaleString("en-US", {
    minimumFractionDigits: c % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
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

export function DonateClient({
  school,
  stripePublishableKey,
}: {
  school: SchoolInfo;
  stripePublishableKey: string;
}) {
  const stripePromise = useMemo<Promise<Stripe | null>>(
    () =>
      stripePublishableKey
        ? loadStripe(stripePublishableKey)
        : Promise.resolve(null),
    [stripePublishableKey],
  );

  const [stage, setStage] = useState<"details" | "payment" | "complete">(
    "details",
  );

  const [amountCents, setAmountCents] = useState(18000);
  const [customAmount, setCustomAmount] = useState("");
  const [frequency, setFrequency] = useState<"ONE_TIME" | "MONTHLY">("ONE_TIME");
  const [purpose, setPurpose] = useState("general");
  const [inHonorOf, setInHonorOf] = useState("");
  const [showAddress, setShowAddress] = useState(false);
  const [anonymous, setAnonymous] = useState(false);
  const [donor, setDonor] = useState<DonorState>({
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
    if (
      !donor.firstName.trim() ||
      !donor.lastName.trim() ||
      !donor.email.includes("@")
    ) {
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
        // Smooth scroll to top of new view
        if (typeof window !== "undefined") {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-neutral-950">
      {/* ===== Top brand bar ===== */}
      <header className="bg-[#7a0012] text-white">
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-white/10 backdrop-blur flex items-center justify-center font-bold text-sm tracking-wide">
              JETS
            </div>
            <div>
              <div className="font-semibold text-sm leading-tight">
                {school.name}
              </div>
              <div className="text-[10px] text-white/70 leading-tight">
                Jewish Educational Trade School
              </div>
            </div>
          </a>
          <div className="flex items-center gap-1.5 text-xs text-white/80">
            <Lock className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Secure donation</span>
          </div>
        </div>
      </header>

      {/* ===== Stage: Complete ===== */}
      {stage === "complete" && (
        <main className="max-w-2xl mx-auto px-5 py-16">
          <SuccessPanel
            donor={donor}
            amount={effectiveAmount}
            frequency={frequency}
            purpose={purpose}
            school={school}
          />
        </main>
      )}

      {/* ===== Stage: Payment ===== */}
      {stage === "payment" && intentClientSecret && (
        <main className="max-w-2xl mx-auto px-5 py-10 sm:py-14">
          <button
            type="button"
            onClick={() => setStage("details")}
            className="inline-flex items-center gap-1.5 text-sm text-[#7a0012] hover:text-[#5e000d] mb-5 transition-colors font-medium"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Edit donation
          </button>

          <Elements
            stripe={stripePromise}
            options={{
              clientSecret: intentClientSecret,
              appearance: {
                theme: "stripe",
                variables: {
                  colorPrimary: "#7a0012",
                  colorText: "#1a1a1a",
                  fontFamily: "Georgia, serif",
                  borderRadius: "8px",
                },
              },
            }}
          >
            <PaymentForm
              amount={effectiveAmount}
              frequency={frequency}
              purpose={purpose}
              inHonorOf={inHonorOf}
              mode={intentMode}
              onSuccess={() => {
                setStage("complete");
                if (typeof window !== "undefined") {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
            />
          </Elements>
        </main>
      )}

      {/* ===== Stage: Details ===== */}
      {stage === "details" && (
        <>
          {/* Hero */}
          <section className="bg-gradient-to-br from-[#7a0012] via-[#5e000d] to-[#3d0008] text-white relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)",
                backgroundSize: "24px 24px",
              }}
            />
            <div className="max-w-3xl mx-auto px-5 py-14 sm:py-20 text-center relative">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur px-4 py-1.5 text-xs font-medium mb-5 ring-1 ring-white/20">
                <Sparkles className="h-3.5 w-3.5" />
                <span className="tracking-wide">Tax-deductible · 501(c)(3)</span>
              </div>
              <h1
                className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.05] mb-4"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                Help shape a generation of <em className="not-italic text-white/95">Torah and trade.</em>
              </h1>
              <p className="text-white/85 text-base sm:text-lg leading-relaxed max-w-xl mx-auto">
                Your donation funds Torah-rich education paired with real-world
                professional skills for young men ready to lead.
              </p>
            </div>
          </section>

          {/* Donation form */}
          <main className="max-w-6xl mx-auto px-5 py-10 lg:py-14">
            <div className="grid lg:grid-cols-[1fr_360px] gap-8 items-start">
              {/* ===== Form column ===== */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  startCheckout();
                }}
                className="space-y-7"
              >
                {/* Frequency */}
                <Section
                  number="1"
                  title="How often would you like to give?"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <FrequencyButton
                      active={frequency === "ONE_TIME"}
                      onClick={() => setFrequency("ONE_TIME")}
                      title="One-time"
                      sub="A single gift today"
                    />
                    <FrequencyButton
                      active={frequency === "MONTHLY"}
                      onClick={() => setFrequency("MONTHLY")}
                      title="Monthly"
                      sub="Lasting impact, every month"
                      badge="Most impact"
                    />
                  </div>
                </Section>

                {/* Amount */}
                <Section
                  number="2"
                  title={
                    frequency === "MONTHLY"
                      ? "Choose a monthly amount"
                      : "Choose your gift"
                  }
                >
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {PRESET_AMOUNTS.map((p) => {
                      const selected = !customAmount && amountCents === p.value;
                      return (
                        <button
                          key={p.value}
                          type="button"
                          onClick={() => {
                            setAmountCents(p.value);
                            setCustomAmount("");
                          }}
                          className={`group relative rounded-xl border-2 px-3 py-4 text-left transition-all ${
                            selected
                              ? "border-[#7a0012] bg-[#7a0012]/[0.03] shadow-sm"
                              : "border-stone-200 bg-white hover:border-stone-300 hover:shadow-sm"
                          }`}
                        >
                          <div className="flex items-baseline justify-between gap-2">
                            <span
                              className="text-xl font-bold tabular-nums"
                              style={{
                                fontFamily: "Georgia, 'Times New Roman', serif",
                              }}
                            >
                              {p.label}
                            </span>
                            {p.note && (
                              <span className="text-[10px] text-stone-500 uppercase tracking-wider font-medium">
                                {p.note}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-stone-600 mt-1.5 leading-snug">
                            {p.impact}
                          </p>
                          {selected && (
                            <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#7a0012] flex items-center justify-center">
                              <CheckCircle2 className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-3 relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500 font-medium">
                      $
                    </span>
                    <Input
                      type="text"
                      inputMode="decimal"
                      value={customAmount}
                      onChange={(e) =>
                        setCustomAmount(
                          e.target.value.replace(/[^0-9.]/g, ""),
                        )
                      }
                      placeholder="Other amount"
                      className="pl-8 h-12 text-base bg-white border-stone-200 focus-visible:border-[#7a0012] focus-visible:ring-[#7a0012]/20"
                    />
                  </div>
                </Section>

                {/* Designation */}
                <Section number="3" title="Designate your gift">
                  <Select
                    value={purpose}
                    onValueChange={(v) => v && setPurpose(v)}
                  >
                    <SelectTrigger className="h-12 bg-white border-stone-200 text-base">
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

                  <div className="mt-3">
                    <Label
                      htmlFor="honor"
                      className="text-xs uppercase tracking-wider text-stone-500 font-medium mb-1.5 block"
                    >
                      In honor of / In memory of <span className="lowercase tracking-normal text-stone-400 font-normal">— optional</span>
                    </Label>
                    <Input
                      id="honor"
                      value={inHonorOf}
                      onChange={(e) => setInHonorOf(e.target.value)}
                      placeholder="e.g. In memory of my grandfather, Z'L"
                      className="h-11 bg-white border-stone-200"
                    />
                  </div>
                </Section>

                {/* Donor info */}
                <Section number="4" title="Your information">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Input
                      placeholder="First name"
                      value={donor.firstName}
                      onChange={(e) =>
                        setDonor({ ...donor, firstName: e.target.value })
                      }
                      className="h-11 bg-white border-stone-200"
                      required
                    />
                    <Input
                      placeholder="Last name"
                      value={donor.lastName}
                      onChange={(e) =>
                        setDonor({ ...donor, lastName: e.target.value })
                      }
                      className="h-11 bg-white border-stone-200"
                      required
                    />
                  </div>
                  <Input
                    type="email"
                    placeholder="Email — receipt will be sent here"
                    value={donor.email}
                    onChange={(e) =>
                      setDonor({ ...donor, email: e.target.value })
                    }
                    className="h-11 bg-white border-stone-200 mt-3"
                    required
                  />
                  <Input
                    type="tel"
                    placeholder="Phone (optional)"
                    value={donor.phone}
                    onChange={(e) =>
                      setDonor({ ...donor, phone: e.target.value })
                    }
                    className="h-11 bg-white border-stone-200 mt-3"
                  />

                  {/* Collapsible address */}
                  <button
                    type="button"
                    onClick={() => setShowAddress((v) => !v)}
                    className="mt-3 inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-700 transition-colors"
                  >
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform ${showAddress ? "rotate-180" : ""}`}
                    />
                    {showAddress ? "Hide" : "Add"} mailing address (for printed receipts)
                  </button>
                  {showAddress && (
                    <div className="mt-3 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                      <Input
                        placeholder="Street address"
                        value={donor.address}
                        onChange={(e) =>
                          setDonor({ ...donor, address: e.target.value })
                        }
                        className="h-11 bg-white border-stone-200"
                      />
                      <div className="grid grid-cols-3 gap-3">
                        <Input
                          placeholder="City"
                          value={donor.city}
                          onChange={(e) =>
                            setDonor({ ...donor, city: e.target.value })
                          }
                          className="h-11 bg-white border-stone-200 col-span-2"
                        />
                        <Input
                          placeholder="State"
                          value={donor.state}
                          onChange={(e) =>
                            setDonor({ ...donor, state: e.target.value })
                          }
                          className="h-11 bg-white border-stone-200"
                        />
                      </div>
                      <Input
                        placeholder="ZIP / Postal code"
                        value={donor.zipCode}
                        onChange={(e) =>
                          setDonor({ ...donor, zipCode: e.target.value })
                        }
                        className="h-11 bg-white border-stone-200 max-w-[200px]"
                      />
                    </div>
                  )}

                  <label className="flex items-start gap-2.5 mt-4 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={anonymous}
                      onChange={(e) => setAnonymous(e.target.checked)}
                      className="accent-[#7a0012] mt-0.5 w-4 h-4"
                    />
                    <span className="text-sm text-stone-600 group-hover:text-stone-800 transition-colors">
                      Make this donation anonymous in any public donor listings
                    </span>
                  </label>
                </Section>

                {errorMsg && (
                  <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-800 flex items-start gap-2.5 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300">
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting || effectiveAmount < 500}
                  className="w-full h-14 rounded-xl bg-[#7a0012] hover:bg-[#5e000d] text-white text-base font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center justify-center gap-2 group"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading…
                    </>
                  ) : (
                    <>
                      Continue to payment
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>

                <p className="text-[11px] text-stone-500 text-center">
                  You&apos;ll review and complete payment on the next step.
                </p>
              </form>

              {/* ===== Sticky summary (desktop) ===== */}
              <aside className="hidden lg:block lg:sticky lg:top-8 space-y-4">
                <SummaryCard
                  amount={effectiveAmount}
                  frequency={frequency}
                  purpose={PURPOSE_LABEL[purpose] ?? purpose}
                  inHonorOf={inHonorOf}
                  ein={school.ein}
                />
                <TrustCard />
              </aside>
            </div>

            {/* Mobile trust signals */}
            <div className="lg:hidden mt-10">
              <TrustCard />
            </div>
          </main>

          {/* ===== Footer ===== */}
          <Footer school={school} />
        </>
      )}
    </div>
  );
}

function Section({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-stone-200 p-5 sm:p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-7 h-7 rounded-full bg-[#7a0012]/10 text-[#7a0012] flex items-center justify-center text-xs font-bold tabular-nums">
          {number}
        </div>
        <h2
          className="text-base sm:text-lg font-semibold tracking-tight"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}

function FrequencyButton({
  active,
  onClick,
  title,
  sub,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  sub: string;
  badge?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative rounded-xl border-2 px-4 py-3.5 text-left transition-all ${
        active
          ? "border-[#7a0012] bg-[#7a0012]/[0.03]"
          : "border-stone-200 bg-white hover:border-stone-300"
      }`}
    >
      {badge && (
        <span className="absolute -top-2 right-2 bg-[#7a0012] text-white text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
      <div className="flex items-center justify-between mb-1">
        <span className="font-semibold text-sm">{title}</span>
        {active && <CheckCircle2 className="h-4 w-4 text-[#7a0012]" />}
      </div>
      <p className="text-xs text-stone-500 leading-snug">{sub}</p>
    </button>
  );
}

function SummaryCard({
  amount,
  frequency,
  purpose,
  inHonorOf,
  ein,
}: {
  amount: number;
  frequency: "ONE_TIME" | "MONTHLY";
  purpose: string;
  inHonorOf: string;
  ein: string;
}) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white shadow-sm overflow-hidden">
      <div className="bg-[#7a0012] text-white px-5 py-3.5">
        <div className="flex items-center gap-2">
          <Heart className="h-4 w-4" />
          <span className="font-semibold text-sm tracking-wide">Your gift</span>
        </div>
      </div>
      <div className="p-5 space-y-3">
        <div>
          <div className="flex items-baseline justify-between gap-2">
            <span
              className="text-3xl font-bold tabular-nums tracking-tight"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              {amount > 0 ? fmtMoney(amount) : "$0"}
            </span>
            {frequency === "MONTHLY" && (
              <span className="text-stone-500 text-sm">/ month</span>
            )}
          </div>
          {frequency === "MONTHLY" && (
            <p className="text-[11px] text-stone-500 mt-1">
              Recurring monthly · cancel anytime
            </p>
          )}
        </div>

        <hr className="border-stone-100" />

        <Row label="Designation" value={purpose} />
        {inHonorOf && (
          <Row label="In honor of" value={inHonorOf} truncate />
        )}

        <hr className="border-stone-100" />

        <div className="flex items-start gap-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-md p-3">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400 mt-0.5 shrink-0" />
          <div className="text-[11px] text-emerald-900 dark:text-emerald-200 leading-relaxed">
            <strong>Tax-deductible.</strong> 501(c)(3) · EIN {ein}.
            You&apos;ll get a receipt instantly by email.
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  truncate,
}: {
  label: string;
  value: string;
  truncate?: boolean;
}) {
  return (
    <div className="flex justify-between gap-3 text-sm">
      <span className="text-stone-500">{label}</span>
      <span className={`font-medium text-right ${truncate ? "max-w-[180px] truncate" : ""}`}>
        {value}
      </span>
    </div>
  );
}

function TrustCard() {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5 space-y-3 shadow-sm">
      <TrustRow
        icon={<Lock className="h-3.5 w-3.5" />}
        text="Secured by Stripe · 256-bit SSL encryption"
      />
      <TrustRow
        icon={<ShieldCheck className="h-3.5 w-3.5" />}
        text="No card data stored on our servers"
      />
      <TrustRow
        icon={<CheckCircle2 className="h-3.5 w-3.5" />}
        text="Receipt emailed instantly · IRS-compliant"
      />
    </div>
  );
}

function TrustRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2.5 text-xs text-stone-600">
      <span className="text-emerald-700">{icon}</span>
      <span>{text}</span>
    </div>
  );
}

function PaymentForm({
  amount,
  frequency,
  purpose,
  inHonorOf,
  mode,
  onSuccess,
}: {
  amount: number;
  frequency: "ONE_TIME" | "MONTHLY";
  purpose: string;
  inHonorOf: string;
  mode: "payment" | "setup";
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
      className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden"
    >
      <div className="bg-stone-50 px-6 py-5 border-b border-stone-200">
        <p className="text-[11px] uppercase tracking-wider text-stone-500 font-medium">
          {frequency === "MONTHLY" ? "Monthly recurring donation" : "One-time donation"}
        </p>
        <div className="flex items-baseline gap-2 mt-1">
          <span
            className="text-4xl font-bold tabular-nums tracking-tight"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            {fmtMoney(amount)}
          </span>
          {frequency === "MONTHLY" && (
            <span className="text-stone-500 text-base">/ month</span>
          )}
        </div>
        <div className="mt-2 text-xs text-stone-600 space-y-0.5">
          <div>
            <span className="text-stone-500">For:</span>{" "}
            {PURPOSE_LABEL[purpose] ?? purpose}
          </div>
          {inHonorOf && (
            <div>
              <span className="text-stone-500">In honor of:</span> {inHonorOf}
            </div>
          )}
        </div>
      </div>

      <div className="p-6">
        <PaymentElement
          options={{
            layout: "tabs",
            wallets: { applePay: "auto", googlePay: "auto" },
          }}
        />

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800 flex items-start gap-2 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={!stripe || processing}
          className="w-full mt-5 h-14 rounded-xl bg-[#7a0012] hover:bg-[#5e000d] text-white text-base font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center justify-center gap-2"
        >
          {processing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Processing…
            </>
          ) : (
            <>
              <Lock className="h-4 w-4" />
              Donate {fmtMoney(amount)}
              {frequency === "MONTHLY" ? " / month" : ""}
            </>
          )}
        </button>

        <p className="text-[11px] text-stone-500 text-center mt-3">
          By donating you agree to our{" "}
          <a href="/terms" className="underline hover:text-stone-700">terms</a>{" "}
          and{" "}
          <a href="/privacy" className="underline hover:text-stone-700">privacy policy</a>.
        </p>
      </div>
    </form>
  );
}

function SuccessPanel({
  donor,
  amount,
  frequency,
  purpose,
  school,
}: {
  donor: { firstName: string; lastName: string; email: string };
  amount: number;
  frequency: "ONE_TIME" | "MONTHLY";
  purpose: string;
  school: SchoolInfo;
}) {
  return (
    <div className="text-center space-y-7">
      <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
        <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
      </div>
      <div>
        <h1
          className="text-3xl sm:text-4xl font-bold tracking-tight"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          Thank you, {donor.firstName}.
        </h1>
        <p className="text-stone-600 mt-3 leading-relaxed max-w-md mx-auto">
          Your{" "}
          <strong>
            {frequency === "MONTHLY" ? "monthly " : ""}
            {fmtMoney(amount)}
          </strong>{" "}
          gift to <strong>{PURPOSE_LABEL[purpose] ?? purpose}</strong> has been received.
          A receipt is on its way to <strong>{donor.email}</strong>.
        </p>
      </div>

      <div className="rounded-xl border border-stone-200 bg-white p-6 max-w-md mx-auto text-left shadow-sm">
        <p className="text-xs uppercase tracking-wider text-stone-500 font-medium mb-2">
          What happens next
        </p>
        <ul className="space-y-2 text-sm text-stone-700">
          <li className="flex gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
            <span>Your tax-deductible receipt will arrive within a minute.</span>
          </li>
          {frequency === "MONTHLY" && (
            <li className="flex gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
              <span>You&apos;ll get a receipt for each monthly charge automatically.</span>
            </li>
          )}
          <li className="flex gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
            <span>Questions? Email <a href={`mailto:${school.email}`} className="underline">{school.email}</a></span>
          </li>
        </ul>
      </div>

      <div className="pt-2 text-xs text-stone-500">
        <p>
          {school.legalName} · 501(c)(3) · EIN {school.ein}
        </p>
      </div>
    </div>
  );
}

function Footer({ school }: { school: SchoolInfo }) {
  return (
    <footer className="border-t border-stone-200 bg-white mt-12">
      <div className="max-w-6xl mx-auto px-5 py-10 text-center space-y-3">
        <p className="text-sm text-stone-700 leading-relaxed max-w-xl mx-auto">
          <strong>{school.legalName}</strong> is a 501(c)(3) nonprofit organization.{" "}
          <strong>EIN: {school.ein}</strong>. Your donation is tax-deductible to the
          fullest extent allowed by law.
        </p>
        <p className="text-xs text-stone-500">
          {school.address} · {school.phone} ·{" "}
          <a
            href={`mailto:${school.email}`}
            className="underline underline-offset-2 hover:text-stone-700"
          >
            {school.email}
          </a>
        </p>
      </div>
    </footer>
  );
}
