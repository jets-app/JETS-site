"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  CheckCircle2,
  CreditCard,
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

/**
 * Autopay is required while enrolled. Parents can:
 *   - Switch which saved card funds autopay
 *   - Add a new card (and switch to it)
 * They cannot turn autopay off.
 */
export function AutoPayManager({
  currentMethodId,
  methods,
}: {
  /** Kept for backwards compat — the prop is ignored, autopay is always ON. */
  enabled?: boolean;
  currentMethodId: string | null;
  methods: MethodLite[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [methodId, setMethodId] = useState<string>(
    currentMethodId ??
      methods.find((m) => m.isDefault)?.id ??
      methods[0]?.id ??
      "",
  );

  const refresh = () => router.refresh();

  const updateMethod = (id: string | null) => {
    if (!id) return;
    setMethodId(id);
    startTransition(async () => {
      const r = await updateAutoPaySettings(true, id);
      if ("error" in r) toast.error(r.error);
      else {
        toast.success("Auto-pay payment method updated.");
        refresh();
      }
    });
  };

  const noMethod = methods.length === 0;

  return (
    <div className="space-y-6">
      {/* Status banner — always ON. If no card on file yet, show a setup nudge. */}
      <div
        className={`rounded-xl border p-5 ${
          noMethod
            ? "bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800"
            : "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800"
        }`}
      >
        <div className="flex items-start gap-3">
          {noMethod ? (
            <Zap className="h-6 w-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <div className="font-semibold text-base">
              {noMethod
                ? "Set up auto-pay to enroll"
                : "Auto-pay is active"}
            </div>
            <p
              className={`text-sm mt-1 ${
                noMethod
                  ? "text-amber-800 dark:text-amber-300"
                  : "text-emerald-800 dark:text-emerald-300"
              }`}
            >
              {noMethod
                ? "Add a card below — JETS School requires auto-pay for enrolled students. We'll charge tuition on each invoice's due date."
                : "We'll automatically pay tuition invoices on the due date — no late fees, no missed payments. You can switch which card funds it any time."}
            </p>
          </div>
        </div>
      </div>

      {/* Payment method selector */}
      <div className="rounded-xl border bg-card p-5">
        <div className="font-semibold mb-1">Auto-pay payment method</div>
        <p className="text-xs text-muted-foreground mb-4">
          We&apos;ll charge this card when each tuition invoice is due. Add another card and switch over any time — the old card stays on file until you remove it.
        </p>
        {noMethod ? (
          <div className="text-sm text-muted-foreground py-4 text-center border border-dashed rounded-lg">
            No saved payment methods.
            <div className="mt-2">
              <LinkButton href="/portal/payments/methods" size="sm">
                Add a Card
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
              <LinkButton
                href="/portal/payments/methods"
                variant="ghost"
                size="xs"
              >
                Manage saved cards
              </LinkButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
