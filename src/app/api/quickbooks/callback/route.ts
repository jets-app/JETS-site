import { NextRequest, NextResponse } from "next/server";
import { handleOAuthCallback } from "@/server/actions/quickbooks.actions";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const realmId = url.searchParams.get("realmId");
  const state = url.searchParams.get("state") ?? undefined;
  const error = url.searchParams.get("error");

  const baseRedirect = new URL("/admin/settings/quickbooks", url.origin);

  if (error) {
    baseRedirect.searchParams.set("qb_error", error);
    return NextResponse.redirect(baseRedirect);
  }

  if (!code || !realmId) {
    baseRedirect.searchParams.set("qb_error", "missing_params");
    return NextResponse.redirect(baseRedirect);
  }

  const result = await handleOAuthCallback({
    code,
    realmId,
    state,
    fullUrl: req.url,
  });

  if ("error" in result) {
    baseRedirect.searchParams.set("qb_error", result.error ?? "unknown");
  } else {
    baseRedirect.searchParams.set("qb_connected", "1");
  }

  return NextResponse.redirect(baseRedirect);
}
