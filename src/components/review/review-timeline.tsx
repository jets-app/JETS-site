"use client";

import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  ArrowRight,
  MessageSquare,
} from "lucide-react";

interface TimelineEntry {
  id: string;
  type: "review" | "status_change";
  date: string | Date;
  userName: string;
  userRole: string;
  department: string | null;
  decision: string | null;
  comments: string | null;
}

interface ReviewTimelineProps {
  timeline: TimelineEntry[];
  currentStatus?: string;
}

const decisionConfig: Record<
  string,
  { icon: typeof CheckCircle2; color: string; label: string }
> = {
  APPROVED: {
    icon: CheckCircle2,
    color: "text-green-600",
    label: "Approved",
  },
  REJECTED: {
    icon: XCircle,
    color: "text-red-600",
    label: "Rejected",
  },
  NEEDS_INFO: {
    icon: AlertCircle,
    color: "text-yellow-600",
    label: "Needs More Info",
  },
  PENDING: {
    icon: Clock,
    color: "text-gray-400",
    label: "Pending",
  },
};

function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function roleLabel(role: string): string {
  const map: Record<string, string> = {
    ADMIN: "Office Admin",
    PRINCIPAL: "Principal",
    REVIEWER: "Reviewer",
    PARENT: "Parent",
  };
  return map[role] ?? role;
}

export function ReviewTimeline({
  timeline,
  currentStatus,
}: ReviewTimelineProps) {
  if (timeline.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">
          No review activity yet.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border" />

      <div className="space-y-4">
        {timeline.map((entry, index) => {
          const isLast = index === timeline.length - 1;

          if (entry.type === "review") {
            const config = decisionConfig[entry.decision ?? "PENDING"];
            const Icon = config?.icon ?? Clock;
            const color = config?.color ?? "text-gray-400";

            return (
              <div key={entry.id} className="relative flex gap-3 pl-0">
                <div
                  className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background ring-2 ring-border ${isLast ? "ring-primary" : ""}`}
                >
                  <Icon className={`h-4 w-4 ${color}`} />
                </div>
                <div
                  className={`flex-1 rounded-lg border p-3 ${isLast ? "border-primary/30 bg-primary/5" : ""}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {entry.userName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {roleLabel(entry.userRole)}
                      </span>
                    </div>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        entry.decision === "APPROVED"
                          ? "bg-green-100 text-green-700"
                          : entry.decision === "REJECTED"
                            ? "bg-red-100 text-red-700"
                            : entry.decision === "NEEDS_INFO"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {config?.label ?? entry.decision}
                    </span>
                  </div>
                  {entry.department && (
                    <p className="text-xs text-muted-foreground mb-1 capitalize">
                      {entry.department} review
                    </p>
                  )}
                  {entry.comments && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {entry.comments}
                    </p>
                  )}
                  <p className="text-[10px] text-muted-foreground mt-2">
                    {formatDate(entry.date)}
                  </p>
                </div>
              </div>
            );
          }

          // Status change entry
          return (
            <div key={entry.id} className="relative flex gap-3 pl-0">
              <div
                className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background ring-2 ring-border ${isLast ? "ring-primary" : ""}`}
              >
                <ArrowRight
                  className={`h-4 w-4 ${isLast ? "text-primary" : "text-muted-foreground"}`}
                />
              </div>
              <div
                className={`flex-1 rounded-lg border border-dashed p-3 ${isLast ? "border-primary/30 bg-primary/5" : "bg-muted/30"}`}
              >
                <p className="text-sm">{entry.comments}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">
                    {entry.userName}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {formatDate(entry.date)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
