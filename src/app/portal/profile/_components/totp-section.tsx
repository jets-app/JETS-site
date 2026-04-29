"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ShieldCheck, ShieldOff, Copy, CheckCircle2 } from "lucide-react";
import {
  setupTOTP,
  confirmTOTPSetup,
  disableTOTP,
  regenerateBackupCodes,
} from "@/server/actions/totp.actions";

interface Props {
  initiallyEnabled: boolean;
}

export function TOTPSection({ initiallyEnabled }: Props) {
  const [enabled, setEnabled] = useState(initiallyEnabled);
  const [step, setStep] = useState<"idle" | "enrolling" | "showBackup">("idle");
  const [qr, setQr] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [disablePassword, setDisablePassword] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  function startSetup() {
    setFeedback(null);
    startTransition(async () => {
      const result = await setupTOTP();
      if (result.error) {
        setFeedback({ type: "error", text: result.error });
        return;
      }
      setQr(result.qrCodeDataUrl ?? null);
      setSecret(result.secret ?? null);
      setStep("enrolling");
    });
  }

  function confirmSetup() {
    setFeedback(null);
    startTransition(async () => {
      const result = await confirmTOTPSetup(code);
      if (result.error) {
        setFeedback({ type: "error", text: result.error });
        return;
      }
      setBackupCodes(result.backupCodes ?? null);
      setEnabled(true);
      setStep("showBackup");
      setQr(null);
      setSecret(null);
      setCode("");
    });
  }

  function disable() {
    if (!confirm("Disable two-factor authentication? You'll be able to sign in with just your password.")) {
      return;
    }
    setFeedback(null);
    startTransition(async () => {
      const result = await disableTOTP(disablePassword);
      if (result.error) {
        setFeedback({ type: "error", text: result.error });
        return;
      }
      setEnabled(false);
      setDisablePassword("");
      setFeedback({ type: "success", text: "Two-factor authentication disabled." });
    });
  }

  function regenBackup() {
    const pwd = prompt("Enter your current password to generate new backup codes. (This invalidates any old codes.)");
    if (!pwd) return;
    setFeedback(null);
    startTransition(async () => {
      const result = await regenerateBackupCodes(pwd);
      if (result.error) {
        setFeedback({ type: "error", text: result.error });
        return;
      }
      setBackupCodes(result.backupCodes ?? null);
      setStep("showBackup");
    });
  }

  function copyBackupCodes() {
    if (!backupCodes) return;
    navigator.clipboard.writeText(backupCodes.join("\n")).catch(() => {});
  }

  // ---------- Showing freshly minted backup codes ----------
  if (step === "showBackup" && backupCodes) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-emerald-700">
          <CheckCircle2 className="h-5 w-5" />
          <h3 className="font-semibold">Two-factor enabled</h3>
        </div>
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 space-y-2 text-sm text-amber-900">
          <p className="font-semibold">Save these backup codes somewhere safe.</p>
          <p>If you lose your phone, you can use one of these codes to sign in. Each code works only once. We can&apos;t show them again — write them down or copy them now.</p>
        </div>
        <div className="rounded-lg border bg-muted/30 p-4">
          <div className="grid grid-cols-2 gap-2 font-mono text-sm">
            {backupCodes.map((c) => (
              <span key={c} className="px-2 py-1 bg-background rounded border">
                {c}
              </span>
            ))}
          </div>
          <Button variant="outline" size="sm" className="mt-3" onClick={copyBackupCodes}>
            <Copy className="h-3.5 w-3.5 mr-1.5" />
            Copy all
          </Button>
        </div>
        <Button onClick={() => { setBackupCodes(null); setStep("idle"); }}>
          I&apos;ve saved them — done
        </Button>
      </div>
    );
  }

  // ---------- Enrollment (QR + verification code) ----------
  if (step === "enrolling" && qr && secret) {
    return (
      <div className="space-y-4">
        <h3 className="font-semibold">Enable two-factor authentication</h3>
        <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
          <li>Install Google Authenticator (or any TOTP app) on your phone.</li>
          <li>Open the app and scan the QR code below.</li>
          <li>Enter the 6-digit code the app shows to confirm.</li>
        </ol>
        <div className="flex justify-center bg-white p-4 rounded-lg border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} alt="TOTP QR code" className="w-48 h-48" />
        </div>
        <details className="text-xs text-muted-foreground">
          <summary className="cursor-pointer">Can&apos;t scan? Enter this secret manually</summary>
          <code className="block mt-2 p-2 bg-muted rounded font-mono break-all">{secret}</code>
        </details>
        <div className="space-y-1.5">
          <Label htmlFor="totp-code">6-digit code from the app</Label>
          <Input
            id="totp-code"
            type="text"
            inputMode="numeric"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\s/g, ""))}
            className="font-mono text-lg tracking-[0.4em] text-center"
            placeholder="000000"
            maxLength={6}
          />
        </div>
        {feedback?.type === "error" && (
          <p className="text-xs text-destructive">{feedback.text}</p>
        )}
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { setStep("idle"); setQr(null); setSecret(null); setCode(""); }}>
            Cancel
          </Button>
          <Button onClick={confirmSetup} disabled={isPending || code.length < 6}>
            {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying</> : "Confirm"}
          </Button>
        </div>
      </div>
    );
  }

  // ---------- Idle state (enabled or not) ----------
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        {enabled ? (
          <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
        ) : (
          <ShieldOff className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
        )}
        <div className="flex-1">
          <h3 className="font-semibold">Two-factor authentication</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            {enabled
              ? "Active — you'll be asked for a 6-digit code from your authenticator app every time you sign in."
              : "Add an extra layer of security. After your password, you'll enter a code from an authenticator app on your phone."}
          </p>
        </div>
      </div>

      {feedback && (
        <p className={`text-xs ${feedback.type === "success" ? "text-emerald-600" : "text-destructive"}`}>
          {feedback.text}
        </p>
      )}

      {!enabled ? (
        <Button onClick={startSetup} disabled={isPending}>
          {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading</> : "Enable 2FA"}
        </Button>
      ) : (
        <div className="space-y-3">
          <Button variant="outline" onClick={regenBackup} disabled={isPending}>
            Generate new backup codes
          </Button>
          <div className="space-y-1.5">
            <Label htmlFor="disable-pwd" className="text-sm">
              Disable 2FA — enter current password
            </Label>
            <div className="flex gap-2">
              <Input
                id="disable-pwd"
                type="password"
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
                placeholder="Password"
                autoComplete="current-password"
              />
              <Button variant="destructive" onClick={disable} disabled={isPending || !disablePassword}>
                Disable
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
