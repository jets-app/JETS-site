import Link from "next/link";
import { CheckCircle2, XCircle, ShieldAlert } from "lucide-react";
import { revertEmailChange } from "@/server/actions/email-change.actions";

export const metadata = { title: "Revert email change — JETS School" };

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function RevertEmailChangePage({ searchParams }: PageProps) {
  const { token } = await searchParams;
  const result = token ? await revertEmailChange(token) : { error: "Missing token." };

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
              <h1 className="text-lg font-semibold tracking-tight">Change reverted</h1>
              <p className="text-sm text-muted-foreground">
                The email on your account has been restored to <strong>{result.restoredEmail}</strong>{" "}
                and every active session has been signed out.
              </p>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-900 text-left flex gap-2">
              <ShieldAlert className="h-4 w-4 mt-0.5 shrink-0" />
              <p>
                Sign in and reset your password right away. If you suspect the account was
                compromised, also contact JETS at{" "}
                <a href="mailto:info@jetsschool.org" className="underline">
                  info@jetsschool.org
                </a>
                .
              </p>
            </div>
            <Link
              href="/forgot-password"
              className="inline-flex items-center justify-center w-full h-10 px-4 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-colors"
            >
              Reset my password
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
                We couldn&apos;t revert that change
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
