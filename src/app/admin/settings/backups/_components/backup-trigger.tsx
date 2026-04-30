"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, AlertCircle, Database } from "lucide-react";
import { triggerDatabaseBackup } from "@/server/actions/backup.actions";

interface BackupResult {
  success: boolean;
  key?: string;
  sizeBytes?: number;
  rowCount?: number;
  durationMs?: number;
  error?: string;
}

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
}

export function BackupTrigger() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<BackupResult | null>(null);

  function run() {
    setResult(null);
    startTransition(async () => {
      const r = await triggerDatabaseBackup();
      setResult(r as BackupResult);
    });
  }

  return (
    <div className="space-y-3">
      <Button onClick={run} disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Backing up — this takes a moment
          </>
        ) : (
          <>
            <Database className="mr-2 h-4 w-4" />
            Run backup now
          </>
        )}
      </Button>

      {result?.success && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm space-y-1">
          <div className="flex items-center gap-2 font-medium text-emerald-900">
            <CheckCircle2 className="h-4 w-4" />
            Backup complete
          </div>
          <div className="text-emerald-800 text-xs grid grid-cols-[max-content_1fr] gap-x-3 gap-y-0.5">
            <span className="text-emerald-700">Key:</span>
            <span className="font-mono break-all">{result.key}</span>
            <span className="text-emerald-700">Size:</span>
            <span>{result.sizeBytes ? formatBytes(result.sizeBytes) : "—"}</span>
            <span className="text-emerald-700">Rows:</span>
            <span>{result.rowCount?.toLocaleString() ?? "—"}</span>
            <span className="text-emerald-700">Duration:</span>
            <span>{result.durationMs ? `${(result.durationMs / 1000).toFixed(1)}s` : "—"}</span>
          </div>
        </div>
      )}

      {result?.success === false && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm">
          <div className="flex items-center gap-2 font-medium text-destructive">
            <AlertCircle className="h-4 w-4" />
            Backup failed
          </div>
          <p className="mt-1 text-xs text-destructive/80">{result.error}</p>
        </div>
      )}
    </div>
  );
}
