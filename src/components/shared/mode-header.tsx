import { cn } from "@/lib/utils";
import { FileText, School } from "lucide-react";

interface ModeHeaderProps {
  mode: "admissions" | "school_year";
  section: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function ModeHeader({
  mode,
  section,
  title,
  description,
  actions,
}: ModeHeaderProps) {
  const isAdmissions = mode === "admissions";
  const Icon = isAdmissions ? FileText : School;
  const modeLabel = isAdmissions ? "Admissions" : "School Year";

  return (
    <div className="space-y-3">
      <div
        className={cn(
          "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold",
          isAdmissions
            ? "bg-primary/10 text-primary"
            : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
        )}
      >
        <Icon className="h-3.5 w-3.5" />
        <span>{modeLabel}</span>
        <span className="text-muted-foreground">/</span>
        <span>{section}</span>
      </div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
