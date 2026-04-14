"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tag, Loader2 } from "lucide-react";
import { applyDiscountCode } from "@/server/actions/payment.actions";

export function ApplyDiscountForm({
  applicationId,
}: {
  applicationId: string;
}) {
  const [code, setCode] = useState("");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [showInput, setShowInput] = useState(false);

  function handleApply() {
    if (!code.trim()) return;
    startTransition(async () => {
      const result = await applyDiscountCode(applicationId, code);
      if (result.error) {
        setMessage({ text: result.error, type: "error" });
      } else {
        setMessage({ text: result.message ?? "Discount applied!", type: "success" });
        setShowInput(false);
      }
    });
  }

  if (!showInput) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowInput(true)}
        className="text-muted-foreground"
      >
        <Tag className="mr-1.5 h-3.5 w-3.5" />
        Discount Code
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Enter code"
        className="w-32 h-7 text-sm"
        onKeyDown={(e) => e.key === "Enter" && handleApply()}
      />
      <Button onClick={handleApply} disabled={isPending} size="sm" variant="outline">
        {isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          "Apply"
        )}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          setShowInput(false);
          setMessage(null);
        }}
      >
        Cancel
      </Button>
      {message && (
        <span
          className={`text-xs ${
            message.type === "error" ? "text-destructive" : "text-green-600"
          }`}
        >
          {message.text}
        </span>
      )}
    </div>
  );
}
