"use client";

import { useState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/server/actions/password.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    const result = await requestPasswordReset({ email });

    if (result.error) setError(result.error);
    if (result.success) setSuccess(result.success);

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
            Reset your password
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            We&apos;ll email you a link to reset it.
          </p>
        </div>
      </div>

      {success ? (
        <div className="space-y-6 text-center">
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-sm font-medium">Check your email</p>
            <p className="text-xs text-muted-foreground mt-1">{success}</p>
          </div>
          <Link
            href="/login"
            className="inline-block text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Back to sign in
          </Link>
        </div>
      ) : (
        <>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                className="h-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                  Sending
                </>
              ) : (
                "Send reset link"
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            Remember your password?{" "}
            <Link
              href="/login"
              className="font-medium text-foreground hover:text-primary transition-colors"
            >
              Sign in
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
