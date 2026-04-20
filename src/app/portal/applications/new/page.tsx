"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createApplication, getOpenSchoolYears } from "@/server/actions/application.actions";
import { Loader2, GraduationCap } from "lucide-react";
import { LinkButton } from "@/components/shared/link-button";

export default function NewApplicationPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [years, setYears] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    getOpenSchoolYears().then((y) => {
      setYears(y);
      if (y.length === 1) {
        setSelectedYear(y[0]);
      }
      setLoading(false);
    });
  }, []);

  async function handleCreate() {
    if (!selectedYear) return;
    setCreating(true);
    setError(null);

    const result = await createApplication(selectedYear);

    if (result.error) {
      if (result.existingApplicationId) {
        router.replace(`/portal/applications/${result.existingApplicationId}/edit`);
        return;
      }
      setError(result.error);
      setCreating(false);
      return;
    }

    if (result.applicationId) {
      router.replace(`/portal/applications/${result.applicationId}/edit`);
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

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
    <div className="max-w-lg mx-auto py-12 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
          <GraduationCap className="h-7 w-7 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">Start Your Application</h1>
        <p className="text-muted-foreground">
          Select the school year you are applying for.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6 space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium">School Year</label>
          {years.length === 1 ? (
            <div className="h-10 px-3 rounded-lg border bg-muted flex items-center text-sm font-medium">
              {years[0]}
            </div>
          ) : (
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select a school year...</option>
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          )}
        </div>

        <button
          onClick={handleCreate}
          disabled={!selectedYear || creating}
          className="w-full h-10 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {creating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating Application...
            </>
          ) : (
            "Begin Application"
          )}
        </button>
      </div>
    </div>
  );
}
