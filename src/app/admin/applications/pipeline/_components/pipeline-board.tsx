"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { moveApplicationStatus } from "@/server/actions/admin.actions";
import type { ApplicationStatus } from "@prisma/client";

interface ApplicationCard {
  id: string;
  referenceNumber: string;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
  applicationFeePaid: boolean;
  completionPct: number;
  student: {
    firstName: string;
    lastName: string;
    photoUrl: string | null;
  } | null;
  parent: {
    name: string;
    email: string;
  };
  recommendations: { status: string }[];
}

const PIPELINE_COLUMNS: {
  status: ApplicationStatus;
  label: string;
  color: string;
  bgColor: string;
}[] = [
  { status: "DRAFT", label: "Started", color: "bg-slate-400", bgColor: "bg-slate-50 dark:bg-slate-900/30" },
  { status: "SUBMITTED", label: "Submitted", color: "bg-blue-500", bgColor: "bg-blue-50 dark:bg-blue-950/30" },
  { status: "OFFICE_REVIEW", label: "Office Review", color: "bg-amber-500", bgColor: "bg-amber-50 dark:bg-amber-950/30" },
  { status: "PRINCIPAL_REVIEW", label: "Principal Review", color: "bg-purple-500", bgColor: "bg-purple-50 dark:bg-purple-950/30" },
  { status: "INTERVIEW_SCHEDULED", label: "Interview", color: "bg-indigo-500", bgColor: "bg-indigo-50 dark:bg-indigo-950/30" },
  { status: "INTERVIEW_COMPLETED", label: "Interviewed", color: "bg-cyan-500", bgColor: "bg-cyan-50 dark:bg-cyan-950/30" },
  { status: "ACCEPTED", label: "Accepted", color: "bg-green-500", bgColor: "bg-green-50 dark:bg-green-950/30" },
  { status: "DOCUMENTS_PENDING", label: "Docs Pending", color: "bg-orange-500", bgColor: "bg-orange-50 dark:bg-orange-950/30" },
  { status: "ENROLLED", label: "Enrolled", color: "bg-emerald-500", bgColor: "bg-emerald-50 dark:bg-emerald-950/30" },
];

const TERMINAL_COLUMNS: {
  status: ApplicationStatus;
  label: string;
  color: string;
}[] = [
  { status: "WAITLISTED", label: "Waitlisted", color: "bg-yellow-500" },
  { status: "REJECTED", label: "Rejected", color: "bg-red-500" },
  { status: "WITHDRAWN", label: "Withdrawn", color: "bg-gray-500" },
];

export function PipelineBoard({
  grouped,
}: {
  grouped: Record<string, ApplicationCard[]>;
}) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [localGrouped, setLocalGrouped] = useState(grouped);
  const [error, setError] = useState<string | null>(null);

  function handleDragStart(e: React.DragEvent, appId: string) {
    setDraggingId(appId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", appId);
  }

  function handleDragOver(e: React.DragEvent, status: string) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumn(status);
  }

  function handleDragLeave() {
    setDragOverColumn(null);
  }

  function handleDrop(e: React.DragEvent, newStatus: ApplicationStatus) {
    e.preventDefault();
    const appId = e.dataTransfer.getData("text/plain");
    setDragOverColumn(null);
    setDraggingId(null);

    let sourceApp: ApplicationCard | null = null;
    let sourceStatus: string | null = null;
    for (const [status, apps] of Object.entries(localGrouped)) {
      const found = apps.find((a) => a.id === appId);
      if (found) {
        sourceApp = found;
        sourceStatus = status;
        break;
      }
    }

    if (!sourceApp || sourceStatus === newStatus) return;

    const updated = { ...localGrouped };
    updated[sourceStatus!] = (updated[sourceStatus!] || []).filter(
      (a) => a.id !== appId
    );
    const movedApp = { ...sourceApp, status: newStatus };
    updated[newStatus] = [movedApp, ...(updated[newStatus] || [])];
    setLocalGrouped(updated);
    setError(null);

    startTransition(async () => {
      const result = await moveApplicationStatus(appId, newStatus);
      if (!result.success) {
        setError(result.error ?? "Failed to move application");
        setLocalGrouped(grouped);
      }
    });
  }

  return (
    <div>
      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm dark:bg-red-950/30 dark:border-red-800 dark:text-red-400">
          {error}
        </div>
      )}

      <div
        className="flex gap-4 overflow-x-auto pb-6"
        style={{ minHeight: "calc(100vh - 240px)" }}
      >
        {PIPELINE_COLUMNS.map((col) => {
          const apps = localGrouped[col.status] || [];
          const isOver = dragOverColumn === col.status;

          return (
            <div
              key={col.status}
              className={`flex-shrink-0 w-72 rounded-xl border transition-colors ${
                isOver
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-border"
              } ${col.bgColor}`}
              onDragOver={(e) => handleDragOver(e, col.status)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.status)}
            >
              <div className="p-3 border-b border-border/50 flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${col.color}`} />
                <span className="text-sm font-semibold">{col.label}</span>
                <span className="ml-auto text-xs text-muted-foreground bg-background/80 px-2 py-0.5 rounded-full font-medium">
                  {apps.length}
                </span>
              </div>

              <div className="p-2 space-y-2 max-h-[calc(100vh-320px)] overflow-y-auto">
                {apps.map((app) => (
                  <KanbanCard
                    key={app.id}
                    app={app}
                    isDragging={draggingId === app.id}
                    onDragStart={(e) => handleDragStart(e, app.id)}
                    isPending={isPending}
                  />
                ))}
                {apps.length === 0 && (
                  <div className="py-8 text-center text-xs text-muted-foreground italic">
                    No applications
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Terminal statuses row */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {TERMINAL_COLUMNS.map((col) => {
          const apps = localGrouped[col.status] || [];
          return (
            <div
              key={col.status}
              className="rounded-xl border bg-card p-4"
              onDragOver={(e) => handleDragOver(e, col.status)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.status)}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-2 h-2 rounded-full ${col.color}`} />
                <span className="text-sm font-medium">{col.label}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {apps.length}
                </span>
              </div>
              {apps.length > 0 && (
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {apps.map((app) => (
                    <Link
                      key={app.id}
                      href={`/admin/applications/${app.id}`}
                      className="block text-xs text-muted-foreground hover:text-foreground truncate"
                    >
                      {app.student
                        ? `${app.student.firstName} ${app.student.lastName}`
                        : app.referenceNumber}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function KanbanCard({
  app,
  isDragging,
  onDragStart,
  isPending,
}: {
  app: ApplicationCard;
  isDragging: boolean;
  onDragStart: (e: React.DragEvent) => void;
  isPending: boolean;
}) {
  const recsCompleted = app.recommendations.filter(
    (r) => r.status === "COMPLETED"
  ).length;
  const recsTotal = app.recommendations.length;

  const studentName = app.student
    ? `${app.student.firstName} ${app.student.lastName}`
    : "No student info";

  const initials = app.student
    ? `${app.student.firstName[0]}${app.student.lastName[0]}`
    : "?";

  return (
    <div
      draggable={!isPending}
      onDragStart={onDragStart}
      className={`rounded-lg border bg-card p-3 cursor-grab active:cursor-grabbing transition-all hover:shadow-md ${
        isDragging ? "opacity-50 scale-95" : ""
      }`}
    >
      <Link
        href={`/admin/applications/${app.id}`}
        className="block"
        onClick={(e) => {
          if (isDragging) e.preventDefault();
        }}
      >
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{studentName}</p>
            <p className="text-xs text-muted-foreground truncate">
              {app.parent.name}
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
            {app.referenceNumber}
          </span>
          {app.applicationFeePaid && (
            <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded dark:bg-green-950/30">
              Paid
            </span>
          )}
          {recsTotal > 0 && (
            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              Recs {recsCompleted}/{recsTotal}
            </span>
          )}
        </div>

        {app.completionPct > 0 && app.completionPct < 100 && (
          <div className="mt-2">
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${app.completionPct}%` }}
              />
            </div>
          </div>
        )}
      </Link>
    </div>
  );
}
