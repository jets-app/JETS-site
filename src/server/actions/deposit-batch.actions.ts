"use server";

import { db } from "@/server/db";
import { auth } from "@/server/auth";
import { revalidatePath } from "next/cache";
import { isStaff, isFullAdmin } from "@/lib/roles";
import {
  fetchQbAccounts,
  createQbDeposit,
  type QbAccountLite,
} from "@/lib/quickbooks";
import type { Prisma } from "@prisma/client";

async function requireStaff() {
  const session = await auth();
  if (!session?.user || !isStaff(session.user.role)) {
    return { error: "Staff access required." as const };
  }
  return { session };
}

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || !isFullAdmin(session.user.role)) {
    return { error: "Admin access required." as const };
  }
  return { session };
}

// ==================== Settings: QBO mapping ====================

export interface CategoryAccountMap {
  [paymentType: string]: { accountId: string; accountName: string } | undefined;
}

export interface QbBatchSettings {
  qbBatchMode: "auto" | "manual";
  qbStripeDepositAccountId: string | null;
  qbStripeDepositAccountName: string | null;
  qbCheckDepositAccountId: string | null;
  qbCheckDepositAccountName: string | null;
  qbCategoryAccountMap: CategoryAccountMap;
  qbAccountsLastRefreshedAt: Date | null;
}

export async function getQbBatchSettings(): Promise<QbBatchSettings | { error: string }> {
  const check = await requireStaff();
  if ("error" in check) return { error: check.error as string };

  const s = await db.systemSettings.findUnique({
    where: { id: "settings" },
    select: {
      qbBatchMode: true,
      qbStripeDepositAccountId: true,
      qbStripeDepositAccountName: true,
      qbCheckDepositAccountId: true,
      qbCheckDepositAccountName: true,
      qbCategoryAccountMap: true,
      qbAccountsLastRefreshedAt: true,
    },
  });

  return {
    qbBatchMode: (s?.qbBatchMode as "auto" | "manual") ?? "manual",
    qbStripeDepositAccountId: s?.qbStripeDepositAccountId ?? null,
    qbStripeDepositAccountName: s?.qbStripeDepositAccountName ?? null,
    qbCheckDepositAccountId: s?.qbCheckDepositAccountId ?? null,
    qbCheckDepositAccountName: s?.qbCheckDepositAccountName ?? null,
    qbCategoryAccountMap:
      (s?.qbCategoryAccountMap as CategoryAccountMap | null) ?? {},
    qbAccountsLastRefreshedAt: s?.qbAccountsLastRefreshedAt ?? null,
  };
}

export async function refreshQbAccounts(): Promise<
  { accounts: QbAccountLite[] } | { error: string }
> {
  const check = await requireAdmin();
  if ("error" in check) return { error: check.error as string };

  try {
    const accounts = await fetchQbAccounts();
    await db.systemSettings.update({
      where: { id: "settings" },
      data: { qbAccountsLastRefreshedAt: new Date() },
    });
    return { accounts };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to fetch accounts.";
    return { error: msg };
  }
}

export async function updateQbBatchSettings(input: {
  qbBatchMode?: "auto" | "manual";
  qbStripeDepositAccountId?: string | null;
  qbStripeDepositAccountName?: string | null;
  qbCheckDepositAccountId?: string | null;
  qbCheckDepositAccountName?: string | null;
  qbCategoryAccountMap?: CategoryAccountMap;
}) {
  const check = await requireAdmin();
  if ("error" in check) return { error: check.error as string };

  const data: Record<string, unknown> = {};
  if (input.qbBatchMode !== undefined) data.qbBatchMode = input.qbBatchMode;
  if (input.qbStripeDepositAccountId !== undefined)
    data.qbStripeDepositAccountId = input.qbStripeDepositAccountId;
  if (input.qbStripeDepositAccountName !== undefined)
    data.qbStripeDepositAccountName = input.qbStripeDepositAccountName;
  if (input.qbCheckDepositAccountId !== undefined)
    data.qbCheckDepositAccountId = input.qbCheckDepositAccountId;
  if (input.qbCheckDepositAccountName !== undefined)
    data.qbCheckDepositAccountName = input.qbCheckDepositAccountName;
  if (input.qbCategoryAccountMap !== undefined)
    data.qbCategoryAccountMap = input.qbCategoryAccountMap as Prisma.InputJsonValue;

  await db.systemSettings.upsert({
    where: { id: "settings" },
    update: data as Prisma.SystemSettingsUncheckedUpdateInput,
    create: { id: "settings", ...data } as Prisma.SystemSettingsUncheckedCreateInput,
  });

  revalidatePath("/admin/settings/quickbooks");
  return { success: true };
}

// ==================== Batches: list / detail ====================

export async function listBatches(opts?: { source?: "stripe" | "check" }) {
  const check = await requireStaff();
  if ("error" in check) return { error: check.error as string };

  const batches = await db.depositBatch.findMany({
    where: opts?.source ? { source: opts.source } : undefined,
    orderBy: [{ status: "asc" }, { depositDate: "desc" }],
    take: 100,
    include: {
      _count: { select: { payments: true } },
    },
  });

  return { batches };
}

export async function getBatchDetail(batchId: string) {
  const check = await requireStaff();
  if ("error" in check) return { error: check.error as string };

  const batch = await db.depositBatch.findUnique({
    where: { id: batchId },
    include: {
      payments: {
        orderBy: { paidAt: "desc" },
        include: {
          application: {
            include: {
              student: { select: { firstName: true, lastName: true } },
              parent: { select: { name: true } },
            },
          },
        },
      },
    },
  });
  if (!batch) return { error: "Batch not found." };

  // Aggregate by category for the Deposit line preview
  const byCategory = new Map<string, number>();
  for (const p of batch.payments) {
    const key = p.type;
    byCategory.set(key, (byCategory.get(key) ?? 0) + p.amount);
  }

  const categories = Array.from(byCategory.entries())
    .map(([type, total]) => ({ type, total }))
    .sort((a, b) => b.total - a.total);

  return { batch, categories };
}

// ==================== Open checks (not yet in a batch) ====================

export async function listOpenChecks() {
  const check = await requireStaff();
  if ("error" in check) return { error: check.error as string };

  const payments = await db.payment.findMany({
    where: {
      method: "check",
      status: "SUCCEEDED",
      batchId: null,
    },
    orderBy: { paidAt: "desc" },
    include: {
      application: {
        include: {
          student: { select: { firstName: true, lastName: true } },
          parent: { select: { name: true } },
        },
      },
    },
  });

  return { payments };
}

// ==================== Create a check deposit batch ====================

export async function createCheckBatch(input: {
  paymentIds: string[];
  depositDate: Date;
  notes?: string;
}) {
  const check = await requireStaff();
  if ("error" in check) return { error: check.error as string };

  if (input.paymentIds.length === 0) {
    return { error: "Pick at least one check." };
  }

  const payments = await db.payment.findMany({
    where: {
      id: { in: input.paymentIds },
      method: "check",
      status: "SUCCEEDED",
      batchId: null,
    },
  });
  if (payments.length === 0) {
    return { error: "None of the selected checks are eligible." };
  }

  const totalCents = payments.reduce((s, p) => s + p.amount, 0);

  const batch = await db.$transaction(async (tx) => {
    const b = await tx.depositBatch.create({
      data: {
        source: "check",
        status: "pending",
        depositDate: input.depositDate,
        totalCents,
        notes: input.notes ?? null,
      },
    });
    await tx.payment.updateMany({
      where: { id: { in: payments.map((p) => p.id) } },
      data: { batchId: b.id },
    });
    return b;
  });

  revalidatePath("/admin/billing/batches");
  return { success: true, batchId: batch.id };
}

// ==================== Post a batch to QBO ====================

export async function postBatchToQb(batchId: string) {
  const check = await requireAdmin();
  if ("error" in check) return { error: check.error as string };

  const batch = await db.depositBatch.findUnique({
    where: { id: batchId },
    include: { payments: true },
  });
  if (!batch) return { error: "Batch not found." };
  if (batch.status === "posted") return { error: "Already posted." };

  const settings = await db.systemSettings.findUnique({
    where: { id: "settings" },
    select: {
      qbStripeDepositAccountId: true,
      qbStripeDepositAccountName: true,
      qbCheckDepositAccountId: true,
      qbCheckDepositAccountName: true,
      qbCategoryAccountMap: true,
    },
  });

  const depositAccountId =
    batch.source === "stripe"
      ? settings?.qbStripeDepositAccountId
      : settings?.qbCheckDepositAccountId;
  if (!depositAccountId) {
    return {
      error: `No QuickBooks deposit account configured for ${batch.source} batches. Set it under Settings → QuickBooks.`,
    };
  }

  const map =
    (settings?.qbCategoryAccountMap as CategoryAccountMap | null) ?? {};

  // Aggregate payments by type, build a deposit line per category.
  const totals = new Map<string, number>();
  for (const p of batch.payments) {
    totals.set(p.type, (totals.get(p.type) ?? 0) + p.amount);
  }

  const missing: string[] = [];
  const lines = Array.from(totals.entries()).map(([type, amount]) => {
    const m = map[type];
    if (!m?.accountId) {
      missing.push(type);
      return null;
    }
    return {
      accountId: m.accountId,
      accountName: m.accountName,
      amountCents: amount,
      description: `${type.replace(/_/g, " ")} — JETS batch ${batch.id.slice(0, 8)}`,
    };
  });

  if (missing.length > 0) {
    return {
      error: `Map these categories to QBO income accounts first: ${missing.join(", ")}`,
    };
  }

  try {
    const result = await createQbDeposit({
      depositDate: batch.depositDate,
      depositToAccountId: depositAccountId,
      lines: lines.filter((l): l is NonNullable<typeof l> => l !== null),
      privateNote: `JETS deposit batch ${batch.id} (${batch.source}) — ${batch.payments.length} payments`,
    });

    await db.depositBatch.update({
      where: { id: batch.id },
      data: {
        status: "posted",
        qbDepositId: result.id,
        qbPostedAt: new Date(),
        qbError: null,
      },
    });

    revalidatePath("/admin/billing/batches");
    return { success: true, qbDepositId: result.id };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "QuickBooks post failed.";
    await db.depositBatch.update({
      where: { id: batch.id },
      data: { status: "failed", qbError: msg },
    });
    return { error: msg };
  }
}
