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
  DialogClose,
} from "@/components/ui/dialog";
import {
  CreditCard,
  Landmark,
  Plus,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { savePaymentMethod } from "@/server/actions/tuition-payment.actions";

export interface PaymentMethod {
  type: "card" | "bank";
  last4: string;
  label: string;
  name?: string;
  expiry?: string;
  routing?: string;
}

export function PaymentMethods({
  onMethodsChange,
}: {
  onMethodsChange?: (methods: PaymentMethod[]) => void;
}) {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);

  function handleAdd(m: PaymentMethod) {
    const next = [...methods, m];
    setMethods(next);
    onMethodsChange?.(next);
  }

  function handleRemove(idx: number) {
    const next = methods.filter((_, i) => i !== idx);
    setMethods(next);
    onMethodsChange?.(next);
  }

  return (
    <div className="space-y-4">
      {methods.length === 0 ? (
        <div className="rounded-lg border border-dashed bg-muted/20 p-6 text-center">
          <CreditCard className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-60" />
          <p className="text-sm text-muted-foreground">
            No saved payment methods yet.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Add a card or bank account to enable quick tuition payments.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {methods.map((m, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-3 rounded-lg border p-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  {m.type === "card" ? (
                    <CreditCard className="h-4 w-4 text-primary" />
                  ) : (
                    <Landmark className="h-4 w-4 text-primary" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">{m.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {m.name} {m.expiry ? `· Exp ${m.expiry}` : ""} · Test mode
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => handleRemove(idx)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <AddCardDialog onAdded={handleAdd} />
        <AddBankDialog onAdded={handleAdd} />
      </div>
    </div>
  );
}

function AddCardDialog({
  onAdded,
}: {
  onAdded: (method: PaymentMethod) => void;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    cardNumber: "",
    name: "",
    expiry: "",
    cvv: "",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const result = await savePaymentMethod("card", {
        cardNumber: form.cardNumber,
        name: form.name,
        expiry: form.expiry,
      });
      if ("error" in result && result.error) {
        setMessage(result.error);
      } else if ("success" in result && result.method) {
        onAdded(result.method as PaymentMethod);
        setForm({ cardNumber: "", name: "", expiry: "", cvv: "" });
        setMessage(result.message ?? "Card added.");
        setTimeout(() => setOpen(false), 900);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add Credit Card
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Credit Card</DialogTitle>
          <DialogDescription>
            Test mode — details are masked and no real card is stored.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="cardNumber">Card Number</Label>
            <Input
              id="cardNumber"
              placeholder="4242 4242 4242 4242"
              value={form.cardNumber}
              onChange={(e) =>
                setForm({ ...form, cardNumber: e.target.value })
              }
              required
              inputMode="numeric"
              maxLength={23}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="name">Cardholder Name</Label>
            <Input
              id="name"
              placeholder="Jane Doe"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="expiry">Expiry</Label>
              <Input
                id="expiry"
                placeholder="MM/YY"
                value={form.expiry}
                onChange={(e) => setForm({ ...form, expiry: e.target.value })}
                required
                maxLength={5}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                placeholder="123"
                value={form.cvv}
                onChange={(e) => setForm({ ...form, cvv: e.target.value })}
                required
                maxLength={4}
                inputMode="numeric"
              />
            </div>
          </div>
          {message && (
            <div className="rounded-lg bg-muted p-2.5 text-sm flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{message}</span>
            </div>
          )}
          <DialogFooter>
            <DialogClose render={<Button variant="outline" type="button" />}>
              Cancel
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Card"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddBankDialog({
  onAdded,
}: {
  onAdded: (method: PaymentMethod) => void;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    routingNumber: "",
    accountNumber: "",
    name: "",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const result = await savePaymentMethod("bank", {
        routingNumber: form.routingNumber,
        accountNumber: form.accountNumber,
        name: form.name,
      });
      if ("error" in result && result.error) {
        setMessage(result.error);
      } else if ("success" in result && result.method) {
        onAdded(result.method as PaymentMethod);
        setForm({ routingNumber: "", accountNumber: "", name: "" });
        setMessage(result.message ?? "Bank added.");
        setTimeout(() => setOpen(false), 900);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add Bank Account
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Bank Account</DialogTitle>
          <DialogDescription>
            Test mode — details are masked and no real account is stored.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="name">Account Holder Name</Label>
            <Input
              id="name"
              placeholder="Jane Doe"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="routingNumber">Routing Number</Label>
            <Input
              id="routingNumber"
              placeholder="110000000"
              value={form.routingNumber}
              onChange={(e) =>
                setForm({ ...form, routingNumber: e.target.value })
              }
              required
              inputMode="numeric"
              maxLength={9}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="accountNumber">Account Number</Label>
            <Input
              id="accountNumber"
              placeholder="000123456789"
              value={form.accountNumber}
              onChange={(e) =>
                setForm({ ...form, accountNumber: e.target.value })
              }
              required
              inputMode="numeric"
            />
          </div>
          {message && (
            <div className="rounded-lg bg-muted p-2.5 text-sm flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{message}</span>
            </div>
          )}
          <DialogFooter>
            <DialogClose render={<Button variant="outline" type="button" />}>
              Cancel
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Bank Account"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
