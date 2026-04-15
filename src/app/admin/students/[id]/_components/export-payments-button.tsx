"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface Row {
  paidAt: string;
  monthFor: string;
  amount: number;
  method: string;
  status: string;
  description: string;
}

export function ExportPaymentsButton({
  rows,
  filename,
}: {
  rows: Row[];
  filename: string;
}) {
  const onClick = () => {
    const headers = ["Date Paid", "Month Paid For", "Amount", "Method", "Status", "Description"];
    const csvRows = [headers.join(",")];
    for (const r of rows) {
      csvRows.push(
        [
          r.paidAt,
          r.monthFor,
          (r.amount / 100).toFixed(2),
          r.method,
          r.status,
          `"${(r.description ?? "").replace(/"/g, '""')}"`,
        ].join(",")
      );
    }
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Button size="xs" variant="outline" onClick={onClick} disabled={rows.length === 0}>
      <Download className="h-3 w-3" /> Export CSV
    </Button>
  );
}
