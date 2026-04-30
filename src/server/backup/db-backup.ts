import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { gzipSync } from "zlib";
import { db } from "@/server/db";

/**
 * Off-platform backup of the JETS Postgres database.
 *
 * Strategy: dump every Prisma model as JSON, gzip, upload to S3. Not as
 * efficient as pg_dump (which Vercel functions don't have), but durable and
 * trivially restorable — a single JSON file with everything in it.
 *
 * Restore is via `scripts/restore-from-backup.ts` (TODO when needed): reads
 * the JSON, inserts row-by-row via Prisma in dependency order.
 *
 * Storage cost on free tier: ~50MB/day × 30 days = 1.5GB, all under the 5GB
 * AWS free tier. After year 1 it's about $0.04/month.
 */

// All Prisma model names (as the camelCase Prisma client property) we want
// to back up. Names MUST match `db.<name>` — a typo here means the model is
// silently skipped at backup time. Cross-check against:
//   grep "^model " prisma/schema.prisma
const MODELS_TO_BACKUP = [
  // Auth / user
  "user",
  "account",
  "session",
  "verificationToken",
  "passwordResetToken",
  "emailChangeRequest",
  "loginEvent",
  "auditLog",
  // Admissions / pipeline
  "inquiry",
  "application",
  "applicationNote",
  "applicationReview",
  "student",
  "recommendation",
  "interviewAvailability",
  // Documents
  "documentTemplate",
  "document",
  // Billing / payments
  "discountCode",
  "scholarshipApplication",
  "tuitionAssessment",
  "invoice",
  "payment",
  "paymentMethod",
  "autoPaySettings",
  // Communications
  "message",
  "messageTemplate",
  "notificationLog",
  "notificationTemplate",
  // Alumni
  "alumni",
  "alumniEvent",
  "eventRsvp",
  "jobPosting",
  "mentorProfile",
  "mentorshipMatch",
  // Donors
  "donor",
  "donation",
  "donorLetterTemplate",
  "donorReceipt",
  // System
  "systemSettings",
  "quickBooksSync",
] as const;

type Model = (typeof MODELS_TO_BACKUP)[number];

// Construct lazily — Next.js evaluates module top-level code at build time,
// and the S3 SDK throws "Region is missing" if env vars aren't set during a
// preview build with no AWS config.
function getS3Client() {
  return new S3Client({
    region: process.env.AWS_REGION ?? "us-west-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });
}

export interface BackupResult {
  success: boolean;
  key?: string;
  sizeBytes?: number;
  rowCount?: number;
  durationMs?: number;
  error?: string;
}

export async function runDatabaseBackup(): Promise<BackupResult> {
  const start = Date.now();
  const bucket = process.env.AWS_S3_BUCKET;
  if (!bucket) {
    return { success: false, error: "AWS_S3_BUCKET env var not set." };
  }
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    return {
      success: false,
      error:
        "AWS credentials not configured (set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY).",
    };
  }

  try {
    const dump: Record<string, unknown[]> = {};
    let totalRows = 0;

    for (const model of MODELS_TO_BACKUP) {
      // The Prisma client exposes models as lower-camelCase properties on db.
      const table = (db as unknown as Record<Model, { findMany: () => Promise<unknown[]> }>)[model];
      if (!table) {
        console.warn(`[db-backup] Skipping unknown model: ${model}`);
        continue;
      }
      const rows = await table.findMany();
      dump[model] = rows;
      totalRows += rows.length;
    }

    const payload = JSON.stringify(
      {
        backupVersion: 1,
        exportedAt: new Date().toISOString(),
        appVersion: process.env.VERCEL_GIT_COMMIT_SHA ?? "unknown",
        rowCount: totalRows,
        models: dump,
      },
      // Date and Decimal need a stringifier since JSON.stringify doesn't
      // natively handle them safely
      (_key, value) => {
        if (value instanceof Date) return value.toISOString();
        if (typeof value === "bigint") return value.toString();
        return value;
      },
    );

    const compressed = gzipSync(Buffer.from(payload, "utf8"));
    const datestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const key = `backups/jets-${datestamp}.json.gz`;

    await getS3Client().send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: compressed,
        ContentType: "application/gzip",
        ContentEncoding: "gzip",
        Metadata: {
          rowCount: String(totalRows),
          appVersion: process.env.VERCEL_GIT_COMMIT_SHA ?? "unknown",
        },
        // Server-side encryption at rest (the bucket has SSE-S3 by default
        // but explicitly request it on each upload as belt and suspenders)
        ServerSideEncryption: "AES256",
      }),
    );

    return {
      success: true,
      key,
      sizeBytes: compressed.length,
      rowCount: totalRows,
      durationMs: Date.now() - start,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[db-backup] failed:", err);
    return {
      success: false,
      error: message,
      durationMs: Date.now() - start,
    };
  }
}
