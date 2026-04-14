"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addDonation } from "@/server/actions/donor.actions";
import type { DonationFrequency } from "@prisma/client";

interface DonationFormProps {
  donorId: string;
  onClose?: () => void;
}

export function DonationForm({ donorId, onClose }: DonationFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [method, setMethod] = useState<string>("check");
  const [frequency, setFrequency] = useState<DonationFrequency>("ONE_TIME");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const amountStr = form.get("amount") as string;
    const amount = Math.round(parseFloat(amountStr) * 100);

    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid amount.");
      setLoading(false);
      return;
    }

    try {
      await addDonation(donorId, {
        amount,
        method,
        frequency,
        campaign: (form.get("campaign") as string) || undefined,
        purpose: (form.get("purpose") as string) || undefined,
        donatedAt: (form.get("donatedAt") as string) || undefined,
        notes: (form.get("notes") as string) || undefined,
      });
      router.refresh();
      onClose?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="amount" className="text-sm font-medium">
            Amount (USD) *
          </label>
          <Input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            required
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="donatedAt" className="text-sm font-medium">
            Date
          </label>
          <Input
            id="donatedAt"
            name="donatedAt"
            type="date"
            defaultValue={new Date().toISOString().slice(0, 10)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Method</label>
          <Select value={method} onValueChange={(v) => setMethod(v ?? "check")}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="check">Check</SelectItem>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="credit_card">Credit Card</SelectItem>
              <SelectItem value="wire">Wire Transfer</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Frequency</label>
          <Select
            value={frequency}
            onValueChange={(v) => setFrequency(v as DonationFrequency)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ONE_TIME">One-Time</SelectItem>
              <SelectItem value="MONTHLY">Monthly</SelectItem>
              <SelectItem value="QUARTERLY">Quarterly</SelectItem>
              <SelectItem value="ANNUALLY">Annually</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="campaign" className="text-sm font-medium">
            Campaign
          </label>
          <Input id="campaign" name="campaign" placeholder="e.g., Annual Fund" />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="purpose" className="text-sm font-medium">
            Purpose
          </label>
          <Input
            id="purpose"
            name="purpose"
            placeholder="e.g., General, Building Fund"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="notes" className="text-sm font-medium">
          Notes
        </label>
        <Textarea id="notes" name="notes" rows={2} />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Recording..." : "Record Donation"}
        </Button>
        {onClose && (
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
