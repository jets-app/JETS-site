/**
 * Pure helpers for computing JETS' tuition payment schedule. No DB access.
 *
 * The standard tuition is $39,500 paid in 10 equal slices of 10%:
 *   - 1 deposit at contract signing
 *   - 9 monthly installments due Sept 1, Oct 1, ... May 1
 *
 * Two alternate plans collapse the schedule:
 *   - ONE_SHOT_NOW     → 1 invoice for 100% due immediately
 *   - ONE_SHOT_DEFERRED → 10% deposit now + remaining 90% due Sept 1
 *
 * For mid-year starts the schedule keeps the same total but compresses the
 * installments into the months remaining (admin sets installmentCount).
 */

export type PaymentPlan =
  | "MONTHLY_10"
  | "ONE_SHOT_NOW"
  | "ONE_SHOT_DEFERRED";

export interface TuitionInputs {
  /** Base tuition before any scholarship, in cents. */
  totalCents: number;
  /** Scholarship discount, in cents. */
  scholarshipCents: number;
  /** Optional override for deposit. Defaults to 10% of net. */
  depositCents?: number | null;
  /** Optional override for installment count. Defaults to 9. */
  installmentCount?: number | null;
}

export interface ScheduleLine {
  /** Human label for the line item / invoice description. */
  description: string;
  /** Amount due in cents. */
  amount: number;
  /** When this invoice is due. */
  dueDate: Date;
  /** Loose category tag — used by QBO sync later. */
  category: "tuition_deposit" | "tuition_installment" | "tuition_balance";
}

/** The effective amount due — base minus scholarship, never negative. */
export function netTuition(inputs: TuitionInputs): number {
  return Math.max(0, inputs.totalCents - inputs.scholarshipCents);
}

/** Default deposit is 10% of net, rounded to whole dollars. */
function defaultDeposit(net: number): number {
  return Math.round((net * 0.1) / 100) * 100;
}

/**
 * Returns the September 1 date for the upcoming or current academic year,
 * relative to a reference date. If we're already past Sept 1 of the current
 * year, this returns Sept 1 of *this* year (i.e., we're mid-year).
 */
function septemberFirstFor(now: Date): Date {
  const year = now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear();
  // If we're past Sept 1 the upcoming "Sept 1" already happened this year — we
  // still seed installments starting from the next month-end forward.
  return new Date(year, 8, 1);
}

/** First day of the next month at 00:00 local. */
function firstOfNextMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 1);
}

/**
 * Computes the schedule of invoices for a given plan + inputs, anchored to
 * the supplied "signed at" date.
 */
export function computeTuitionSchedule(
  plan: PaymentPlan,
  inputs: TuitionInputs,
  signedAt: Date = new Date(),
): ScheduleLine[] {
  const net = netTuition(inputs);
  if (net <= 0) return [];

  const deposit = inputs.depositCents ?? defaultDeposit(net);
  const installmentCount = inputs.installmentCount ?? 9;

  if (plan === "ONE_SHOT_NOW") {
    return [
      {
        description: "Tuition — paid in full",
        amount: net,
        dueDate: signedAt,
        category: "tuition_balance",
      },
    ];
  }

  if (plan === "ONE_SHOT_DEFERRED") {
    const sept1 = septemberFirstFor(signedAt);
    return [
      {
        description: "Tuition deposit (10%)",
        amount: deposit,
        dueDate: signedAt,
        category: "tuition_deposit",
      },
      {
        description: "Tuition balance — due September 1",
        amount: net - deposit,
        dueDate: sept1,
        category: "tuition_balance",
      },
    ];
  }

  // MONTHLY_10 — deposit now, then `installmentCount` monthly payments.
  const lines: ScheduleLine[] = [
    {
      description: "Tuition deposit (10%)",
      amount: deposit,
      dueDate: signedAt,
      category: "tuition_deposit",
    },
  ];

  const remaining = net - deposit;
  if (installmentCount <= 0 || remaining <= 0) return lines;

  // Installment 1 starts on the next Sept 1 if we're pre-Sept, else next-month
  // first-of-month.
  const sept1 = septemberFirstFor(signedAt);
  let cursor = signedAt < sept1 ? new Date(sept1) : firstOfNextMonth(signedAt);

  const baseAmt = Math.floor(remaining / installmentCount);
  const remainder = remaining - baseAmt * installmentCount;
  for (let i = 0; i < installmentCount; i++) {
    // Last installment absorbs the rounding remainder so the total matches net.
    const amt = i === installmentCount - 1 ? baseAmt + remainder : baseAmt;
    lines.push({
      description: `Tuition installment ${i + 1} of ${installmentCount}`,
      amount: amt,
      dueDate: new Date(cursor),
      category: "tuition_installment",
    });
    cursor = firstOfNextMonth(cursor);
  }

  return lines;
}

/** Tiny preview helper for UI — totals + payment count. */
export function previewSchedule(
  plan: PaymentPlan,
  inputs: TuitionInputs,
  signedAt: Date = new Date(),
): { count: number; first: ScheduleLine | null; total: number } {
  const lines = computeTuitionSchedule(plan, inputs, signedAt);
  const total = lines.reduce((s, l) => s + l.amount, 0);
  return {
    count: lines.length,
    first: lines[0] ?? null,
    total,
  };
}
