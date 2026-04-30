"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  DollarSign,
  Ban,
  RotateCcw,
  MoreHorizontal,
  CreditCard,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  markInvoicePaidManually,
  voidInvoice,
  refundInvoice,
} from "@/server/actions/invoice-admin.actions";
import { processAutoPayForInvoice } from "@/server/actions/invoice-generation.actions";

interface Props {
  invoiceId: string;
  invoiceNumber: string;
  status: string;
  total: number;
  amountPaid: number;
  hasAutoPayMethod: boolean;
}

export function InvoiceActionsMenu({
  invoiceId,
  invoiceNumber,
  status,
  total,
  amountPaid,
  hasAutoPayMethod,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [openDialog, setOpenDialog] = useState<"manual" | "void" | "refund" | null>(null);

  const isPaid = status === "paid";
  const isVoidable = status === "unpaid" || status === "sent" || status === "failed" || status === "draft";
  const isChargeable =
    hasAutoPayMethod && (status === "unpaid" || status === "sent" || status === "failed");

  function refresh() {
    router.refresh();
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button size="xs" variant="ghost" />}>
          <MoreHorizontal className="h-3.5 w-3.5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {isChargeable && (
            <DropdownMenuItem
              onClick={() =>
                startTransition(async () => {
                  const r = await processAutoPayForInvoice(invoiceId);
                  if (r.error) toast.error(r.error);
                  else {
                    toast.success("Charge submitted via Stripe.");
                    refresh();
                  }
                })
              }
            >
              <CreditCard className="mr-2 h-3.5 w-3.5" />
              Charge saved card
            </DropdownMenuItem>
          )}
          {!isPaid && (
            <DropdownMenuItem onClick={() => setOpenDialog("manual")}>
              <DollarSign className="mr-2 h-3.5 w-3.5" />
              Mark paid (cash/check)
            </DropdownMenuItem>
          )}
          {isPaid && (
            <DropdownMenuItem onClick={() => setOpenDialog("refund")}>
              <RotateCcw className="mr-2 h-3.5 w-3.5" />
              Refund via Stripe
            </DropdownMenuItem>
          )}
          {isVoidable && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => setOpenDialog("void")}
              >
                <Ban className="mr-2 h-3.5 w-3.5" />
                Void invoice
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* MANUAL PAYMENT */}
      <Dialog open={openDialog === "manual"} onOpenChange={(o) => !o && setOpenDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Invoice {invoiceNumber} as Paid</DialogTitle>
            <DialogDescription>
              Use this for cash, check, or wire payments received outside the
              portal. A payment record is created so the audit trail stays
              clean.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const method = String(fd.get("method") ?? "check");
              const reference = String(fd.get("reference") ?? "").trim() || undefined;
              startTransition(async () => {
                const r = await markInvoicePaidManually({
                  invoiceId,
                  method: method as "cash" | "check" | "wire" | "other",
                  reference,
                });
                if (r.error) toast.error(r.error);
                else {
                  toast.success("Marked paid.");
                  setOpenDialog(null);
                  refresh();
                }
              });
            }}
            className="space-y-4"
          >
            <div className="grid gap-1.5">
              <Label>Payment method</Label>
              <select
                name="method"
                defaultValue="check"
                className="h-10 rounded-md border bg-background px-3 text-sm"
              >
                <option value="cash">Cash</option>
                <option value="check">Check</option>
                <option value="wire">Wire transfer</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="grid gap-1.5">
              <Label>Reference (optional)</Label>
              <Input
                name="reference"
                placeholder="Check #1234, wire ID, or a note"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Amount: ${((total - amountPaid) / 100).toFixed(2)}
            </p>
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Mark paid"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* VOID */}
      <Dialog open={openDialog === "void"} onOpenChange={(o) => !o && setOpenDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Void Invoice {invoiceNumber}?</DialogTitle>
            <DialogDescription>
              Voiding excludes this invoice from autopay and late fee
              processing. It does not refund any prior payments. If a parent
              has paid, use Refund instead.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const reason = String(fd.get("reason") ?? "").trim() || undefined;
              startTransition(async () => {
                const r = await voidInvoice({ invoiceId, reason });
                if (r.error) toast.error(r.error);
                else {
                  toast.success("Invoice voided.");
                  setOpenDialog(null);
                  refresh();
                }
              });
            }}
            className="space-y-4"
          >
            <div className="grid gap-1.5">
              <Label>Reason (optional)</Label>
              <Textarea
                name="reason"
                placeholder="e.g. Student withdrew, duplicate invoice, scholarship adjustment"
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button type="submit" variant="destructive" disabled={isPending}>
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Void invoice"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* REFUND */}
      <Dialog open={openDialog === "refund"} onOpenChange={(o) => !o && setOpenDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Refund Invoice {invoiceNumber}</DialogTitle>
            <DialogDescription>
              Refunds the parent&apos;s card via Stripe. Leave the amount blank
              to refund the full charge, or enter a partial amount in dollars.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const reason = String(fd.get("reason") ?? "").trim();
              const amountStr = String(fd.get("amount") ?? "").trim();
              if (!reason) {
                toast.error("Please provide a reason.");
                return;
              }
              const amountCents = amountStr
                ? Math.round(parseFloat(amountStr) * 100)
                : undefined;
              startTransition(async () => {
                const r = await refundInvoice({ invoiceId, reason, amountCents });
                if (r.error) toast.error(r.error);
                else {
                  toast.success(r.message ?? "Refund issued.");
                  setOpenDialog(null);
                  refresh();
                }
              });
            }}
            className="space-y-4"
          >
            <div className="grid gap-1.5">
              <Label>Reason (required)</Label>
              <Textarea
                name="reason"
                required
                placeholder="e.g. Withdrawal before April 1, scholarship adjustment, duplicate charge"
                rows={3}
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Amount in dollars (blank = full refund)</Label>
              <Input
                name="amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder={`Up to $${(total / 100).toFixed(2)}`}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Issue refund"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
