"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitApplication } from "@/server/actions/application.actions";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function SubmitButton({ applicationId }: { applicationId: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    const result = await submitApplication(applicationId);
    if (result.error) {
      setError(result.error);
      setSubmitting(false);
      return;
    }
    router.push("/portal/dashboard");
    router.refresh();
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-sm text-destructive text-center">{error}</p>
      )}
      <Button
        onClick={handleSubmit}
        disabled={submitting}
        size="lg"
        className="w-full"
      >
        {submitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          "Submit Application"
        )}
      </Button>
    </div>
  );
}
