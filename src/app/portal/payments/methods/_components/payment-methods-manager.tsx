"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  deletePaymentMethod,
  setDefaultPaymentMethod,
} from "@/server/actions/auto-pay.actions";
import { useRouter } from "next/navigation";
import { AddCardStripe } from "./add-card-stripe";

export interface MethodRow {
  id: string;
  type: "CREDIT_CARD" | "BANK_ACCOUNT";
  last4: string;
  brand: string | null;
  bankName: string | null;
  accountNickname: string | null;
  expiryMonth: number | null;
  expiryYear: number | null;
  isDefault: boolean;
}

export function PaymentMethodsManager({
  initialMethods,
}: {
  initialMethods: MethodRow[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const refresh = () => router.refresh();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <AddCardStripe onAdded={refresh} />
      </div>

      {initialMethods.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          No payment methods yet. Add a card to enable auto-pay for tuition.
        </div>
      ) : (
        <div className="grid gap-3">
          {initialMethods.map((m) => (
            <div
              key={m.id}
              className="rounded-xl border bg-card p-4 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <CreditCard className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-medium flex items-center gap-2">
                    {m.type === "CREDIT_CARD"
                      ? `${m.brand ?? "Card"} •••• ${m.last4}`
                      : `${m.bankName ?? "Bank"} •••• ${m.last4}`}
                    {m.isDefault && (
                      <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-transparent text-[10px]">
                        DEFAULT
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {m.type === "CREDIT_CARD"
                      ? m.expiryMonth && m.expiryYear
                        ? `Expires ${String(m.expiryMonth).padStart(2, "0")}/${m.expiryYear}`
                        : "Credit card"
                      : m.accountNickname ?? "Bank account"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!m.isDefault && (
                  <Button
                    size="xs"
                    variant="outline"
                    disabled={pending}
                    onClick={() =>
                      startTransition(async () => {
                        const r = await setDefaultPaymentMethod(m.id);
                        if ("error" in r) toast.error(r.error);
                        else {
                          toast.success("Default updated.");
                          refresh();
                        }
                      })
                    }
                  >
                    <Star className="h-3 w-3" /> Set Default
                  </Button>
                )}
                <RemoveDialog
                  id={m.id}
                  label={`${m.type === "CREDIT_CARD" ? m.brand ?? "Card" : m.bankName ?? "Bank"} •••• ${m.last4}`}
                  onRemoved={refresh}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Card payments incur a 3% processing fee. Apple Pay supported on iPhone Safari.
      </p>
    </div>
  );
}

function RemoveDialog({
  id,
  label,
  onRemoved,
}: {
  id: string;
  label: string;
  onRemoved: () => void;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button size="xs" variant="ghost" className="text-destructive" />
        }
      >
        <Trash2 className="h-3 w-3" />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove {label}?</AlertDialogTitle>
          <AlertDialogDescription>
            This payment method will no longer be available for tuition
            payments. If it&apos;s your auto-pay method, auto-pay will be
            disabled until you set another.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={pending}
            onClick={(e) => {
              e.preventDefault();
              startTransition(async () => {
                const r = await deletePaymentMethod(id);
                if ("error" in r) toast.error(r.error);
                else {
                  toast.success("Removed.");
                  onRemoved();
                }
              });
            }}
          >
            {pending ? "Removing..." : "Remove"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
