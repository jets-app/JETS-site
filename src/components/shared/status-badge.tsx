import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ApplicationStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "OFFICE_REVIEW"
  | "PRINCIPAL_REVIEW"
  | "INTERVIEW_SCHEDULED"
  | "INTERVIEW_COMPLETED"
  | "ACCEPTED"
  | "DOCUMENTS_PENDING"
  | "SCHOLARSHIP_REVIEW"
  | "ENROLLED"
  | "REJECTED"
  | "WAITLISTED"
  | "WITHDRAWN";

const statusConfig: Record<
  ApplicationStatus,
  { label: string; className: string }
> = {
  DRAFT: {
    label: "Draft",
    className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  },
  SUBMITTED: {
    label: "Submitted",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  },
  OFFICE_REVIEW: {
    label: "Office Review",
    className:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  },
  PRINCIPAL_REVIEW: {
    label: "Principal Review",
    className:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  },
  INTERVIEW_SCHEDULED: {
    label: "Interview Scheduled",
    className:
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  },
  INTERVIEW_COMPLETED: {
    label: "Interview Completed",
    className: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
  },
  ACCEPTED: {
    label: "Accepted",
    className:
      "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  },
  DOCUMENTS_PENDING: {
    label: "Documents Pending",
    className:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  },
  SCHOLARSHIP_REVIEW: {
    label: "Scholarship Review",
    className: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
  },
  ENROLLED: {
    label: "Enrolled",
    className:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  },
  WAITLISTED: {
    label: "Waitlisted",
    className:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  },
  WITHDRAWN: {
    label: "Withdrawn",
    className: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
  },
};

interface StatusBadgeProps {
  status: ApplicationStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] ?? {
    label: status,
    className: "bg-gray-100 text-gray-700",
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "border-transparent font-medium",
        config.className,
        className
      )}
    >
      {config.label}
    </Badge>
  );
}

export function getStatusLabel(status: ApplicationStatus): string {
  return statusConfig[status]?.label ?? status;
}
