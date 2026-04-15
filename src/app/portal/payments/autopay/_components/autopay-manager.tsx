"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  CreditCard,
  ShieldOff,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { updateAutoPaySettings } from "@/server/actions/auto-pay.actions";
import { useRouter } from "next/navigation";
import { LinkButton } from "@/components/shared/link-button";

interface MethodLite {
  id: string;
  type: "CREDIT_CARD" | "BANK_ACCOUNT";
  last4: string;
  brand: string | null;
  bankName: string | null;
  isDefault: boolean;
}

export function AutoPayManager({
  enabled,
  currentMethodId,
  methods,
}: {
  enabled: boolean;
  currentMethodId: string | null;
  methods: MethodLite[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [methodId, setMethodId] = useState<string>(
    currentMethodId ?? methods.find((m) => m.isDefault)?.id ?? methods[0]?.id ?? ""
  );

  const refresh = () => router.refresh();

  const turnOn = () =>
    startTransition(async () => {
      const r = await updateAutoPaySettings(true, methodId || null);
      if ("error" in r) toast.error(r.error);
      else {
        toast.success("Auto-pay turned ON.");
        refresh();
      }
    });

  const updateMethod = (id: string | null) => {
    if (!id) return;
    setMethodId(id);
    startTransition(async () => {
      const r = await updateAutoPaySettings(enabled, id);
      if ("error" in r) toast.error(r.error);
      else {
        toast.success("Auto-pay payment method updated.");
        refresh();
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Status banner */}
      <div
        className={`rounded-xl border p-5 ${
          enabled
            ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800"
            : "bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800"
        }`}
      >
        <div className="flex items-start gap-3">
          {enabled ? (
            <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <div className="font-semibold text-base">
              {enabled ? "Auto-Pay is ON" : "Auto-Pay is OFF"}
            </div>
            <p
              className={`text-sm mt-1 ${
                enabled
                  ? "text-emerald-800 dark:text-emerald-300"
                  : "text-amber-800 dark:text-amber-300"
              }`}
            >
              {enabled
                ? "We'll automatically pay tuition invoices on the due date — no late fees, no missed payments."
                : "You're paying manually. Each invoice will need to be paid on time to avoid late fees."}
            </p>
          </div>
          {!enabled && (
            <Button onClick={turnOn} disabled={pending || !methodId}>
              <Zap className="h-3.5 w-3.5" /> Turn On Auto-Pay
            </Button>
          )}
        </div>
      </div>

      {/* Payment method selector */}
      <div className="rounded-xl border bg-card p-5">
        <div className="font-semibold mb-1">Payment Method</div>
        <p className="text-xs text-muted-foreground mb-4">
          Auto-pay charges to this saved method on the due date.
        </p>
        {methods.length === 0 ? (
          <div className="text-sm text-muted-foreground py-4 text-center border border-dashed rounded-lg">
            No saved payment methods.
            <div className="mt-2">
              <LinkButton href="/portal/payments/methods" size="sm">
                Add a Payment Method
              </LinkButton>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <Select value={methodId} onValueChange={updateMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a payment method" />
              </SelectTrigger>
              <SelectContent>
                {methods.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    <span className="inline-flex items-center gap-2">
                      {m.type === "CREDIT_CARD" ? (
                        <CreditCard className="h-3.5 w-3.5" />
                      ) : (
                        <Building2 className="h-3.5 w-3.5" />
                      )}
                      {m.type === "CREDIT_CARD"
                        ? `${m.brand ?? "Card"} •••• ${m.last4}`
                        : `${m.bankName ?? "Bank"} •••• ${m.last4}`}
                      {m.type === "BANK_ACCOUNT" && (
                        <Badge variant="outline" className="text-[10px]">
                          $0.50 fee
                        </Badge>
                      )}
                      {m.type === "CREDIT_CARD" && (
                        <Badge variant="outline" className="text-[10px]">
                          3% fee
                        </Badge>
                      )}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="text-right">
              <LinkButton href="/portal/payments/methods" variant="ghost" size="xs">
                Manage Payment Methods
              </LinkButton>
            </div>
          </div>
        )}
      </div>

      {/* Turn off (3-step) */}
      {enabled && <TurnOffDialog onDone={refresh} />}
    </div>
  );
}

function TurnOffDialog({ onDone }: { onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [confirmText, setConfirmText] = useState("");
  const [pending, startTransition] = useTransition();

  const close = () => {
    setOpen(false);
    setTimeout(() => {
      setStep(1);
      setConfirmText("");
    }, 200);
  };

  const finish = () => {
    if (confirmText.trim().toUpperCase() !== "DISABLE") {
      toast.error("You must type DISABLE to confirm.");
      return;
    }
    startTransition(async () => {
      const r = await updateAutoPaySettings(false);
      if ("error" in r) {
        toast.error(r.error);
      } else {
        toast.success("Auto-pay is now OFF.");
        close();
        onDone();
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : close())}>
      <Button
        variant="ghost"
        className="text-destructive"
        onClick={() => setOpen(true)}
      >
        <ShieldOff className="h-3.5 w-3.5" /> Turn Off Auto-Pay
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {step === 1
              ? "Are you sure?"
              : step === 2
                ? "One more thing..."
                : "Final confirmation"}
          </DialogTitle>
          <DialogDescription>
            {step === 1
              ? "If you turn off auto-pay, you'll need to pay every invoice manually before its due date."
              : step === 2
                ? "Missing a payment may result in late fees and could risk your enrollment status. Do you want to continue?"
                : "Type DISABLE below to permanently turn off auto-pay."}
          </DialogDescription>
        </DialogHeader>

        {step === 3 && (
          <div className="space-y-2">
            <Label>Type DISABLE to confirm</Label>
            <Input
              autoFocus
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DISABLE"
            />
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={close} disabled={pending}>
            Keep Auto-Pay On
          </Button>
          {step === 1 && (
            <Button variant="destructive" onClick={() => setStep(2)}>
              Continue
            </Button>
          )}
          {step === 2 && (
            <Button variant="destructive" onClick={() => setStep(3)}>
              Yes, Continue
            </Button>
          )}
          {step === 3 && (
            <Button
              variant="destructive"
              onClick={finish}
              disabled={pending || confirmText.trim().toUpperCase() !== "DISABLE"}
            >
              {pending ? "Disabling..." : "Disable Auto-Pay"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
