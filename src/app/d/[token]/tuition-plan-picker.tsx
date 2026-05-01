"use client";

import { useMemo } from "react";
import {
  CalendarDays,
  Coins,
  Wallet,
  CheckCircle2,
} from "lucide-react";
import {
  computeTuitionSchedule,
  netTuition,
  type PaymentPlan,
} from "@/lib/tuition-plan";

function fmt(c: number) {
  return `$${(c / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

function fmtDate(d: Date) {
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface Props {
  totalCents: number;
  scholarshipCents: number;
  depositCents: number | null;
  installmentCount: number | null;
  value: PaymentPlan | "";
  onChange: (value: PaymentPlan) => void;
}

const OPTIONS: Array<{
  plan: PaymentPlan;
  title: string;
  blurb: string;
  icon: typeof CalendarDays;
}> = [
  {
    plan: "MONTHLY_10",
    title: "10-month plan",
    blurb: "10% deposit today, then 9 monthly payments Sept 1 – May 1.",
    icon: CalendarDays,
  },
  {
    plan: "ONE_SHOT_NOW",
    title: "Pay in full today",
    blurb: "One payment for the full tuition right now.",
    icon: Wallet,
  },
  {
    plan: "ONE_SHOT_DEFERRED",
    title: "Deposit now, balance Sept 1",
    blurb: "10% deposit today, remaining 90% on September 1.",
    icon: Coins,
  },
];

export function TuitionPlanPicker({
  totalCents,
  scholarshipCents,
  depositCents,
  installmentCount,
  value,
  onChange,
}: Props) {
  const net = netTuition({ totalCents, scholarshipCents });

  const previews = useMemo(() => {
    return OPTIONS.map((o) => {
      const schedule = computeTuitionSchedule(
        o.plan,
        { totalCents, scholarshipCents, depositCents, installmentCount },
        new Date(),
      );
      return { plan: o.plan, schedule };
    });
  }, [totalCents, scholarshipCents, depositCents, installmentCount]);

  const previewMap = new Map(previews.map((p) => [p.plan, p.schedule]));

  return (
    <div className="space-y-4">
      {/* Tuition summary */}
      <div className="rounded-lg border bg-card p-4 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Tuition</span>
          <span className="tabular-nums">{fmt(totalCents)}</span>
        </div>
        {scholarshipCents > 0 && (
          <div className="flex justify-between mt-1 text-emerald-700 dark:text-emerald-400">
            <span>Scholarship discount</span>
            <span className="tabular-nums">−{fmt(scholarshipCents)}</span>
          </div>
        )}
        <div className="border-t mt-2 pt-2 flex justify-between font-semibold">
          <span>Amount due for the year</span>
          <span className="tabular-nums">{fmt(net)}</span>
        </div>
      </div>

      {/* Plan options */}
      <div className="space-y-3">
        {OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const selected = value === opt.plan;
          const schedule = previewMap.get(opt.plan) ?? [];
          const first = schedule[0];
          const rest = schedule.slice(1);

          return (
            <label
              key={opt.plan}
              className={`block rounded-xl border p-4 cursor-pointer transition-colors ${
                selected
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                  : "hover:border-foreground/20"
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="tuition-plan"
                  value={opt.plan}
                  checked={selected}
                  onChange={() => onChange(opt.plan)}
                  className="mt-1 accent-primary"
                />
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    selected
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold flex items-center gap-2">
                    {opt.title}
                    {selected && (
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {opt.blurb}
                  </p>

                  {first && (
                    <div className="mt-3 space-y-1.5 text-sm">
                      <div className="flex justify-between gap-2 px-3 py-1.5 rounded bg-foreground/5">
                        <span className="font-medium">{first.description}</span>
                        <span className="tabular-nums shrink-0">
                          {fmt(first.amount)} · today
                        </span>
                      </div>
                      {rest.length > 0 && rest.length <= 3 && (
                        <div className="space-y-1 px-1">
                          {rest.map((line, i) => (
                            <div
                              key={i}
                              className="flex justify-between gap-2 text-xs text-muted-foreground"
                            >
                              <span>{line.description}</span>
                              <span className="tabular-nums shrink-0">
                                {fmt(line.amount)} · {fmtDate(line.dueDate)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      {rest.length > 3 && (
                        <div className="px-1 text-xs text-muted-foreground">
                          + {rest.length} more payment
                          {rest.length === 1 ? "" : "s"} of{" "}
                          <span className="tabular-nums font-medium">
                            {fmt(rest[0].amount)}
                          </span>{" "}
                          (Sept 1 – May 1)
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
