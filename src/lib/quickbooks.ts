import { db } from "@/server/db";

/**
 * QuickBooks Online integration helpers.
 *
 * This module wraps the `intuit-oauth` and `node-quickbooks` libraries.
 * When QuickBooks env vars are missing, the integration runs in "mock mode"
 * so the UI and flows remain usable for development.
 */

export const QB_ENVIRONMENT: "sandbox" | "production" =
  (process.env.QUICKBOOKS_ENVIRONMENT as "sandbox" | "production") ?? "sandbox";

export const QB_REDIRECT_URI =
  process.env.QUICKBOOKS_REDIRECT_URI ??
  `${process.env.NEXTAUTH_URL ?? "http://localhost:3200"}/api/quickbooks/callback`;

export const QB_SCOPES = ["com.intuit.quickbooks.accounting"];

/** Check that QuickBooks is fully configured (env vars present). */
export function isQuickBooksConfigured(): boolean {
  return Boolean(
    process.env.QUICKBOOKS_CLIENT_ID &&
      process.env.QUICKBOOKS_CLIENT_SECRET &&
      process.env.QUICKBOOKS_CLIENT_ID.trim().length > 0 &&
      process.env.QUICKBOOKS_CLIENT_SECRET.trim().length > 0
  );
}

/** Whether the QuickBooks integration is currently in mock mode. */
export function isMockMode(): boolean {
  return !isQuickBooksConfigured();
}

/**
 * Build an Intuit OAuth client. Returns null in mock mode.
 * Uses dynamic require so the library doesn't break builds when absent.
 */
export function getOAuthClient(): unknown | null {
  if (!isQuickBooksConfigured()) return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const OAuthClient = require("intuit-oauth");
    return new OAuthClient({
      clientId: process.env.QUICKBOOKS_CLIENT_ID!,
      clientSecret: process.env.QUICKBOOKS_CLIENT_SECRET!,
      environment: QB_ENVIRONMENT,
      redirectUri: QB_REDIRECT_URI,
    });
  } catch (err) {
    console.error("[quickbooks] Failed to load intuit-oauth:", err);
    return null;
  }
}

/** Load persisted QuickBooks token state from SystemSettings. */
export async function loadTokenState() {
  const settings = await db.systemSettings.upsert({
    where: { id: "settings" },
    update: {},
    create: { id: "settings" },
  });

  return {
    accessToken: settings.qbAccessToken,
    refreshToken: settings.qbRefreshToken,
    realmId: settings.qbRealmId,
    expiresAt: settings.qbTokenExpiresAt,
    companyName: settings.qbCompanyName,
    lastSyncAt: settings.qbLastSyncAt,
    autoSyncInvoices: settings.qbAutoSyncInvoices,
    autoSyncPayments: settings.qbAutoSyncPayments,
    autoSyncCustomers: settings.qbAutoSyncCustomers,
    connected: Boolean(
      settings.qbAccessToken && settings.qbRefreshToken && settings.qbRealmId
    ),
  };
}

/** Persist tokens returned from an OAuth exchange. */
export async function saveTokens(params: {
  accessToken: string;
  refreshToken: string;
  realmId: string;
  expiresInSeconds: number;
  companyName?: string | null;
}) {
  const expiresAt = new Date(Date.now() + params.expiresInSeconds * 1000);
  await db.systemSettings.upsert({
    where: { id: "settings" },
    update: {
      qbAccessToken: params.accessToken,
      qbRefreshToken: params.refreshToken,
      qbRealmId: params.realmId,
      qbTokenExpiresAt: expiresAt,
      qbCompanyName: params.companyName ?? null,
      quickbooksConnected: true,
    },
    create: {
      id: "settings",
      qbAccessToken: params.accessToken,
      qbRefreshToken: params.refreshToken,
      qbRealmId: params.realmId,
      qbTokenExpiresAt: expiresAt,
      qbCompanyName: params.companyName ?? null,
      quickbooksConnected: true,
    },
  });
}

/** Clear all QuickBooks tokens. */
export async function clearTokens() {
  await db.systemSettings.upsert({
    where: { id: "settings" },
    update: {
      qbAccessToken: null,
      qbRefreshToken: null,
      qbRealmId: null,
      qbTokenExpiresAt: null,
      qbCompanyName: null,
      quickbooksConnected: false,
    },
    create: { id: "settings" },
  });
}

/**
 * Refresh the access token if it is expired or about to expire.
 * Returns the current valid access token, or null if not connected.
 */
export async function ensureValidAccessToken(): Promise<{
  accessToken: string;
  refreshToken: string;
  realmId: string;
} | null> {
  const state = await loadTokenState();
  if (!state.connected || !state.accessToken || !state.refreshToken || !state.realmId) {
    return null;
  }

  const now = Date.now();
  const expiresAtMs = state.expiresAt ? state.expiresAt.getTime() : 0;
  const bufferMs = 60 * 1000; // refresh 1 minute before expiry

  if (expiresAtMs - bufferMs > now) {
    return {
      accessToken: state.accessToken,
      refreshToken: state.refreshToken,
      realmId: state.realmId,
    };
  }

  const oauth = getOAuthClient() as
    | {
        refreshUsingToken: (
          token: string
        ) => Promise<{
          token: {
            access_token: string;
            refresh_token: string;
            expires_in: number;
          };
        }>;
      }
    | null;

  if (!oauth) return null;

  try {
    const resp = await oauth.refreshUsingToken(state.refreshToken);
    const token = resp.token;
    await saveTokens({
      accessToken: token.access_token,
      refreshToken: token.refresh_token,
      realmId: state.realmId,
      expiresInSeconds: token.expires_in,
      companyName: state.companyName,
    });
    return {
      accessToken: token.access_token,
      refreshToken: token.refresh_token,
      realmId: state.realmId,
    };
  } catch (err) {
    console.error("[quickbooks] Token refresh failed:", err);
    return null;
  }
}

/** Lazily build a node-quickbooks API client for the connected realm. */
export async function getQBClient(): Promise<unknown | null> {
  if (!isQuickBooksConfigured()) return null;
  const tokens = await ensureValidAccessToken();
  if (!tokens) return null;

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const QuickBooks = require("node-quickbooks");
    const useSandbox = QB_ENVIRONMENT === "sandbox";
    return new QuickBooks(
      process.env.QUICKBOOKS_CLIENT_ID!,
      process.env.QUICKBOOKS_CLIENT_SECRET!,
      tokens.accessToken,
      false, // no token secret (OAuth 2)
      tokens.realmId,
      useSandbox,
      false, // enableDebug
      null, // minor version
      "2.0", // OAuth version
      tokens.refreshToken
    );
  } catch (err) {
    console.error("[quickbooks] Failed to construct node-quickbooks client:", err);
    return null;
  }
}

/** Promisify a node-quickbooks callback-style method. */
export function qbCall<T>(
  qbo: unknown,
  method: string,
  ...args: unknown[]
): Promise<T> {
  return new Promise((resolve, reject) => {
    const fn = (qbo as Record<string, unknown>)[method];
    if (typeof fn !== "function") {
      reject(new Error(`QuickBooks method ${method} is not available`));
      return;
    }
    (fn as (...a: unknown[]) => void).call(
      qbo,
      ...args,
      (err: unknown, result: T) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
  });
}

// ==================== QBO Account & Deposit helpers ====================

export interface QbAccountLite {
  id: string;
  name: string;
  type: string;        // QBO AccountType (Bank, OtherCurrentAsset, Income, etc.)
  subType?: string;
  currency?: string;
}

/**
 * Pulls the chart of accounts from QBO. Used for the Settings → QuickBooks
 * mapping screen so the admin can pick which bank + income accounts deposits
 * post to.
 */
export async function fetchQbAccounts(): Promise<QbAccountLite[]> {
  const qbo = await getQBClient();
  if (!qbo) return [];

  type RawAccount = {
    Id: string;
    Name: string;
    AccountType: string;
    AccountSubType?: string;
    CurrencyRef?: { value: string };
  };
  type AccountQueryResponse = {
    QueryResponse?: { Account?: RawAccount[] };
  };

  // node-quickbooks expects a plain criteria object (e.g. { Active: true })
  // OR a special key like `fetchAll: true`. We pull all accounts and filter
  // client-side — small list, cheap.
  let raw: RawAccount[] = [];
  try {
    const result = await qbCall<AccountQueryResponse | RawAccount[]>(
      qbo,
      "findAccounts",
      { Active: true, fetchAll: true },
    );
    if (Array.isArray(result)) {
      raw = result;
    } else {
      raw = result.QueryResponse?.Account ?? [];
    }
  } catch (err) {
    // Fall back to the no-criteria form if the lib rejects the filter.
    console.warn("[qbo] findAccounts with criteria failed, retrying", err);
    const result = await qbCall<AccountQueryResponse | RawAccount[]>(
      qbo,
      "findAccounts",
      {},
    );
    if (Array.isArray(result)) {
      raw = result;
    } else {
      raw = result.QueryResponse?.Account ?? [];
    }
  }
  raw = raw.filter((a) => (a as RawAccount & { Active?: boolean }).Active !== false);
  return raw.map((a) => ({
    id: a.Id,
    name: a.Name,
    type: a.AccountType,
    subType: a.AccountSubType,
    currency: a.CurrencyRef?.value,
  }));
}

export interface DepositLineInput {
  accountId: string;
  accountName?: string;
  amountCents: number;
  description?: string;
}

/**
 * Posts a single Deposit transaction to QBO with split income lines. The
 * total of the lines is what lands in the deposit-to bank account.
 */
export async function createQbDeposit(input: {
  depositDate: Date;
  depositToAccountId: string;
  lines: DepositLineInput[];
  privateNote?: string;
}): Promise<{ id: string }> {
  const qbo = await getQBClient();
  if (!qbo) throw new Error("QuickBooks not connected.");

  const lines = input.lines.map((line) => ({
    DetailType: "DepositLineDetail",
    Amount: line.amountCents / 100,
    Description: line.description ?? "Batch deposit",
    DepositLineDetail: {
      AccountRef: { value: line.accountId, name: line.accountName },
    },
  }));

  const payload = {
    DepositToAccountRef: { value: input.depositToAccountId },
    TxnDate: input.depositDate.toISOString().slice(0, 10),
    Line: lines,
    PrivateNote: input.privateNote,
  };

  const created = await qbCall<{ Id: string }>(qbo, "createDeposit", payload);
  return { id: created.Id };
}
