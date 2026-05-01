"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, AlertTriangle, CheckCircle2 } from "lucide-react";
import { setStudentTuition } from "@/server/actions/tuition-plan.actions";

function fmt(c: number) {
  return `$${(c / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

interface Props {
  applicationId: string;
  tuitionTotalCents: number;
  tuitionScholarshipCents: number;
  tuitionDepositCents: number | null;
  tuitionInstallmentCount: number | null;
  tuitionPaymentPlan: string | null;
  tuitionPlanLockedAt: string | null;
}

const PLAN_LABEL: Record<string, string> = {
  MONTHLY_10: "10-month plan",
  ONE_SHOT_NOW: "Pay in full",
  ONE_SHOT_DEFERRED: "Deposit + Sept 1 balance",
};

export function TuitionSettingsCard(props: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<
    { type: "success" | "warning" | "error"; text: string } | null
  >(null);

  const [total, setTotal] = useState((props.tuitionTotalCents / 100).toFixed(2));
  const [scholarship, setScholarship] = useState(
    (props.tuitionScholarshipCents / 100).toFixed(2),
  );
  const [deposit, setDeposit] = useState(
    props.tuitionDepositCents !== null
      ? (props.tuitionDepositCents / 100).toFixed(2)
      : "",
  );
  const [installments, setInstallments] = useState(
    props.tuitionInstallmentCount !== null
      ? String(props.tuitionInstallmentCount)
      : "",
  );

  const totalNum = Math.round(parseFloat(total || "0") * 100);
  const scholarshipNum = Math.round(parseFloat(scholarship || "0") * 100);
  const net = Math.max(0, totalNum - scholarshipNum);
  const computedDeposit = deposit
    ? Math.round(parseFloat(deposit) * 100)
    : Math.round((net * 0.1) / 100) * 100;
  const numInstallments = installments ? parseInt(installments, 10) : 9;

  const isLocked = !!props.tuitionPlanLockedAt;

  const save = () => {
    setMsg(null);
    startTransition(async () => {
      const r = await setStudentTuition({
        applicationId: props.applicationId,
        totalCents: totalNum,
        scholarshipCents: scholarshipNum,
        depositCents: deposit ? Math.round(parseFloat(deposit) * 100) : null,
        installmentCount: installments ? parseInt(installments, 10) : null,
      });
      if ("error" in r && r.error) {
        setMsg({ type: "error", text: r.error });
        return;
      }
      if ("requiresResign" in r && r.requiresResign) {
        setMsg({
          type: "warning",
          text: `Saved. ${r.invoicesVoided} unpaid invoice${r.invoicesVoided === 1 ? "" : "s"} voided. The parent must re-sign the tuition contract — send them a fresh one.`,
        });
      } else {
        setMsg({ type: "success", text: "Tuition pricing saved." });
      }
      router.refresh();
    });
  };

  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-primary" />
            Tuition Pricing
          </CardTitle>
          {isLocked ? (
            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-transparent text-xs">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Locked — {PLAN_LABEL[props.tuitionPaymentPlan ?? ""] ?? "Plan"}
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs">
              Unsigned
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs">Total tuition</Label>
            <Input
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              type="text"
              inputMode="decimal"
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs">Scholarship</Label>
            <Input
              value={scholarship}
              onChange={(e) => setScholarship(e.target.value)}
              type="text"
              inputMode="decimal"
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs">
              Deposit override <span className="text-muted-foreground">(default 10%)</span>
            </Label>
            <Input
              value={deposit}
              onChange={(e) => setDeposit(e.target.value)}
              placeholder={`Auto: ${fmt(Math.round((net * 0.1) / 100) * 100)}`}
              type="text"
              inputMode="decimal"
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs">
              Installment count <span className="text-muted-foreground">(default 9)</span>
            </Label>
            <Input
              value={installments}
              onChange={(e) => setInstallments(e.target.value)}
              placeholder="Auto: 9 (Sept-May)"
              type="number"
              min="1"
              max="12"
              className="mt-1"
            />
          </div>
        </div>

        {/* Calculated summary */}
        <div className="rounded-lg border bg-muted/30 p-3 text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Effective tuition (after scholarship)</span>
            <span className="font-semibold tabular-nums">{fmt(net)}</span>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Deposit (today, on signing)</span>
            <span className="tabular-nums">{fmt(computedDeposit)}</span>
          </div>
          {numInstallments > 0 && net - computedDeposit > 0 && (
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                {numInstallments} × monthly installment
                {numInstallments === 1 ? "" : "s"}
              </span>
              <span className="tabular-nums">
                ~{fmt(Math.floor((net - computedDeposit) / numInstallments))} each
              </span>
            </div>
          )}
        </div>

        {isLocked && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 p-3 text-xs flex items-start gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-700 dark:text-amber-400 mt-0.5 shrink-0" />
            <p className="text-amber-900 dark:text-amber-200">
              Tuition contract already signed. Saving any change here will void
              all unpaid invoices and require the parent to re-sign a new
              contract.
            </p>
          </div>
        )}

        {msg && (
          <div
            className={`rounded-lg p-3 text-sm ${
              msg.type === "success"
                ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300"
                : msg.type === "warning"
                  ? "bg-amber-50 text-amber-900 dark:bg-amber-900/20 dark:text-amber-200"
                  : "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300"
            }`}
          >
            {msg.text}
          </div>
        )}

        <div className="flex justify-end">
          <Button onClick={save} disabled={pending} size="sm">
            {pending ? "Saving…" : "Save Pricing"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
