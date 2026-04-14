"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateDonorReceipt } from "@/server/actions/donor.actions";
import { FileText } from "lucide-react";

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

interface ReceiptGeneratorProps {
  donorId: string;
  donorName: string;
  donorAddress: string;
  lifetimeTotal: number;
  thisYearTotal: number;
  onClose?: () => void;
}

export function ReceiptGenerator({
  donorId,
  donorName,
  donorAddress,
  lifetimeTotal,
  thisYearTotal,
  onClose,
}: ReceiptGeneratorProps) {
  const router = useRouter();
  const [type, setType] = useState<"per-donation" | "annual">("annual");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState<{
    id: string;
    amount: number;
    type: string;
    year: number | null;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);

    try {
      const result = await generateDonorReceipt(
        donorId,
        type,
        type === "annual" ? parseInt(year, 10) : undefined
      );
      setReceipt(result);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate receipt");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Receipt Type</label>
          <Select
            value={type}
            onValueChange={(v) => setType(v as "per-donation" | "annual")}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="annual">Annual Summary</SelectItem>
              <SelectItem value="per-donation">All Donations</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {type === "annual" && (
          <div className="space-y-1.5">
            <label htmlFor="receiptYear" className="text-sm font-medium">
              Year
            </label>
            <Input
              id="receiptYear"
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              min={2000}
              max={2100}
            />
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Preview */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="size-4" />
            Receipt Preview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="space-y-1">
            <p className="font-semibold">JETS Synagogue</p>
            <p className="text-muted-foreground">EIN: 68-0500418</p>
            <p className="text-muted-foreground">
              Granada Hills, Los Angeles, CA
            </p>
          </div>

          <div className="border-t pt-3 space-y-1">
            <p className="font-medium">Donor: {donorName}</p>
            {donorAddress && (
              <p className="text-muted-foreground">{donorAddress}</p>
            )}
          </div>

          <div className="border-t pt-3 space-y-1">
            <p>
              <span className="font-medium">Type:</span>{" "}
              {type === "annual"
                ? `Annual Summary (${year})`
                : "All Donations Summary"}
            </p>
            <p>
              <span className="font-medium">Total:</span>{" "}
              {type === "annual"
                ? formatCurrency(thisYearTotal)
                : formatCurrency(lifetimeTotal)}
            </p>
          </div>

          <div className="border-t pt-3">
            <p className="text-xs text-muted-foreground italic">
              This contribution is tax-deductible to the extent allowed by law.
              No goods or services were provided in exchange for this
              contribution.
            </p>
          </div>
        </CardContent>
      </Card>

      {receipt && (
        <div className="rounded-lg bg-green-500/10 p-3 text-sm text-green-700 dark:text-green-400">
          Receipt generated successfully. Amount: {formatCurrency(receipt.amount)}
          {receipt.year ? ` for year ${receipt.year}` : ""}
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button onClick={handleGenerate} disabled={loading}>
          {loading ? "Generating..." : "Generate Receipt"}
        </Button>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}
