"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toggleDiscountCode } from "@/server/actions/discount-code.actions";

export function ToggleCodeButton({
  codeId,
  isActive,
}: {
  codeId: string;
  isActive: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(async () => {
      await toggleDiscountCode(codeId);
    });
  }

  return (
    <Button
      variant={isActive ? "destructive" : "outline"}
      size="xs"
      onClick={handleToggle}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : isActive ? (
        "Deactivate"
      ) : (
        "Activate"
      )}
    </Button>
  );
}
