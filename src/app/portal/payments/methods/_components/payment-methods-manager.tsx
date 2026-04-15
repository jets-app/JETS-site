"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Building2, CreditCard, Plus, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  addPaymentMethod,
  deletePaymentMethod,
  setDefaultPaymentMethod,
} from "@/server/actions/auto-pay.actions";
import { useRouter } from "next/navigation";

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
        <AddCardDialog onAdded={refresh} />
        <AddBankDialog onAdded={refresh} />
      </div>

      {initialMethods.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          No payment methods yet. Add a card or bank account to get started.
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
                  {m.type === "CREDIT_CARD" ? (
                    <CreditCard className="h-4 w-4" />
                  ) : (
                    <Building2 className="h-4 w-4" />
                  )}
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
                <RemoveDialog id={m.id} label={`${m.type === "CREDIT_CARD" ? m.brand ?? "Card" : m.bankName ?? "Bank"} •••• ${m.last4}`} onRemoved={refresh} />
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Test mode — no real charges occur. Card payments incur a 3% processing
        fee. ACH bank transfers are $0.50 flat.
      </p>
    </div>
  );
}

function AddCardDialog({ onAdded }: { onAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant="default" />}>
        <Plus className="h-3.5 w-3.5" /> Add Credit Card
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Credit Card</DialogTitle>
          <DialogDescription>
            3% processing fee will be added at payment.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const data = {
              type: "CREDIT_CARD" as const,
              cardNumber: String(fd.get("cardNumber") ?? ""),
              brand: String(fd.get("brand") ?? "Visa"),
              expiryMonth: Number(fd.get("expiryMonth") ?? 0) || undefined,
              expiryYear: Number(fd.get("expiryYear") ?? 0) || undefined,
            };
            startTransition(async () => {
              const r = await addPaymentMethod(data);
              if ("error" in r) toast.error(r.error);
              else {
                toast.success("Card added.");
                setOpen(false);
                onAdded();
              }
            });
          }}
          className="space-y-3"
        >
          <div>
            <Label>Cardholder Name</Label>
            <Input name="name" placeholder="Jane Doe" required />
          </div>
          <div>
            <Label>Card Number</Label>
            <Input
              name="cardNumber"
              placeholder="4242 4242 4242 4242"
              required
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label>Brand</Label>
              <Input name="brand" placeholder="Visa" defaultValue="Visa" />
            </div>
            <div>
              <Label>Exp Month</Label>
              <Input name="expiryMonth" placeholder="12" />
            </div>
            <div>
              <Label>Exp Year</Label>
              <Input name="expiryYear" placeholder="2028" />
            </div>
          </div>
          <div>
            <Label>CVV</Label>
            <Input name="cvv" placeholder="123" />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : "Save Card"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddBankDialog({ onAdded }: { onAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant="outline" />}>
        <Plus className="h-3.5 w-3.5" /> Add Bank Account
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Bank Account (ACH)</DialogTitle>
          <DialogDescription>
            $0.50 flat fee per ACH bank transfer.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const data = {
              type: "BANK_ACCOUNT" as const,
              routingNumber: String(fd.get("routingNumber") ?? ""),
              accountNumber: String(fd.get("accountNumber") ?? ""),
              bankName: String(fd.get("bankName") ?? ""),
              accountNickname: String(fd.get("nickname") ?? ""),
            };
            startTransition(async () => {
              const r = await addPaymentMethod(data);
              if ("error" in r) toast.error(r.error);
              else {
                toast.success("Bank account added.");
                setOpen(false);
                onAdded();
              }
            });
          }}
          className="space-y-3"
        >
          <div>
            <Label>Bank Name</Label>
            <Input name="bankName" placeholder="Chase" required />
          </div>
          <div>
            <Label>Account Nickname</Label>
            <Input name="nickname" placeholder="Chase Checking" />
          </div>
          <div>
            <Label>Routing Number</Label>
            <Input name="routingNumber" placeholder="021000021" required />
          </div>
          <div>
            <Label>Account Number</Label>
            <Input name="accountNumber" placeholder="000123456789" required />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : "Save Bank Account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
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
