"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validators/auth";
import { loginUser } from "@/server/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginFallback() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center text-center space-y-3">
        <div className="h-10 w-10 rounded-lg bg-primary" />
        <div>
          <div className="text-lg font-semibold tracking-tight">JETS School</div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Sign in to your account
          </p>
        </div>
      </div>
      <div className="flex justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    </div>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || undefined;
  const [error, setError] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  // 2FA state — once the server tells us this account requires TOTP, show
  // the code field. We keep email+password in state so we can re-submit
  // them along with the code without making the user retype.
  const [needsTotp, setNeedsTotp] = useState(false);
  const [totpCode, setTotpCode] = useState("");
  const [stashedCreds, setStashedCreds] = useState<LoginInput | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginInput) {
    setError(null);
    setNeedsVerification(false);
    try {
      const result = await loginUser({ ...data, callbackUrl });
      if (result?.error === "EMAIL_NOT_VERIFIED") {
        setNeedsVerification(true);
        return;
      }
      if (result?.error === "TOTP_REQUIRED") {
        setStashedCreds(data);
        setNeedsTotp(true);
        return;
      }
      if (result?.error === "TOTP_INVALID") {
        setStashedCreds(data);
        setNeedsTotp(true);
        setError("Code didn't match. Try again — or use a backup code.");
        return;
      }
      if (result?.error) {
        setError(result.error);
      }
    } catch {
      // Redirect throws are expected on success — Next.js handles it
    }
  }

  async function onSubmitTotp(e: React.FormEvent) {
    e.preventDefault();
    if (!stashedCreds) return;
    setError(null);
    try {
      const result = await loginUser({
        ...stashedCreds,
        totpCode: totpCode.trim(),
        callbackUrl,
      });
      if (result?.error === "TOTP_INVALID") {
        setError("Code didn't match. Try again — or use a backup code.");
        return;
      }
      if (result?.error) {
        setError(result.error);
      }
    } catch {
      // Redirect throws are expected on success
    }
  }

  const justVerified = searchParams.get("verified") === "1";

  return (
    <div className="space-y-8">
      {/* Logo + name */}
      <div className="flex flex-col items-center text-center space-y-3">
        <Link href="/" className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
          J
        </Link>
        <div>
          <Link href="/" className="text-lg font-semibold tracking-tight hover:text-primary transition-colors">JETS School</Link>
          <p className="text-xs text-muted-foreground mt-0.5">
            Sign in to your account
          </p>
        </div>
      </div>

      {justVerified && !needsTotp && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs text-emerald-800 text-center">
          ✓ Email verified. Sign in to continue.
        </div>
      )}

      {/* TOTP step — shown after email/password succeeds when the account has 2FA */}
      {needsTotp ? (
        <form onSubmit={onSubmitTotp} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="totp" className="text-sm">
              6-digit code from your authenticator app
            </Label>
            <Input
              id="totp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value.replace(/\s/g, ""))}
              className="h-10 tracking-[0.4em] font-mono text-center text-lg"
              placeholder="000000"
              maxLength={11}
            />
            <p className="text-xs text-muted-foreground">
              Open Google Authenticator (or your 2FA app) and enter the current code. If you&apos;ve lost access, type one of your backup codes instead.
            </p>
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <Button type="submit" className="w-full h-10" disabled={isSubmitting || !totpCode}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying
              </>
            ) : (
              "Verify and sign in"
            )}
          </Button>
          <button
            type="button"
            onClick={() => {
              setNeedsTotp(false);
              setStashedCreds(null);
              setTotpCode("");
              setError(null);
            }}
            className="block w-full text-xs text-muted-foreground hover:text-foreground text-center"
          >
            ← Use a different account
          </button>
        </form>
      ) : (
      /* Form */
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            className="h-10"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm">
              Password
            </Label>
            <Link
              href="/forgot-password"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Forgot?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              className="h-10 pr-10"
              aria-invalid={!!errors.password}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        {error && (
          <p className="text-xs text-destructive">{error}</p>
        )}
        {needsVerification && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-900 space-y-1.5">
            <p className="font-medium">Please verify your email first.</p>
            <p>
              Check your inbox for a link from JETS School. Didn&apos;t get it?{" "}
              <Link
                href="/verify-email/resend"
                className="font-semibold underline hover:no-underline"
              >
                Send a new verification email
              </Link>
              .
            </p>
          </div>
        )}

        <Button
          type="submit"
          className="w-full h-10"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>
      )}

      {/* Footer */}
      <p className="text-center text-xs text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-foreground hover:text-primary transition-colors"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
