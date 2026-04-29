"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Loader2,
  CheckCircle2,
  PenTool,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { submitSignedDocument } from "@/server/actions/document.actions";
import { sanitizeTemplateHtml } from "@/lib/sanitize-html";

interface DocumentData {
  id: string;
  token: string;
  title: string;
  recipientType: string;
  customizedHtml: string | null;
  content: {
    fields?: Array<{
      name: string;
      label: string;
      type: string;
      required: boolean;
    }>;
  } | null;
  studentName: string;
  parentName: string;
  studentDob: string | null;
  templateType: string | null;
}

interface DocumentSigningViewProps {
  document: DocumentData;
}

export function DocumentSigningView({ document }: DocumentSigningViewProps) {
  const [isPending, startTransition] = useTransition();
  const [isComplete, setIsComplete] = useState(false);
  const [signerName, setSignerName] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const fields = document.content?.fields ?? [];

  const handleFieldChange = (name: string, value: string) => {
    setFieldValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    setError(null);

    if (!signerName.trim()) {
      setError("Please type your full legal name as your signature.");
      return;
    }

    if (!agreed) {
      setError("You must agree to the terms before signing.");
      return;
    }

    // Validate required fields
    for (const field of fields) {
      if (field.required && !fieldValues[field.name]?.trim()) {
        setError(`Please fill in: ${field.label}`);
        return;
      }
    }

    // Generate a text-based signature representation
    const signatureDataUrl = `text-signature:${signerName.trim()}|${new Date().toISOString()}`;

    startTransition(async () => {
      try {
        const result = await submitSignedDocument(
          document.token,
          signatureDataUrl,
          signerName.trim(),
          fieldValues
        );

        if (result.error) {
          setError(result.error);
        } else {
          setIsComplete(true);
        }
      } catch {
        setError("Something went wrong. Please try again.");
      }
    });
  };

  if (isComplete) {
    return <SigningSuccessPage document={document} signerName={signerName} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
              JETS
            </div>
            <div>
              <p className="font-semibold text-sm">JETS School</p>
              <p className="text-xs text-muted-foreground">
                Document Signing
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" />
            Secure
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Document title */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {document.title}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            For: {document.recipientType === "PARENT"
              ? document.parentName
              : document.studentName}{" "}
            &middot; Student: {document.studentName}
          </p>
        </div>

        {/* Document content */}
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4 text-primary" />
              Document
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {document.customizedHtml ? (
              // customizedHtml was already sanitized server-side when the doc
              // was created. We sanitize again at render as a belt-and-
              // suspenders measure in case stored data predates the sanitizer.
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{
                  __html: sanitizeTemplateHtml(document.customizedHtml),
                }}
              />
            ) : (
              <p className="text-muted-foreground italic">
                No document content available.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Fillable fields */}
        {fields.length > 0 && (
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-sm">
                Please Fill In the Following
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {fields.map((field) => (
                <div key={field.name} className="space-y-1.5">
                  <Label htmlFor={field.name}>
                    {field.label}
                    {field.required && (
                      <span className="text-destructive ml-0.5">*</span>
                    )}
                  </Label>
                  {field.type === "textarea" ? (
                    <Textarea
                      id={field.name}
                      value={fieldValues[field.name] ?? ""}
                      onChange={(e) =>
                        handleFieldChange(field.name, e.target.value)
                      }
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                    />
                  ) : field.type === "select" ? (
                    <select
                      id={field.name}
                      value={fieldValues[field.name] ?? ""}
                      onChange={(e) =>
                        handleFieldChange(field.name, e.target.value)
                      }
                      className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      <option value="">Select...</option>
                      <option value="annual">Annual (Full Payment)</option>
                      <option value="semi-annual">
                        Semi-Annual (2 Payments)
                      </option>
                      <option value="quarterly">
                        Quarterly (4 Payments)
                      </option>
                      <option value="monthly">Monthly (10 Payments)</option>
                    </select>
                  ) : (
                    <Input
                      id={field.name}
                      type={field.type === "tel" ? "tel" : field.type === "date" ? "date" : "text"}
                      value={fieldValues[field.name] ?? ""}
                      onChange={(e) =>
                        handleFieldChange(field.name, e.target.value)
                      }
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                    />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Signature area */}
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2 text-sm">
              <PenTool className="h-4 w-4 text-primary" />
              Signature
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="signerName">
                Type Your Full Legal Name as Your Signature
                <span className="text-destructive ml-0.5">*</span>
              </Label>
              <Input
                id="signerName"
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                placeholder="e.g., John Michael Doe"
                className="text-lg"
              />
            </div>

            {/* Signature preview */}
            {signerName.trim() && (
              <div className="rounded-lg border-2 border-dashed border-primary/20 bg-primary/5 p-6 text-center">
                <p
                  className="text-2xl italic"
                  style={{ fontFamily: "cursive, Georgia, serif" }}
                >
                  {signerName}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            )}

            {/* Agreement checkbox */}
            <div className="flex items-start gap-3 pt-2">
              <Checkbox
                checked={agreed}
                onCheckedChange={(checked) =>
                  setAgreed(checked === true)
                }
                id="agree"
              />
              <label
                htmlFor="agree"
                className="text-sm leading-relaxed cursor-pointer select-none"
              >
                I have read and understand this document. I agree to the
                terms stated above and confirm that my typed name above
                constitutes my legal electronic signature.
              </label>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Submit */}
            <Button
              className="w-full"
              size="lg"
              disabled={isPending || !signerName.trim() || !agreed}
              onClick={handleSubmit}
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <PenTool className="h-4 w-4 mr-2" />
              )}
              Sign Document
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              By clicking &ldquo;Sign Document&rdquo;, you agree that your
              electronic signature is the legal equivalent of your manual
              signature on this document.
            </p>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card/50 mt-12">
        <div className="max-w-3xl mx-auto px-4 py-6 text-center">
          <p className="text-xs text-muted-foreground">
            JETS School &middot; Granada Hills, Los Angeles, CA &middot;
            (818) 831-3000 &middot; info@jetsschool.org
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            This is a secure electronic document. Your signature is legally
            binding.
          </p>
        </div>
      </footer>
    </div>
  );
}

function SigningSuccessPage({
  document,
  signerName,
}: {
  document: DocumentData;
  signerName: string;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6 animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Document Signed Successfully
          </h1>
          <p className="text-muted-foreground mt-2 leading-relaxed">
            Thank you, {signerName}. Your signature on &ldquo;
            {document.title}&rdquo; has been recorded.
          </p>
        </div>

        <div className="rounded-lg border bg-card p-4 text-left space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Document</span>
            <span className="font-medium">{document.title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Student</span>
            <span className="font-medium">{document.studentName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Signed by</span>
            <span className="font-medium">{signerName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Date</span>
            <span className="font-medium">
              {new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          You may close this page. A confirmation will be sent to the JETS
          School office.
        </p>

        <div className="pt-4 border-t">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-[10px]">
              JETS
            </div>
            <span className="font-semibold text-sm">JETS School</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Granada Hills, Los Angeles, CA &middot; (818) 831-3000 &middot;
            info@jetsschool.org
          </p>
        </div>
      </div>
    </div>
  );
}
