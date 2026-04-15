"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Zap } from "lucide-react";
import { toast } from "sonner";
import { chargeInvoice } from "@/server/actions/auto-pay.actions";
import { useRouter } from "next/navigation";

interface InvoiceLite {
  id: string;
  invoiceNumber: string;
  total: number;
  amountPaid: number;
}
interface MethodLite {
  id: string;
  type: "CREDIT_CARD" | "BANK_ACCOUNT";
  last4: string;
  brand: string | null;
  bankName: string | null;
}

export function AdminChargeInvoice({
  invoices,
  methods,
}: {
  invoices: InvoiceLite[];
  methods: MethodLite[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [invoiceId, setInvoiceId] = useState<string>(invoices[0]?.id ?? "");
  const [methodId, setMethodId] = useState<string>(methods[0]?.id ?? "");

  const submit = () => {
    if (!invoiceId || !methodId) {
      toast.error("Pick an invoice and a payment method.");
      return;
    }
    startTransition(async () => {
      const r = await chargeInvoice(invoiceId, methodId);
      if ("error" in r) toast.error(r.error);
      else {
        toast.success(r.message ?? "Charged.");
        setOpen(false);
        router.refresh();
      }
    });
  };

  const disabled = invoices.length === 0 || methods.length === 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm" variant="outline" disabled={disabled} />
        }
      >
        <Zap className="h-3.5 w-3.5" /> Charge Invoice Manually
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Charge an Invoice</DialogTitle>
          <DialogDescription>
            Run a payment against the parent&apos;s saved payment method.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-1 block">Invoice</label>
            <Select value={invoiceId} onValueChange={(v) => setInvoiceId(v ?? "")}>
              <SelectTrigger><SelectValue placeholder="Select invoice" /></SelectTrigger>
              <SelectContent>
                {invoices.map((i) => (
                  <SelectItem key={i.id} value={i.id}>
                    {i.invoiceNumber} — ${((i.total - i.amountPaid) / 100).toFixed(2)} due
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Payment Method</label>
            <Select value={methodId} onValueChange={(v) => setMethodId(v ?? "")}>
              <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
              <SelectContent>
                {methods.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.type === "CREDIT_CARD"
                      ? `${m.brand ?? "Card"} •••• ${m.last4} (3% fee)`
                      : `${m.bankName ?? "Bank"} •••• ${m.last4} ($0.50 fee)`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button onClick={submit} disabled={pending}>
            {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Charge
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
