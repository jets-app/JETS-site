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
