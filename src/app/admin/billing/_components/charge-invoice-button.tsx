"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Zap } from "lucide-react";
import { toast } from "sonner";
import { processAutoPayForInvoice } from "@/server/actions/invoice-generation.actions";

export function ChargeInvoiceButton({ invoiceId }: { invoiceId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      size="xs"
      variant="outline"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await processAutoPayForInvoice(invoiceId);
          if ("error" in res) toast.error(res.error);
          else toast.success(res.message ?? "Charged.");
        })
      }
    >
      {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Zap className="h-3 w-3" />}
      Charge
    </Button>
  );
}
