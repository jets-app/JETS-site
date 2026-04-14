"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createApplication } from "@/server/actions/application.actions";
import { Loader2 } from "lucide-react";
import { LinkButton } from "@/components/shared/link-button";

export default function NewApplicationPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function create() {
      const result = await createApplication();

      if (cancelled) return;

      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.applicationId) {
        router.replace(`/portal/applications/${result.applicationId}/edit`);
      }
    }

    create();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
          <span className="text-destructive text-xl">!</span>
        </div>
        <h1 className="text-2xl font-bold">Unable to Create Application</h1>
        <p className="text-muted-foreground">{error}</p>
        <LinkButton href="/portal/dashboard" variant="outline">
          Back to Dashboard
        </LinkButton>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
      <p className="text-muted-foreground">Creating your application...</p>
    </div>
  );
}
