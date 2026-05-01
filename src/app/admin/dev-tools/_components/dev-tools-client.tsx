"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FlaskConical, CheckCircle2, Copy, Check } from "lucide-react";
import { createTestStudent } from "@/server/actions/dev-tools.actions";

interface CreatedResult {
  application: {
    id: string;
    referenceNumber: string;
    academicYear: string;
    studentName: string;
  };
  parent: {
    email: string;
    password: string;
    name: string;
  };
}

export function DevToolsClient({ defaultEmail }: { defaultEmail: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CreatedResult | null>(null);
  const [baseEmail, setBaseEmail] = useState(defaultEmail);
  const [studentFirst, setStudentFirst] = useState("Test");
  const [studentLast, setStudentLast] = useState("Student");

  const create = () => {
    setError(null);
    setResult(null);
    startTransition(async () => {
      const r = await createTestStudent({
        baseEmail,
        studentFirstName: studentFirst,
        studentLastName: studentLast,
      });
      if ("error" in r && r.error) {
        setError(r.error);
        return;
      }
      if ("application" in r && r.application && r.parent) {
        setResult({ application: r.application, parent: r.parent });
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-md bg-primary/10 text-primary">
            <FlaskConical className="size-5" />
          </div>
          <div>
            <CardTitle>Create Test Student</CardTitle>
            <CardDescription>
              Spawns a fully-formed parent + student at{" "}
              <span className="font-mono text-xs">INTERVIEW_COMPLETED</span>{" "}
              status — ready for the office to send the acceptance email and
              enrollment docs. Application fee is marked paid. Parent gets a
              real password so you can log in as them.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="email" className="text-sm">
            Your base email (we&apos;ll add a + alias)
          </Label>
          <Input
            id="email"
            value={baseEmail}
            onChange={(e) => setBaseEmail(e.target.value)}
            placeholder="you@example.com"
            className="mt-1.5"
          />
          <p className="text-[11px] text-muted-foreground mt-1">
            We&apos;ll create the parent as{" "}
            <span className="font-mono">
              {baseEmail
                ? `${baseEmail.split("@")[0]}+jetstest1@${baseEmail.split("@")[1] ?? ""}`
                : "you+jetstest1@…"}
            </span>{" "}
            so all email gets to your inbox.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm">Student first name</Label>
            <Input
              value={studentFirst}
              onChange={(e) => setStudentFirst(e.target.value)}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label className="text-sm">Student last name</Label>
            <Input
              value={studentLast}
              onChange={(e) => setStudentLast(e.target.value)}
              className="mt-1.5"
            />
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300">
            {error}
          </div>
        )}

        {result && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 space-y-3 dark:bg-emerald-900/20 dark:border-emerald-800">
            <div className="flex items-start gap-2 text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
              <p className="text-sm font-semibold">
                Test student created — credentials below
              </p>
            </div>

            <div className="rounded-lg bg-white dark:bg-black/30 p-3 space-y-2 text-sm font-mono">
              <CredRow label="Login URL" value={`${window.location.origin}/login`} />
              <CredRow label="Parent email" value={result.parent.email} />
              <CredRow label="Parent password" value={result.parent.password} />
              <div className="border-t pt-2" />
              <CredRow label="Student" value={result.application.studentName} />
              <CredRow
                label="Reference #"
                value={result.application.referenceNumber}
              />
              <CredRow
                label="Academic year"
                value={result.application.academicYear}
              />
              <CredRow
                label="Status"
                value="INTERVIEW_COMPLETED — ready for acceptance"
              />
            </div>

            <div className="text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
              <p className="font-semibold">Test the flow:</p>
              <ol className="list-decimal list-inside space-y-0.5">
                <li>
                  Open the application in admin →{" "}
                  <a
                    href={`/admin/applications/${result.application.id}`}
                    className="underline"
                  >
                    /admin/applications/{result.application.id.slice(0, 8)}…
                  </a>
                </li>
                <li>
                  Set tuition pricing in the new <strong>Tuition Pricing</strong>{" "}
                  card if you want to test scholarship math
                </li>
                <li>
                  Move status to <strong>ACCEPTED</strong> → then send enrollment
                  docs (tuition contract + others)
                </li>
                <li>Open the email at your inbox, click the doc link</li>
                <li>
                  On the contract, pick a payment plan and sign — should redirect
                  to pay deposit
                </li>
                <li>
                  Log in as the parent at the URL above to see the new payment
                  schedule + invoices
                </li>
              </ol>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-1">
          <Button onClick={create} disabled={pending}>
            {pending ? "Creating…" : "Create Test Student"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function CredRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground text-xs uppercase tracking-wider">
        {label}
      </span>
      <span className="flex items-center gap-2 font-medium tabular-nums break-all">
        {value}
        <button
          type="button"
          onClick={copy}
          className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
          aria-label={`Copy ${label}`}
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-emerald-600" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </button>
      </span>
    </div>
  );
}
