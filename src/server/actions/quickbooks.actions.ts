"use server";

import { db } from "@/server/db";
import { auth } from "@/server/auth";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import {
  isMockMode,
  isQuickBooksConfigured,
  getOAuthClient,
  getQBClient,
  qbCall,
  loadTokenState,
  saveTokens,
  clearTokens,
  QB_SCOPES,
  QB_REDIRECT_URI,
} from "@/lib/quickbooks";

// ==================== Auth Helper ====================
async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { error: "Admin access required." as const };
  }
  return { session };
}

// ==================== OAuth State (CSRF protection) ====================
const OAUTH_STATE_COOKIE = "jets-qb-oauth-state";
const OAUTH_STATE_TTL_SECONDS = 60 * 10; // 10 min — long enough to complete OAuth

async function issueOAuthState(): Promise<string> {
  const state = randomBytes(32).toString("base64url");
  const jar = await cookies();
  jar.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: OAUTH_STATE_TTL_SECONDS,
  });
  return state;
}

async function consumeOAuthState(provided: string | undefined): Promise<boolean> {
  if (!provided) return false;
  const jar = await cookies();
  const stored = jar.get(OAUTH_STATE_COOKIE)?.value;
  jar.delete(OAUTH_STATE_COOKIE);
  if (!stored) return false;
  // Constant-time comparison to avoid timing attacks (overkill for this length
  // but cheap and good practice).
  if (stored.length !== provided.length) return false;
  let mismatch = 0;
  for (let i = 0; i < stored.length; i++) {
    mismatch |= stored.charCodeAt(i) ^ provided.charCodeAt(i);
  }
  return mismatch === 0;
}

// ==================== Status ====================
export async function getQuickBooksStatus() {
  const check = await requireAdmin();
  if ("error" in check) {
    return { error: check.error };
  }
  const state = await loadTokenState();
  return {
    connected: state.connected,
    mockMode: isMockMode(),
    configured: isQuickBooksConfigured(),
    companyName: state.companyName,
    realmId: state.realmId,
    lastSync: state.lastSyncAt,
    tokenExpiresAt: state.expiresAt,
    autoSyncInvoices: state.autoSyncInvoices,
    autoSyncPayments: state.autoSyncPayments,
    autoSyncCustomers: state.autoSyncCustomers,
  };
}

// ==================== Authorization URL ====================
export async function getAuthorizationUrl() {
  const check = await requireAdmin();
  if ("error" in check) return check;

  if (isMockMode()) {
    return {
      mockMode: true as const,
      url: null,
      message: "QuickBooks credentials not configured — use mock connect.",
    };
  }

  const oauth = getOAuthClient() as
    | { authorizeUri: (opts: { scope: string[]; state: string }) => string }
    | null;

  if (!oauth) {
    return { error: "QuickBooks OAuth client unavailable." };
  }

  const state = await issueOAuthState();
  const url = oauth.authorizeUri({
    scope: QB_SCOPES,
    state,
  });

  return { url, mockMode: false as const };
}

// ==================== Mock Connect (dev-only) ====================
export async function mockConnectQuickBooks() {
  const check = await requireAdmin();
  if ("error" in check) return check;

  if (!isMockMode()) {
    return { error: "Mock connect is only available when QB is not configured." };
  }

  await saveTokens({
    accessToken: "mock-access-token",
    refreshToken: "mock-refresh-token",
    realmId: "MOCK_REALM_1234567890",
    expiresInSeconds: 60 * 60, // 1 hour
    companyName: "JETS School (Mock Sandbox)",
  });

  revalidatePath("/admin/settings/quickbooks");
  return { success: true, mockMode: true as const };
}

// ==================== OAuth Callback ====================
export async function handleOAuthCallback(params: {
  code: string;
  realmId: string;
  state?: string;
  fullUrl?: string;
}) {
  // Auth check — only an admin can finalize a QuickBooks connection. The
  // state cookie below pins the OAuth flow to a specific admin session.
  const check = await requireAdmin();
  if ("error" in check) return { error: check.error };

  // CSRF: verify the `state` we issued is the one that came back. Without
  // this an attacker could redirect a logged-in admin's browser to an attacker-
  // controlled QuickBooks account's authorization URL.
  const stateOk = await consumeOAuthState(params.state);
  if (!stateOk) {
    return { error: "Invalid OAuth state — please try connecting again." };
  }

  if (!isQuickBooksConfigured()) {
    return { error: "QuickBooks not configured." };
  }

  const oauth = getOAuthClient() as
    | {
        createToken: (url: string) => Promise<{
          token: {
            access_token: string;
            refresh_token: string;
            expires_in: number;
            realmId?: string;
          };
        }>;
      }
    | null;

  if (!oauth) {
    return { error: "QuickBooks OAuth client unavailable." };
  }

  try {
    const url =
      params.fullUrl ??
      `${QB_REDIRECT_URI}?code=${encodeURIComponent(params.code)}&realmId=${encodeURIComponent(params.realmId)}${params.state ? `&state=${encodeURIComponent(params.state)}` : ""}`;

    const resp = await oauth.createToken(url);
    const token = resp.token;

    await saveTokens({
      accessToken: token.access_token,
      refreshToken: token.refresh_token,
      realmId: params.realmId,
      expiresInSeconds: token.expires_in,
      companyName: null,
    });

    // Try to pull company info for display
    try {
      const qbo = await getQBClient();
      if (qbo) {
        const info = await qbCall<{ CompanyName?: string }>(
          qbo,
          "getCompanyInfo",
          params.realmId
        );
        if (info?.CompanyName) {
          await db.systemSettings.update({
            where: { id: "settings" },
            data: { qbCompanyName: info.CompanyName },
          });
        }
      }
    } catch (err) {
      console.warn("[quickbooks] Could not fetch company info:", err);
    }

    return { success: true };
  } catch (err) {
    console.error("[quickbooks] OAuth callback failed:", err);
    return { error: "Failed to complete QuickBooks authorization." };
  }
}

// ==================== Disconnect ====================
export async function disconnectQuickBooks() {
  const check = await requireAdmin();
  if ("error" in check) return check;

  await clearTokens();
  revalidatePath("/admin/settings/quickbooks");
  return { success: true };
}

// ==================== Update Auto-Sync Settings ====================
export async function updateQuickBooksSettings(settings: {
  autoSyncInvoices?: boolean;
  autoSyncPayments?: boolean;
  autoSyncCustomers?: boolean;
}) {
  const check = await requireAdmin();
  if ("error" in check) return check;

  const data: Record<string, boolean> = {};
  if (settings.autoSyncInvoices !== undefined) data.qbAutoSyncInvoices = settings.autoSyncInvoices;
  if (settings.autoSyncPayments !== undefined) data.qbAutoSyncPayments = settings.autoSyncPayments;
  if (settings.autoSyncCustomers !== undefined) data.qbAutoSyncCustomers = settings.autoSyncCustomers;

  await db.systemSettings.upsert({
    where: { id: "settings" },
    update: data,
    create: { id: "settings", ...data },
  });

  revalidatePath("/admin/settings/quickbooks");
  return { success: true };
}

// ==================== Sync: Customer ====================
export async function syncCustomerToQuickBooks(userId: string) {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, phone: true },
    });
    if (!user) return { error: "User not found." };

    const state = await loadTokenState();

    // Check for existing sync
    const existing = await db.quickBooksSync.findFirst({
      where: { entityType: "customer", entityId: userId },
      orderBy: { createdAt: "desc" },
    });

    if (isMockMode() || !state.connected) {
      console.log(`[quickbooks:mock] Sync customer ${user.email}`);
      const rec = await db.quickBooksSync.create({
        data: {
          entityType: "customer",
          entityId: userId,
          qbId: existing?.qbId ?? `MOCK-CUST-${userId.slice(0, 8)}`,
          status: "mock",
          syncedAt: new Date(),
        },
      });
      return { success: true, mock: true, sync: rec };
    }

    const qbo = await getQBClient();
    if (!qbo) return { error: "QuickBooks client unavailable." };

    const [firstName, ...rest] = user.name.split(" ");
    const lastName = rest.join(" ") || "Parent";

    const payload = {
      DisplayName: user.name || user.email,
      GivenName: firstName || user.name,
      FamilyName: lastName,
      PrimaryEmailAddr: { Address: user.email },
      PrimaryPhone: user.phone ? { FreeFormNumber: user.phone } : undefined,
    };

    let qbId = existing?.qbId ?? null;
    try {
      if (qbId) {
        const current = await qbCall<{ Id: string; SyncToken: string }>(
          qbo,
          "getCustomer",
          qbId
        );
        const updated = await qbCall<{ Id: string }>(qbo, "updateCustomer", {
          ...payload,
          Id: current.Id,
          SyncToken: current.SyncToken,
          sparse: true,
        });
        qbId = updated.Id;
      } else {
        const created = await qbCall<{ Id: string }>(qbo, "createCustomer", payload);
        qbId = created.Id;
      }

      const rec = await db.quickBooksSync.create({
        data: {
          entityType: "customer",
          entityId: userId,
          qbId,
          status: "success",
          syncedAt: new Date(),
        },
      });
      await db.systemSettings.update({
        where: { id: "settings" },
        data: { qbLastSyncAt: new Date() },
      });
      return { success: true, sync: rec };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      const rec = await db.quickBooksSync.create({
        data: {
          entityType: "customer",
          entityId: userId,
          status: "failed",
          errorMsg,
        },
      });
      return { error: errorMsg, sync: rec };
    }
  } catch (err) {
    console.error("[quickbooks] syncCustomer error:", err);
    return { error: "Sync failed." };
  }
}

// ==================== Sync: Invoice ====================
export async function syncInvoiceToQuickBooks(invoiceId: string) {
  try {
    const invoice = await db.invoice.findUnique({ where: { id: invoiceId } });
    if (!invoice) return { error: "Invoice not found." };

    const state = await loadTokenState();

    const existing = await db.quickBooksSync.findFirst({
      where: { entityType: "invoice", entityId: invoiceId },
      orderBy: { createdAt: "desc" },
    });

    if (isMockMode() || !state.connected) {
      console.log(`[quickbooks:mock] Sync invoice ${invoice.invoiceNumber}`);
      const rec = await db.quickBooksSync.create({
        data: {
          entityType: "invoice",
          entityId: invoiceId,
          qbId: existing?.qbId ?? `MOCK-INV-${invoiceId.slice(0, 8)}`,
          status: "mock",
          syncedAt: new Date(),
        },
      });
      return { success: true, mock: true, sync: rec };
    }

    // Ensure customer synced first
    const custResult = await syncCustomerToQuickBooks(invoice.parentId);
    if ("error" in custResult || !custResult.sync?.qbId) {
      return { error: "Customer must be synced before invoice." };
    }
    const customerQbId = custResult.sync.qbId;

    const qbo = await getQBClient();
    if (!qbo) return { error: "QuickBooks client unavailable." };

    type RawLine = { description?: string; quantity?: number; unitPrice?: number; total?: number };
    const lineItems = (invoice.lineItems as unknown as RawLine[]) ?? [];

    const Line = lineItems.map((li, idx) => ({
      Id: String(idx + 1),
      LineNum: idx + 1,
      DetailType: "SalesItemLineDetail",
      Amount: (li.total ?? 0) / 100,
      Description: li.description ?? "Line item",
      SalesItemLineDetail: {
        Qty: li.quantity ?? 1,
        UnitPrice: (li.unitPrice ?? 0) / 100,
      },
    }));

    const payload = {
      CustomerRef: { value: customerQbId },
      DocNumber: invoice.invoiceNumber,
      DueDate: invoice.dueDate.toISOString().slice(0, 10),
      Line,
      TxnTaxDetail: invoice.tax
        ? { TotalTax: invoice.tax / 100 }
        : undefined,
    };

    let qbId = existing?.qbId ?? null;
    try {
      if (qbId) {
        const current = await qbCall<{ Id: string; SyncToken: string }>(
          qbo,
          "getInvoice",
          qbId
        );
        const updated = await qbCall<{ Id: string }>(qbo, "updateInvoice", {
          ...payload,
          Id: current.Id,
          SyncToken: current.SyncToken,
          sparse: true,
        });
        qbId = updated.Id;
      } else {
        const created = await qbCall<{ Id: string }>(qbo, "createInvoice", payload);
        qbId = created.Id;
      }

      const rec = await db.quickBooksSync.create({
        data: {
          entityType: "invoice",
          entityId: invoiceId,
          qbId,
          status: "success",
          syncedAt: new Date(),
        },
      });
      await db.systemSettings.update({
        where: { id: "settings" },
        data: { qbLastSyncAt: new Date() },
      });
      return { success: true, sync: rec };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      const rec = await db.quickBooksSync.create({
        data: {
          entityType: "invoice",
          entityId: invoiceId,
          status: "failed",
          errorMsg,
        },
      });
      return { error: errorMsg, sync: rec };
    }
  } catch (err) {
    console.error("[quickbooks] syncInvoice error:", err);
    return { error: "Sync failed." };
  }
}

// ==================== Sync: Payment ====================
export async function syncPaymentToQuickBooks(paymentId: string) {
  try {
    const payment = await db.payment.findUnique({
      where: { id: paymentId },
      include: {
        application: { select: { parentId: true } },
      },
    });
    if (!payment) return { error: "Payment not found." };

    const state = await loadTokenState();

    const existing = await db.quickBooksSync.findFirst({
      where: { entityType: "payment", entityId: paymentId },
      orderBy: { createdAt: "desc" },
    });

    if (isMockMode() || !state.connected) {
      console.log(`[quickbooks:mock] Sync payment ${paymentId}`);
      const rec = await db.quickBooksSync.create({
        data: {
          entityType: "payment",
          entityId: paymentId,
          qbId: existing?.qbId ?? `MOCK-PMT-${paymentId.slice(0, 8)}`,
          status: "mock",
          syncedAt: new Date(),
        },
      });
      return { success: true, mock: true, sync: rec };
    }

    const parentId = payment.application?.parentId;
    if (!parentId) return { error: "Payment has no associated parent to sync." };

    const custResult = await syncCustomerToQuickBooks(parentId);
    if ("error" in custResult || !custResult.sync?.qbId) {
      return { error: "Customer must be synced before payment." };
    }
    const customerQbId = custResult.sync.qbId;

    const qbo = await getQBClient();
    if (!qbo) return { error: "QuickBooks client unavailable." };

    const payload = {
      CustomerRef: { value: customerQbId },
      TotalAmt: payment.amount / 100,
      TxnDate: (payment.paidAt ?? payment.createdAt).toISOString().slice(0, 10),
      PrivateNote: payment.description ?? `Payment ${payment.id}`,
    };

    let qbId = existing?.qbId ?? null;
    try {
      if (!qbId) {
        const created = await qbCall<{ Id: string }>(qbo, "createPayment", payload);
        qbId = created.Id;
      }
      const rec = await db.quickBooksSync.create({
        data: {
          entityType: "payment",
          entityId: paymentId,
          qbId,
          status: "success",
          syncedAt: new Date(),
        },
      });
      await db.systemSettings.update({
        where: { id: "settings" },
        data: { qbLastSyncAt: new Date() },
      });
      return { success: true, sync: rec };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      const rec = await db.quickBooksSync.create({
        data: {
          entityType: "payment",
          entityId: paymentId,
          status: "failed",
          errorMsg,
        },
      });
      return { error: errorMsg, sync: rec };
    }
  } catch (err) {
    console.error("[quickbooks] syncPayment error:", err);
    return { error: "Sync failed." };
  }
}

// ==================== Bulk Sync ====================
export async function bulkSyncAll() {
  const check = await requireAdmin();
  if ("error" in check) return check;

  const state = await loadTokenState();
  const results = {
    customers: { synced: 0, failed: 0 },
    invoices: { synced: 0, failed: 0 },
    payments: { synced: 0, failed: 0 },
  };

  const syncedCustomerIds = new Set(
    (
      await db.quickBooksSync.findMany({
        where: { entityType: "customer", status: { in: ["success", "mock"] } },
        select: { entityId: true },
      })
    ).map((r) => r.entityId)
  );

  if (state.autoSyncCustomers) {
    const parents = await db.user.findMany({
      where: { role: "PARENT" },
      select: { id: true },
      take: 500,
    });
    for (const p of parents) {
      if (syncedCustomerIds.has(p.id)) continue;
      const r = await syncCustomerToQuickBooks(p.id);
      if ("error" in r) results.customers.failed++;
      else results.customers.synced++;
    }
  }

  if (state.autoSyncInvoices) {
    const syncedInvoiceIds = new Set(
      (
        await db.quickBooksSync.findMany({
          where: { entityType: "invoice", status: { in: ["success", "mock"] } },
          select: { entityId: true },
        })
      ).map((r) => r.entityId)
    );
    const invoices = await db.invoice.findMany({
      select: { id: true },
      take: 500,
      orderBy: { createdAt: "desc" },
    });
    for (const inv of invoices) {
      if (syncedInvoiceIds.has(inv.id)) continue;
      const r = await syncInvoiceToQuickBooks(inv.id);
      if ("error" in r) results.invoices.failed++;
      else results.invoices.synced++;
    }
  }

  if (state.autoSyncPayments) {
    const syncedPaymentIds = new Set(
      (
        await db.quickBooksSync.findMany({
          where: { entityType: "payment", status: { in: ["success", "mock"] } },
          select: { entityId: true },
        })
      ).map((r) => r.entityId)
    );
    const payments = await db.payment.findMany({
      where: { status: "SUCCEEDED" },
      select: { id: true },
      take: 500,
      orderBy: { createdAt: "desc" },
    });
    for (const p of payments) {
      if (syncedPaymentIds.has(p.id)) continue;
      const r = await syncPaymentToQuickBooks(p.id);
      if ("error" in r) results.payments.failed++;
      else results.payments.synced++;
    }
  }

  await db.systemSettings.update({
    where: { id: "settings" },
    data: { qbLastSyncAt: new Date() },
  });

  revalidatePath("/admin/settings/quickbooks");
  return { success: true, results };
}

// ==================== Sync History ====================
export async function getSyncHistory(limit = 50) {
  const check = await requireAdmin();
  if ("error" in check) {
    return { records: [], stats: { total: 0, success: 0, failed: 0, mock: 0, pending: 0 } };
  }
  const records = await db.quickBooksSync.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  const [totalCount, successCount, failedCount, mockCount, pendingCount] =
    await Promise.all([
      db.quickBooksSync.count(),
      db.quickBooksSync.count({ where: { status: "success" } }),
      db.quickBooksSync.count({ where: { status: "failed" } }),
      db.quickBooksSync.count({ where: { status: "mock" } }),
      db.quickBooksSync.count({ where: { status: "pending" } }),
    ]);

  return {
    records,
    stats: {
      total: totalCount,
      success: successCount,
      failed: failedCount,
      mock: mockCount,
      pending: pendingCount,
    },
  };
}

// ==================== Fire-and-forget background triggers ====================
/** Fire-and-forget: trigger invoice sync without blocking the caller. */
export async function triggerInvoiceAutoSync(invoiceId: string) {
  try {
    const state = await loadTokenState();
    if (!state.autoSyncInvoices) return;
    if (!state.connected && !isMockMode()) return;
    // Intentionally not awaited by caller — run and log.
    await syncInvoiceToQuickBooks(invoiceId);
  } catch (err) {
    console.error("[quickbooks] auto invoice sync failed:", err);
  }
}

export async function triggerPaymentAutoSync(paymentId: string) {
  try {
    const state = await loadTokenState();
    if (!state.autoSyncPayments) return;
    if (!state.connected && !isMockMode()) return;
    await syncPaymentToQuickBooks(paymentId);
  } catch (err) {
    console.error("[quickbooks] auto payment sync failed:", err);
  }
}

export async function triggerCustomerAutoSync(userId: string) {
  try {
    const state = await loadTokenState();
    if (!state.autoSyncCustomers) return;
    if (!state.connected && !isMockMode()) return;
    await syncCustomerToQuickBooks(userId);
  } catch (err) {
    console.error("[quickbooks] auto customer sync failed:", err);
  }
}
