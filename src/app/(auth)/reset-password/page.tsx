"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { resetPassword } from "@/server/actions/password.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!token) {
    return (
      <div className="space-y-6 text-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-semibold">
            J
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              Invalid reset link
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              This link is invalid or has expired.
            </p>
          </div>
        </div>
        <Link
          href="/forgot-password"
          className="inline-block text-xs font-medium text-foreground hover:text-primary transition-colors"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    const result = await resetPassword({
      token: token!,
      password,
      confirmPassword,
    });

    if (result.error) setError(result.error);
    if (result.success) {
      setSuccess(result.success);
      setTimeout(() => router.push("/login"), 1500);
    }

    setIsSubmitting(false);
  }

  return (
    <div className="space-y-8">
      {/* Logo + name */}
      <div className="flex flex-col items-center text-center space-y-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-semibold">
          J
        </div>
        <div>
          <h1 className="text-lg font-semibold tracking-tight">
            Set new password
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Choose a strong password you&apos;ll remember.
          </p>
        </div>
      </div>

      {success ? (
        <div className="space-y-6 text-center">
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-sm font-medium">Password updated</p>
            <p className="text-xs text-muted-foreground mt-1">
              {success} Redirecting...
            </p>
          </div>
        </div>
      ) : (
        <>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm">
                New password
              </Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                className="h-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
              <p className="text-xs text-muted-foreground">
                At least 8 characters with an uppercase letter and number.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-sm">
                Confirm password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                className="h-10"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {error && <p className="text-xs text-destructive">{error}</p>}

            <Button
              type="submit"
              className="w-full h-10"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating
                </>
              ) : (
                "Reset password"
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            <Link
              href="/login"
              className="hover:text-foreground transition-colors"
            >
              Back to sign in
            </Link>
          </p>
        </>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
