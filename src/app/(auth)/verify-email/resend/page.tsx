"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, CheckCircle2 } from "lucide-react";
import { resendVerification } from "@/server/actions/email-verification.actions";

export default function ResendVerificationPage() {
  const [email, setEmail] = useState("");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const result = await resendVerification(email);
      if (result.error) {
        setError(result.error);
      } else {
        setMessage(result.success ?? "If an unverified account exists, a new link has been sent.");
      }
    });
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center text-center space-y-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Mail className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-lg font-semibold tracking-tight">
            Resend verification email
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Enter your email and we&apos;ll send a fresh verification link.
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="you@example.com"
          />
        </div>

        {error && (
          <p className="text-xs text-destructive">{error}</p>
        )}
        {message && (
          <p className="text-xs text-emerald-600 flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {message}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending
            </>
          ) : (
            "Send verification link"
          )}
        </Button>
      </form>

      <p className="text-center text-xs text-muted-foreground">
        <Link href="/login" className="hover:text-foreground">
          ← Back to sign in
        </Link>
      </p>
    </div>
  );
}
