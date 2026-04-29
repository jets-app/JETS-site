"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  checkPendingVerification,
  resendPendingVerification,
} from "@/server/actions/email-verification.actions";

const POLL_INTERVAL_MS = 3000;

export function PendingVerifyClient() {
  const router = useRouter();
  const [isResending, startResend] = useTransition();
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);
  // Disable resend for 30s after click so a user can't accidentally trigger
  // the rate limiter by clicking repeatedly.
  const [resendCooldown, setResendCooldown] = useState(0);
  const cooldownTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Poll for verification — handles the "click on phone, computer auto-redirects" UX
  useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      const result = await checkPendingVerification();
      if (!cancelled && result.verified) {
        setVerified(true);
        // brief beat so the user sees the success state before redirect
        setTimeout(() => router.replace("/login?verified=1"), 800);
      }
    };
    const id = setInterval(poll, POLL_INTERVAL_MS);
    poll(); // run once immediately
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [router]);

  // Tick down the resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    cooldownTimer.current = setInterval(() => {
      setResendCooldown((s) => Math.max(0, s - 1));
    }, 1000);
    return () => {
      if (cooldownTimer.current) clearInterval(cooldownTimer.current);
    };
  }, [resendCooldown]);

  function handleResend() {
    setResendMessage(null);
    setResendError(null);
    setResendCooldown(30);
    startResend(async () => {
      const result = await resendPendingVerification();
      if (result.error) {
        setResendError(result.error);
      } else {
        setResendMessage(result.success ?? "Verification link sent.");
      }
    });
  }

  if (verified) {
    return (
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-lg font-semibold tracking-tight">Email verified</h1>
          <p className="text-sm text-muted-foreground">
            Redirecting you to sign in&hellip;
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Mail className="h-6 w-6 text-primary" />
        </div>
      </div>

      <div className="space-y-2">
        <h1 className="text-lg font-semibold tracking-tight">
          Check your inbox
        </h1>
        <p className="text-sm text-muted-foreground">
          We sent you a verification link. Once you click it (on this device or
          your phone), this page will sign you in automatically.
        </p>
      </div>

      <div className="rounded-lg border bg-muted/30 px-3 py-2 text-xs text-muted-foreground flex items-center justify-center gap-2">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Waiting for confirmation&hellip;
      </div>

      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">
          Didn&apos;t get the email? Check your spam folder.
        </p>

        <Button
          type="button"
          variant="outline"
          onClick={handleResend}
          disabled={isResending || resendCooldown > 0}
          className="w-full"
        >
          {isResending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending
            </>
          ) : resendCooldown > 0 ? (
            `Resend (${resendCooldown}s)`
          ) : (
            "Resend verification email"
          )}
        </Button>

        {resendMessage && (
          <p className="text-xs text-emerald-600">{resendMessage}</p>
        )}
        {resendError && (
          <p className="text-xs text-destructive">{resendError}</p>
        )}
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
