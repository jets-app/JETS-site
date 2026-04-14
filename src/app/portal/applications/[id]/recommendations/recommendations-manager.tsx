"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  addRecommendation,
  removeRecommendation,
} from "@/server/actions/application.actions";
import { resendRecommendationByOwner } from "@/server/actions/recommendation.actions";
import {
  CheckCircle2,
  Clock,
  Eye,
  Mail,
  Send,
  Trash2,
  UserPlus,
  AlertTriangle,
} from "lucide-react";

export type RecStatus =
  | "PENDING"
  | "SENT"
  | "VIEWED"
  | "COMPLETED"
  | "EXPIRED";

export interface RecSummary {
  id: string;
  refereeName: string;
  refereeEmail: string;
  refereePhone: string | null;
  refereeRelation: string;
  status: RecStatus;
  sentAt: Date | string;
  viewedAt: Date | string | null;
  submittedAt: Date | string | null;
  expiresAt: Date | string;
}

interface Props {
  applicationId: string;
  recommendations: RecSummary[];
  canEdit: boolean;
}

function formatDate(d: Date | string | null): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: RecStatus }) {
  switch (status) {
    case "COMPLETED":
      return (
        <Badge className="bg-emerald-600 text-white">
          <CheckCircle2 className="size-3" />
          Submitted
        </Badge>
      );
    case "VIEWED":
      return (
        <Badge variant="secondary">
          <Eye className="size-3" />
          Viewed
        </Badge>
      );
    case "SENT":
      return (
        <Badge variant="secondary">
          <Send className="size-3" />
          Sent
        </Badge>
      );
    case "EXPIRED":
      return (
        <Badge variant="destructive">
          <AlertTriangle className="size-3" />
          Expired
        </Badge>
      );
    case "PENDING":
    default:
      return (
        <Badge variant="outline">
          <Clock className="size-3" />
          Pending
        </Badge>
      );
  }
}

export function RecommendationsManager({
  applicationId,
  recommendations,
  canEdit,
}: Props) {
  const completedCount = recommendations.filter(
    (r) => r.status === "COMPLETED"
  ).length;
  const canAdd = canEdit && recommendations.length < 2;

  return (
    <div className="space-y-6">
      {/* Overall status banner */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            {completedCount === 2 ? (
              <CheckCircle2 className="size-5 text-emerald-600 mt-0.5" />
            ) : recommendations.length === 2 ? (
              <Clock className="size-5 text-amber-600 mt-0.5" />
            ) : (
              <UserPlus className="size-5 text-muted-foreground mt-0.5" />
            )}
            <div className="flex-1">
              <p className="font-medium text-sm">
                {completedCount === 2
                  ? "Both recommendations received"
                  : recommendations.length === 2
                    ? "Waiting for responses"
                    : `${recommendations.length} of 2 references added`}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {completedCount === 2
                  ? "Your recommendations are complete. Thank you!"
                  : recommendations.length === 2
                    ? "Both referees have been invited. We'll notify you as responses arrive."
                    : "Add up to 2 people who know the student well."}
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <Badge variant={completedCount === 2 ? "default" : "outline"}>
                {completedCount} / 2 submitted
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Existing recs */}
      {recommendations.length > 0 && (
        <div className="space-y-3">
          {recommendations.map((rec) => (
            <RecommendationItem
              key={rec.id}
              applicationId={applicationId}
              rec={rec}
              canEdit={canEdit}
            />
          ))}
        </div>
      )}

      {/* Add-new card */}
      {canAdd && (
        <AddRefereeCard
          applicationId={applicationId}
          existingCount={recommendations.length}
        />
      )}

      {!canEdit && (
        <p className="text-xs text-muted-foreground text-center">
          This application has been submitted. Recommendations can no longer
          be added or removed from the portal.
        </p>
      )}

      {/* Privacy note */}
      <Card>
        <CardContent className="py-4">
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">Privacy:</strong> Recommendation
            responses are confidential. Parents and students can see only that
            a reference has been requested, viewed, or submitted — never the
            content of the response.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// ==================== Item ====================
function RecommendationItem({
  applicationId,
  rec,
  canEdit,
}: {
  applicationId: string;
  rec: RecSummary;
  canEdit: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const isCompleted = rec.status === "COMPLETED";
  const canResend = canEdit && !isCompleted;
  const canRemove = canEdit && !isCompleted;

  function onResend() {
    setError(null);
    setInfo(null);
    startTransition(async () => {
      const result = await resendRecommendationByOwner(rec.id);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setInfo("Request resent to the referee.");
    });
  }

  function onRemove() {
    if (
      !confirm(
        `Remove ${rec.refereeName} as a reference? This cannot be undone.`
      )
    ) {
      return;
    }
    setError(null);
    setInfo(null);
    startTransition(async () => {
      const result = await removeRecommendation(applicationId, rec.id);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-medium text-foreground truncate">
                {rec.refereeName}
              </h3>
              <StatusBadge status={rec.status} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {rec.refereeRelation}
            </p>
            <div className="mt-2 space-y-0.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Mail className="size-3" />
                <span className="truncate">{rec.refereeEmail}</span>
              </div>
              {rec.refereePhone && (
                <div className="flex items-center gap-1.5">
                  <span className="size-3 inline-block" />
                  <span>{rec.refereePhone}</span>
                </div>
              )}
            </div>
            <div className="mt-2 text-xs text-muted-foreground flex flex-wrap gap-x-4 gap-y-0.5">
              <span>Sent: {formatDate(rec.sentAt)}</span>
              {rec.viewedAt && <span>Viewed: {formatDate(rec.viewedAt)}</span>}
              {rec.submittedAt && (
                <span>Submitted: {formatDate(rec.submittedAt)}</span>
              )}
              {!isCompleted && <span>Expires: {formatDate(rec.expiresAt)}</span>}
            </div>

            {error && (
              <p className="mt-2 text-xs text-destructive">{error}</p>
            )}
            {info && (
              <p className="mt-2 text-xs text-emerald-700 dark:text-emerald-400">
                {info}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            {isCompleted ? (
              <div className="inline-flex items-center gap-1.5 text-sm text-emerald-700 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="size-4" />
                Submitted
              </div>
            ) : (
              <>
                {canResend && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onResend}
                    disabled={isPending}
                  >
                    <Send className="size-3.5" />
                    {isPending ? "Resending..." : "Resend Request"}
                  </Button>
                )}
                {canRemove && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onRemove}
                    disabled={isPending}
                    aria-label="Remove referee"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ==================== Add form ====================
function AddRefereeCard({
  applicationId,
  existingCount,
}: {
  applicationId: string;
  existingCount: number;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [relationship, setRelationship] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function validate(): string | null {
    if (!name.trim() || name.trim().length < 2) {
      return "Please enter the referee's full name.";
    }
    const emailTrim = email.trim();
    if (!emailTrim) return "Please enter an email address.";
    // simple email check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim)) {
      return "Please enter a valid email address.";
    }
    if (!relationship.trim()) {
      return "Please describe the relationship (e.g., Rabbi, Teacher, Mentor).";
    }
    return null;
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    startTransition(async () => {
      const result = await addRecommendation(applicationId, {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || undefined,
        relationship: relationship.trim(),
      });

      if (result?.error) {
        setError(result.error);
        return;
      }

      setSuccess(`Request sent to ${name.trim()}.`);
      setName("");
      setEmail("");
      setPhone("");
      setRelationship("");
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Add Reference #{existingCount + 1}
        </CardTitle>
        <CardDescription>
          We&apos;ll email this person a private, secure link to fill out the
          recommendation form on your behalf.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="ref-name">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="ref-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Rabbi Yisroel Cohen"
              disabled={isPending}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ref-email">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="ref-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="referee@example.com"
              disabled={isPending}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ref-phone">Phone (optional)</Label>
            <Input
              id="ref-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(555) 123-4567"
              disabled={isPending}
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="ref-relationship">
              Relationship <span className="text-destructive">*</span>
            </Label>
            <Input
              id="ref-relationship"
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              placeholder="Rabbi / Teacher / Mentor / Coach"
              disabled={isPending}
              required
            />
          </div>

          {error && (
            <div className="sm:col-span-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}
          {success && (
            <div className="sm:col-span-2 rounded-md border border-emerald-300/40 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800/40">
              {success}
            </div>
          )}

          <div className="sm:col-span-2 flex justify-end">
            <Button type="submit" disabled={isPending}>
              <UserPlus className="size-4" />
              {isPending ? "Sending..." : "Send Request"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
