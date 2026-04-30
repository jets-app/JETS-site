import { NextResponse } from "next/server";
import { generateMonthlyInvoices } from "@/server/actions/invoice-generation.actions";

export const runtime = "nodejs";
export const maxDuration = 120;

/**
 * Runs on the 1st of each month at 9 AM Pacific (16:00 UTC). Generates
 * tuition invoices for the upcoming month for every enrolled student with
 * a tuition assessment on file. Idempotent — `generateMonthlyInvoices`
 * skips students who already have an invoice for the target month.
 */
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json(
      { error: "CRON_SECRET not configured" },
      { status: 500 },
    );
  }
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Generate invoices for *next* month so parents have time to set up payment
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const result = await generateMonthlyInvoices(nextMonth);
  return NextResponse.json(result);
}
