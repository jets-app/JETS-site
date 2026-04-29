import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { confirmEmailChange } from "@/server/actions/email-change.actions";

export const metadata = { title: "Confirm email change — JETS School" };

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ConfirmEmailChangePage({ searchParams }: PageProps) {
  const { token } = await searchParams;
  const result = token ? await confirmEmailChange(token) : { error: "Missing token." };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-card border rounded-2xl p-8 space-y-6 text-center">
        {result.success ? (
          <>
            <div className="flex justify-center">
              <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-lg font-semibold tracking-tight">Email confirmed</h1>
              <p className="text-sm text-muted-foreground">
                Your account email is now <strong>{result.newEmail}</strong>. We&apos;ve also
                emailed your previous address with a 24-hour revert link in case the change
                wasn&apos;t made by you.
              </p>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center justify-center w-full h-10 px-4 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-colors"
            >
              Sign in
            </Link>
          </>
        ) : (
          <>
            <div className="flex justify-center">
              <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <XCircle className="h-6 w-6 text-destructive" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-lg font-semibold tracking-tight">
                We couldn&apos;t confirm that change
              </h1>
              <p className="text-sm text-muted-foreground">{result.error}</p>
            </div>
            <Link
              href="/login"
              className="text-xs text-muted-foreground hover:text-foreground inline-block"
            >
              ← Back to sign in
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
