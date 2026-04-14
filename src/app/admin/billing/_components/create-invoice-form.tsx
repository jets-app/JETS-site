"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Trash2, Send } from "lucide-react";
import { createInvoice, sendInvoice } from "@/server/actions/invoice.actions";

interface ParentOption {
  id: string;
  label: string;
}

interface LineItemRow {
  description: string;
  quantity: number;
  unitPrice: number;
}

export function CreateInvoiceForm({
  parents,
}: {
  parents: ParentOption[];
}) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [lineItems, setLineItems] = useState<LineItemRow[]>([
    { description: "", quantity: 1, unitPrice: 0 },
  ]);

  function addLine() {
    setLineItems([...lineItems, { description: "", quantity: 1, unitPrice: 0 }]);
  }

  function removeLine(idx: number) {
    setLineItems(lineItems.filter((_, i) => i !== idx));
  }

  function updateLine(idx: number, field: keyof LineItemRow, value: string | number) {
    const updated = [...lineItems];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (updated[idx] as any)[field] = value;
    setLineItems(updated);
  }

  const total = lineItems.reduce((s, item) => s + item.quantity * item.unitPrice, 0);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parentId = fd.get("parentId")?.toString() ?? "";
    const dueDate = fd.get("dueDate")?.toString() ?? "";

    if (!parentId || !dueDate) {
      setMessage({ text: "Please select a parent and due date.", type: "error" });
      return;
    }

    const items = lineItems
      .filter((item) => item.description && item.unitPrice > 0)
      .map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: Math.round(item.unitPrice * 100),
        total: Math.round(item.quantity * item.unitPrice * 100),
      }));

    if (items.length === 0) {
      setMessage({ text: "Add at least one line item.", type: "error" });
      return;
    }

    startTransition(async () => {
      const result = await createInvoice(parentId, items, dueDate);
      if (result.error) {
        setMessage({ text: result.error, type: "error" });
      } else {
        setMessage({ text: `Invoice ${result.invoice?.invoiceNumber} created!`, type: "success" });
        setLineItems([{ description: "", quantity: 1, unitPrice: 0 }]);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Parent</Label>
          <select
            name="parentId"
            className="w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm"
          >
            <option value="">Select parent...</option>
            {parents.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label>Due Date</Label>
          <Input name="dueDate" type="date" />
        </div>
      </div>

      {/* Line Items */}
      <div className="space-y-2">
        <Label>Line Items</Label>
        {lineItems.map((item, idx) => (
          <div key={idx} className="flex items-end gap-2">
            <div className="flex-1 space-y-1">
              {idx === 0 && <span className="text-xs text-muted-foreground">Description</span>}
              <Input
                value={item.description}
                onChange={(e) => updateLine(idx, "description", e.target.value)}
                placeholder="Tuition, registration fee, etc."
              />
            </div>
            <div className="w-20 space-y-1">
              {idx === 0 && <span className="text-xs text-muted-foreground">Qty</span>}
              <Input
                type="number"
                value={item.quantity}
                onChange={(e) => updateLine(idx, "quantity", parseInt(e.target.value) || 1)}
                min="1"
              />
            </div>
            <div className="w-28 space-y-1">
              {idx === 0 && <span className="text-xs text-muted-foreground">Unit Price</span>}
              <Input
                type="number"
                step="0.01"
                value={item.unitPrice || ""}
                onChange={(e) => updateLine(idx, "unitPrice", parseFloat(e.target.value) || 0)}
                placeholder="$0.00"
              />
            </div>
            <div className="w-24 text-right text-sm font-medium self-end pb-1.5">
              ${(item.quantity * item.unitPrice).toFixed(2)}
            </div>
            {lineItems.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => removeLine(idx)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addLine}>
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Add Line
        </Button>
      </div>

      {/* Total */}
      <div className="flex justify-end border-t pt-3">
        <div className="text-right">
          <span className="text-sm text-muted-foreground mr-4">Total:</span>
          <span className="text-lg font-bold">${total.toFixed(2)}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
          ) : (
            <Send className="mr-1.5 h-4 w-4" />
          )}
          Create Invoice
        </Button>
      </div>

      {message && (
        <p className={`text-sm ${message.type === "error" ? "text-destructive" : "text-green-600"}`}>
          {message.text}
        </p>
      )}
    </form>
  );
}
