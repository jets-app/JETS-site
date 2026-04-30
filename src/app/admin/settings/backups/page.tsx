import { auth } from "@/server/auth";
import { isFounder } from "@/lib/roles";
import { redirect } from "next/navigation";
import { BackupTrigger } from "./_components/backup-trigger";
import { Database, Clock, ShieldCheck } from "lucide-react";

export const metadata = { title: "Database Backups — JETS Admin" };

export default async function BackupsPage() {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== "ADMIN" && !isFounder(session.user.email ?? null))
  ) {
    redirect("/dashboard");
  }

  const bucketName = process.env.AWS_S3_BUCKET ?? "(not configured)";
  const region = process.env.AWS_REGION ?? "us-west-1";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Database Backups</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Off-platform protection for the JETS database.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6 space-y-4">
        <h2 className="font-semibold flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          Schedule
        </h2>
        <p className="text-sm text-muted-foreground">
          A full backup runs <strong>every day at 3:00 AM Pacific</strong> automatically. You don&apos;t need to do anything — it just happens.
        </p>
        <ul className="text-sm space-y-2 text-muted-foreground">
          <li className="flex gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Each backup is a gzipped JSON dump of every table, encrypted at rest.</span>
          </li>
          <li className="flex gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Backups older than 30 days are automatically deleted (lifecycle rule on the bucket).</span>
          </li>
          <li className="flex gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Stored in AWS S3 — completely separate from Neon (the database host) so a Neon outage doesn&apos;t take backups with it.</span>
          </li>
        </ul>
      </div>

      <div className="rounded-xl border bg-card p-6 space-y-4">
        <h2 className="font-semibold flex items-center gap-2">
          <Database className="h-4 w-4 text-primary" />
          Run a backup now
        </h2>
        <p className="text-sm text-muted-foreground">
          Useful before risky changes (schema migration, large data import) so you have a known-good rollback point. Takes about 10–60 seconds depending on size.
        </p>
        <BackupTrigger />
      </div>

      <div className="rounded-xl border bg-card p-6 space-y-3">
        <h2 className="font-semibold">Storage details</h2>
        <dl className="text-sm grid grid-cols-[max-content_1fr] gap-x-6 gap-y-2">
          <dt className="text-muted-foreground">Bucket</dt>
          <dd className="font-mono">{bucketName}</dd>
          <dt className="text-muted-foreground">Region</dt>
          <dd className="font-mono">{region}</dd>
          <dt className="text-muted-foreground">Retention</dt>
          <dd>30 days (auto-delete via S3 lifecycle rule)</dd>
          <dt className="text-muted-foreground">Encryption</dt>
          <dd>AES-256 server-side (SSE-S3)</dd>
        </dl>
      </div>
    </div>
  );
}
