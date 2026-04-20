"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ratingCategories,
  overallRecommendationOptions,
  type RecommendationResponse,
} from "@/lib/validators/recommendation";

// ==================== Types ====================

interface RecommendationParent {
  id: string;
  refereeName: string;
  refereeEmail: string;
  refereeRelation: string;
  status: string;
  sentAt: Date;
  submittedAt: Date | null;
  expiresAt: Date;
}

interface RecommendationAdmin extends RecommendationParent {
  refereePhone?: string | null;
  responses: RecommendationResponse | null;
  viewedAt: Date | null;
}

interface RecommendationStatusProps {
  recommendations: RecommendationParent[] | RecommendationAdmin[];
  isAdmin?: boolean;
  onResend?: (recommendationId: string) => void;
  isResending?: boolean;
}

// ==================== Status Badge ====================

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "COMPLETED":
      return (
        <Badge variant="default" className="bg-success text-success-foreground">
          <CheckIcon className="mr-1" />
          Submitted
        </Badge>
      );
    case "VIEWED":
      return (
        <Badge variant="secondary">
          <EyeIcon className="mr-1" />
          Viewed
        </Badge>
      );
    case "SENT":
      return (
        <Badge variant="secondary">
          <SendIcon className="mr-1" />
          Sent
        </Badge>
      );
    case "EXPIRED":
      return (
        <Badge variant="destructive">
          <ClockIcon className="mr-1" />
          Expired
        </Badge>
      );
    case "PENDING":
    default:
      return (
        <Badge variant="outline">
          <ClockIcon className="mr-1" />
          Pending
        </Badge>
      );
  }
}

// ==================== Main Component ====================

export function RecommendationStatus({
  recommendations,
  isAdmin = false,
  onResend,
  isResending,
}: RecommendationStatusProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No references have been added yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {recommendations.map((rec) => {
        const isExpanded = expandedId === rec.id;
        const adminRec = isAdmin ? (rec as RecommendationAdmin) : null;
        const hasResponses =
          isAdmin && adminRec?.responses && rec.status === "COMPLETED";
        const canResend =
          isAdmin &&
          onResend &&
          rec.status !== "COMPLETED";

        return (
          <Card key={rec.id} size="sm">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <CardTitle className="flex items-center gap-2">
                    <span className="truncate">{rec.refereeName}</span>
                    <StatusBadge status={rec.status} />
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {rec.refereeRelation} &middot; {rec.refereeEmail}
                  </CardDescription>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {canResend && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onResend(rec.id)}
                      disabled={isResending}
                    >
                      {isResending ? "Sending..." : "Resend"}
                    </Button>
                  )}
                  {hasResponses && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setExpandedId(isExpanded ? null : rec.id)
                      }
                    >
                      {isExpanded ? "Collapse" : "View Details"}
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>

            {/* Expanded Admin View */}
            {isExpanded && hasResponses && adminRec?.responses && (
              <CardContent className="border-t pt-4">
                <ResponseDetails responses={adminRec.responses} />
              </CardContent>
            )}

            {/* Timestamps for admin */}
            {isAdmin && (
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span>
                    Sent:{" "}
                    {new Date(rec.sentAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  {adminRec?.viewedAt && (
                    <span>
                      Viewed:{" "}
                      {new Date(adminRec.viewedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  )}
                  {rec.submittedAt && (
                    <span>
                      Submitted:{" "}
                      {new Date(rec.submittedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  )}
                  <span>
                    Expires:{" "}
                    {new Date(rec.expiresAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}

// ==================== Response Details (Admin Only) ====================

function ResponseDetails({
  responses,
}: {
  responses: RecommendationResponse;
}) {
  return (
    <div className="space-y-5 text-sm">
      {/* Recommender Info */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="font-medium text-muted-foreground">Recommender</dt>
          <dd className="mt-0.5">{responses.recommenderName}</dd>
        </div>
        <div>
          <dt className="font-medium text-muted-foreground">Email</dt>
          <dd className="mt-0.5">{responses.recommenderEmail}</dd>
        </div>
        <div>
          <dt className="font-medium text-muted-foreground">Phone</dt>
          <dd className="mt-0.5">{responses.recommenderPhone}</dd>
        </div>
        <div>
          <dt className="font-medium text-muted-foreground">
            Known Duration / Capacity
          </dt>
          <dd className="mt-0.5">{responses.knownDuration}</dd>
        </div>
      </div>

      {/* Ratings Table */}
      <div>
        <h4 className="mb-2 font-medium">Assessment Ratings (1-5 scale)</h4>
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-3 py-2 text-left font-medium">Category</th>
                <th className="px-3 py-2 text-left font-medium">Rating</th>
                <th className="px-3 py-2 text-left font-medium">Comments</th>
              </tr>
            </thead>
            <tbody>
              {ratingCategories.map((cat) => {
                const entry = responses[
                  cat.key as keyof RecommendationResponse
                ] as { rating: string; comments: string };
                return (
                  <tr key={cat.key} className="border-b last:border-0">
                    <td className="px-3 py-2 text-muted-foreground">
                      {cat.label}
                    </td>
                    <td className="px-3 py-2">
                      <RatingBadge rating={entry?.rating ?? "—"} />
                    </td>
                    <td className="px-3 py-2 text-muted-foreground text-xs">
                      {entry?.comments || "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Written Responses */}
      <div className="space-y-4">
        <div>
          <h4 className="mb-1 font-medium">Strengths and Weaknesses</h4>
          <p className="whitespace-pre-wrap text-muted-foreground">
            {responses.strengthsAndWeaknesses}
          </p>
        </div>

        <div>
          <h4 className="mb-1 font-medium">Special Needs</h4>
          <p className="whitespace-pre-wrap text-muted-foreground">
            {responses.specialNeeds}
          </p>
        </div>

        <div>
          <h4 className="mb-1 font-medium">Social Skills</h4>
          <p className="whitespace-pre-wrap text-muted-foreground">
            {responses.socialSkills}
          </p>
        </div>

        <div>
          <h4 className="mb-1 font-medium">Academic Skills</h4>
          <p className="whitespace-pre-wrap text-muted-foreground">
            {responses.academicSkills}
          </p>
        </div>

        <div>
          <h4 className="mb-1 font-medium">Discipline Issues</h4>
          <p className="whitespace-pre-wrap text-muted-foreground">
            {responses.disciplineIssues}
          </p>
        </div>

        <div>
          <h4 className="mb-1 font-medium">Overall Recommendation</h4>
          <OverallBadge value={responses.overallRecommendation} />
        </div>

        {responses.additionalComments && (
          <div>
            <h4 className="mb-1 font-medium">Additional Comments</h4>
            <p className="whitespace-pre-wrap text-muted-foreground">
              {responses.additionalComments}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== Rating Badge ====================

function RatingBadge({ rating }: { rating: string }) {
  const num = parseInt(rating, 10);
  const variant = (() => {
    if (num >= 4) return "default" as const;
    if (num === 3) return "secondary" as const;
    if (num <= 2 && num >= 1) return "destructive" as const;
    return "outline" as const;
  })();

  const label = num >= 1 && num <= 5 ? `${rating} / 5` : rating;

  return <Badge variant={variant}>{label}</Badge>;
}

// ==================== Overall Recommendation Badge ====================

function OverallBadge({ value }: { value: string }) {
  const variant = (() => {
    if (value.includes("highly recommend")) return "default" as const;
    if (value.includes("would recommend") && !value.includes("reservation") && !value.includes("not"))
      return "secondary" as const;
    if (value.includes("reservation")) return "outline" as const;
    if (value.includes("would not")) return "destructive" as const;
    return "outline" as const;
  })();

  return <Badge variant={variant}>{value}</Badge>;
}

// ==================== Icons ====================

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function SendIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}
