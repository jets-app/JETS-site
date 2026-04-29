import Link from "next/link";
import { CheckCircle2, XCircle, Mail } from "lucide-react";
import { verifyEmailToken } from "@/server/actions/email-verification.actions";

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

export const metadata = {
  title: "Verify your email — JETS School",
};

export default async function VerifyEmailPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const token = params.token;

  // No token in the URL — show a "check your inbox" landing for users who
  // arrived from the post-signup screen.
  if (!token) {
    return (
      <div className="space-y-8 text-center">
        <div className="flex justify-center">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Mail className="h-6 w-6 text-primary" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-lg font-semibold tracking-tight">
            Verify your email
          </h1>
          <p className="text-sm text-muted-foreground">
            We sent you a verification link. Click it to finish creating your
            account.
          </p>
        </div>
        <div className="text-xs text-muted-foreground space-y-3">
          <p>Didn&apos;t get the email? Check your spam folder.</p>
          <Link
            href="/verify-email/resend"
            className="text-primary font-medium hover:underline"
          >
            Send me a new link
          </Link>
        </div>
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
