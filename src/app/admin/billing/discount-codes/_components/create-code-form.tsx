"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus } from "lucide-react";
import { createDiscountCode } from "@/server/actions/discount-code.actions";

export function CreateDiscountCodeForm() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [discountType, setDiscountType] = useState<"amount" | "percent">("amount");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const code = fd.get("code")?.toString() ?? "";
    const description = fd.get("description")?.toString() ?? "";
    const maxUses = parseInt(fd.get("maxUses")?.toString() ?? "");
    const expiresAt = fd.get("expiresAt")?.toString() ?? "";

    if (!code) {
      setMessage({ text: "Code is required.", type: "error" });
      return;
    }

    let amountOff: number | undefined;
    let percentOff: number | undefined;

    if (discountType === "amount") {
      const val = parseFloat(fd.get("discountValue")?.toString() ?? "0");
      if (val <= 0) {
        setMessage({ text: "Enter a valid discount amount.", type: "error" });
        return;
      }
      amountOff = Math.round(val * 100); // to cents
    } else {
      const val = parseInt(fd.get("discountValue")?.toString() ?? "0");
      if (val <= 0 || val > 100) {
        setMessage({ text: "Enter a valid percentage (1-100).", type: "error" });
        return;
      }
      percentOff = val;
    }

    startTransition(async () => {
      const result = await createDiscountCode({
        code,
        description: description || undefined,
        amountOff,
        percentOff,
        maxUses: isNaN(maxUses) ? undefined : maxUses,
        expiresAt: expiresAt || undefined,
      });
      if (result.error) {
        setMessage({ text: result.error, type: "error" });
      } else {
        setMessage({ text: `Code "${result.code?.code}" created!`, type: "success" });
        (e.target as HTMLFormElement).reset();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-1.5">
          <Label>Code</Label>
          <Input
            name="code"
            placeholder="WELCOME50"
            className="uppercase"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Description (optional)</Label>
          <Input name="description" placeholder="Welcome discount" />
        </div>
        <div className="space-y-1.5">
          <Label>Discount Type</Label>
          <select
            value={discountType}
            onChange={(e) => setDiscountType(e.target.value as "amount" | "percent")}
            className="w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm h-8"
          >
            <option value="amount">Fixed Amount ($)</option>
            <option value="percent">Percentage (%)</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label>{discountType === "amount" ? "Amount Off ($)" : "Percent Off (%)"}</Label>
          <Input
            name="discountValue"
            type="number"
            step={discountType === "amount" ? "0.01" : "1"}
            placeholder={discountType === "amount" ? "50.00" : "10"}
            min="0"
            max={discountType === "percent" ? "100" : undefined}
          />
        </div>
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label>Max Uses (optional)</Label>
          <Input name="maxUses" type="number" placeholder="Unlimited" min="1" />
        </div>
        <div className="space-y-1.5">
          <Label>Expires (optional)</Label>
          <Input name="expiresAt" type="date" />
        </div>
        <div className="flex items-end">
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-1.5 h-4 w-4" />
            )}
            Create Code
          </Button>
        </div>
      </div>
      {message && (
        <p className={`text-sm ${message.type === "error" ? "text-destructive" : "text-green-600"}`}>
          {message.text}
        </p>
      )}
    </form>
  );
}
