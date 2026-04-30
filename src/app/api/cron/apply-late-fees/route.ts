import { NextResponse } from "next/server";
import { db } from "@/server/db";

export const runtime = "nodejs";
export const maxDuration = 60;

const LATE_FEE_CENTS = 5000; // $50 — matches Tuition Contract
const LATE_AFTER_DAYS = 10; // matches contract: late after the 10th

/**
 * Daily cron — finds tuition invoices that are at least LATE_AFTER_DAYS past
 * due, still unpaid, and don't already have a late fee. Adds a $50 line item,
 * bumps `total`, and stamps `lateFeeAppliedAt` so we don't double-apply.
 *
 * Also notifies the parent so they understand why the amount changed.
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

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - LATE_AFTER_DAYS);

  const overdue = await db.invoice.findMany({
    where: {
      status: { in: ["unpaid", "sent", "failed"] },
      dueDate: { lte: cutoff },
      lateFeeAppliedAt: null,
    },
    select: {
      id: true,
      invoiceNumber: true,
      lineItems: true,
      subtotal: true,
      total: true,
      parentId: true,
    },
  });

  let applied = 0;
  for (const inv of overdue) {
    try {
      const items = Array.isArray(inv.lineItems) ? [...inv.lineItems] : [];
      items.push({
        label: "Late fee",
        description: `Applied automatically — ${LATE_AFTER_DAYS}+ days past due`,
        amount: LATE_FEE_CENTS,
      });
      await db.invoice.update({
        where: { id: inv.id },
        data: {
          lineItems: items as never,
          total: inv.total + LATE_FEE_CENTS,
          subtotal: inv.subtotal + LATE_FEE_CENTS,
          lateFeeAppliedAt: new Date(),
        },
      });
      applied++;

      // Notify the parent (best effort)
      const parent = await db.user.findUnique({
        where: { id: inv.parentId },
        select: { email: true, name: true, phone: true },
      });
      if (parent) {
        const { sendEmail } = await import("@/server/email");
        const { sendSMS } = await import("@/server/sms");
        const portal =
          process.env.AUTH_URL ?? "https://app.jetscollege.org";
        sendEmail({
          to: parent.email,
          subject: `Late fee applied — Invoice ${inv.invoiceNumber}`,
          html: `
            <div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
              <h1 style="color:#A30018;font-size:22px;border-bottom:2px solid #A30018;padding-bottom:8px;">JETS School</h1>
              <p>Hi ${parent.name},</p>
              <p>A late fee of <strong>$50</strong> has been added to invoice <strong>${inv.invoiceNumber}</strong> because it's more than ${LATE_AFTER_DAYS} days past due.</p>
              <p>To avoid further late fees, please pay it as soon as possible:</p>
              <p><a href="${portal}/portal/payments" style="background:#A30018;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;display:inline-block;">Open my portal</a></p>
              <p style="font-size:0.85em;color:#666;">If you've already paid or have an arrangement with the office, contact info@jetsschool.org and we'll resolve it.</p>
            </div>
          `,
        }).catch((e) => console.error("[late-fee email]", e));

        if (parent.phone) {
          sendSMS({
            to: parent.phone,
            body: `JETS School: A $50 late fee was added to invoice ${inv.invoiceNumber}. Pay now to avoid further fees: ${portal}/portal/payments. Reply STOP to opt out.`,
          }).catch((e) => console.error("[late-fee sms]", e));
        }
      }
    } catch (e) {
      console.error(`[late-fees] failed for invoice ${inv.invoiceNumber}:`, e);
    }
  }

  return NextResponse.json({ checked: overdue.length, applied });
}
