"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, XCircle, FileSearch } from "lucide-react";

const statusConfig = {
  SUBMITTED: {
    label: "Submitted",
    icon: Clock,
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    description: "Your application has been submitted and is waiting for review.",
  },
  UNDER_REVIEW: {
    label: "Under Review",
    icon: FileSearch,
    className: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    description: "Your application is currently being reviewed by our financial aid committee.",
  },
  APPROVED: {
    label: "Approved",
    icon: CheckCircle2,
    className: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    description: "Congratulations! Your scholarship application has been approved.",
  },
  DENIED: {
    label: "Denied",
    icon: XCircle,
    className: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    description: "We were unable to approve your scholarship application at this time.",
  },
};

function formatCents(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

interface ScholarshipStatusProps {
  scholarship: {
    id: string;
    status: string;
    requestedAmount: number | null;
    affordableAmount: number | null;
    approvedAmount: number | null;
    reviewNotes: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
  studentName: string;
  referenceNumber: string;
}

export function ScholarshipStatus({
  scholarship,
  studentName,
  referenceNumber,
}: ScholarshipStatusProps) {
  const config = statusConfig[scholarship.status as keyof typeof statusConfig] ?? statusConfig.SUBMITTED;
  const StatusIcon = config.icon;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Scholarship Application for {studentName}</CardTitle>
            <CardDescription>Scholarship Application</CardDescription>
          </div>
          <Badge
            variant="outline"
            className={`border-transparent font-medium ${config.className}`}
          >
            <StatusIcon className="mr-1 h-3.5 w-3.5" />
            {config.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{config.description}</p>

          <div className="grid sm:grid-cols-3 gap-4">
            {scholarship.affordableAmount !== null && (
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Amount You Can Afford</p>
                <p className="text-lg font-semibold">{formatCents(scholarship.affordableAmount)}</p>
              </div>
            )}
            {scholarship.requestedAmount !== null && (
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Amount Requested</p>
                <p className="text-lg font-semibold">{formatCents(scholarship.requestedAmount)}</p>
              </div>
            )}
            {scholarship.approvedAmount !== null && (
              <div className="rounded-lg border p-3 border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-900/20">
                <p className="text-xs text-muted-foreground">Approved Amount</p>
                <p className="text-lg font-semibold text-green-700 dark:text-green-400">
                  {formatCents(scholarship.approvedAmount)}
                </p>
              </div>
            )}
          </div>

          {scholarship.reviewNotes && (
            <div className="rounded-lg border p-3 bg-muted/30">
              <p className="text-xs text-muted-foreground mb-1">Committee Notes</p>
              <p className="text-sm">{scholarship.reviewNotes}</p>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Submitted on{" "}
            {new Date(scholarship.createdAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
