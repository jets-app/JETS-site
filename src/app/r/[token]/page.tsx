import type { Metadata } from "next";
import { getRecommendationByToken } from "@/server/actions/recommendation.actions";
import { RecommendationFormClient } from "./recommendation-form";

export const metadata: Metadata = {
  title: "Recommendation Form",
  description: "Submit a recommendation for a JETS School applicant",
};

export default async function RecommendationPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const result = await getRecommendationByToken(token);

  if (result.error === "not_found") {
    return (
      <RecommendationShell>
        <ErrorState
          title="Link Not Found"
          message="This recommendation link is invalid. Please check the link in your email and try again."
        />
      </RecommendationShell>
    );
  }

  if (result.error === "already_submitted") {
    return (
      <RecommendationShell>
        <SuccessState
          title="Already Submitted"
          message="This recommendation has already been submitted. Thank you for your time."
        />
      </RecommendationShell>
    );
  }

  if (result.error === "expired") {
    return (
      <RecommendationShell>
        <ErrorState
          title="Link Expired"
          message="This recommendation link has expired. Please contact the applicant's family to request a new link."
        />
      </RecommendationShell>
    );
  }

  if (result.error === "server_error" || !result.data) {
    return (
      <RecommendationShell>
        <ErrorState
          title="Something Went Wrong"
          message="We encountered an error loading this page. Please try again later."
        />
      </RecommendationShell>
    );
  }

  const { data } = result;

  return (
    <RecommendationShell>
      <RecommendationFormClient
        token={data.token}
        refereeName={data.refereeName}
        refereeEmail={data.refereeEmail}
        studentName={data.studentName}
        parentName={data.parentName}
      />
    </RecommendationShell>
  );
}

// ==================== Layout Shell ====================

function RecommendationShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4 sm:px-6">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
            J
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">JETS School</h1>
            <p className="text-xs text-muted-foreground">
              Jewish Educational Trade School
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t bg-card/50 py-6 text-center text-xs text-muted-foreground">
        <p>JETS School &mdash; Torah V&apos;avodah</p>
        <p className="mt-1">Granada Hills, Los Angeles, CA</p>
      </footer>
    </div>
  );
}

// ==================== Error State ====================

function ErrorState({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <div className="flex flex-col items-center py-16 text-center">
      <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-2 max-w-md text-muted-foreground">{message}</p>
    </div>
  );
}

// ==================== Success State ====================

function SuccessState({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <div className="flex flex-col items-center py-16 text-center">
      <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-success/10 text-success">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-2 max-w-md text-muted-foreground">{message}</p>
    </div>
  );
}
