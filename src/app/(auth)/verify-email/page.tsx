import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { verifyEmailToken } from "@/server/actions/email-verification.actions";
import { PendingVerifyClient } from "./_components/pending-verify-client";

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

export const metadata = {
  title: "Verify your email — JETS School",
};

export default async function VerifyEmailPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const token = params.token;

  // No token → "check your inbox" landing for the device the user registered on.
  // Polls every 3s so it auto-redirects when the user clicks the link on
  // another device (e.g. their phone).
  if (!token) {
    return <PendingVerifyClient />;
  }

  // Token present — verify it server-side
  const result = await verifyEmailToken(token);

  if (result.error) {
    return (
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <XCircle className="h-6 w-6 text-destructive" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-lg font-semibold tracking-tight">
            We couldn&apos;t verify that link
          </h1>
          <p className="text-sm text-muted-foreground">{result.error}</p>
        </div>
        <Link
          href="/verify-email/resend"
          className="inline-flex items-center justify-center w-full h-10 px-4 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-colors"
        >
          Send me a new link
        </Link>
        <div className="text-center">
          <Link
            href="/login"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            ← Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
          <CheckCircle2 className="h-6 w-6 text-emerald-600" />
        </div>
      </div>
      <div className="space-y-2">
        <h1 className="text-lg font-semibold tracking-tight">
          Email verified
        </h1>
        <p className="text-sm text-muted-foreground">
          You&apos;re all set. Sign in to continue.
        </p>
      </div>
      <Link
        href="/login"
        className="inline-flex items-center justify-center w-full h-10 px-4 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-colors"
      >
        Sign in
      </Link>
    </div>
  );
}
