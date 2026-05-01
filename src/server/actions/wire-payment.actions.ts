"use server";

import { db } from "@/server/db";
import { auth } from "@/server/auth";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/server/email";

/**
 * Wire payment flow:
 *   1. Parent clicks "Pay by Wire" on an invoice → sees JETS bank details.
 *   2. After sending the wire from their bank, parent clicks "I've sent it"
 *      → we set invoice.wirePendingAt + email the office.
 *   3. When the wire actually lands at JETS' bank, an admin reconciles it via
 *      the existing markInvoicePaidManually(method: "wire") flow. That clears
 *      wirePendingAt as a side effect.
 */

/** Public: returns wire instructions for the parent invoice flow. */
export async function getWireInstructions() {
  const settings = await db.systemSettings.findUnique({
    where: { id: "settings" },
    select: {
      wireBankName: true,
      wireAccountName: true,
      wireRoutingNumber: true,
      wireAccountNumber: true,
      wireSwiftCode: true,
      wireBankAddress: true,
      wireInstructions: true,
      schoolName: true,
      schoolEmail: true,
    },
  });

  if (!settings) return null;

  // Only return instructions when the office has filled them in. If incomplete,
  // we return null so the UI hides the wire option entirely.
  const ready = Boolean(
    settings.wireBankName &&
      settings.wireRoutingNumber &&
      settings.wireAccountNumber,
  );

  if (!ready) return null;

  return {
    bankName: settings.wireBankName,
    accountName: settings.wireAccountName ?? settings.schoolName,
    routingNumber: settings.wireRoutingNumber,
    accountNumber: settings.wireAccountNumber,
    swiftCode: settings.wireSwiftCode,
    bankAddress: settings.wireBankAddress,
    notes: settings.wireInstructions,
    schoolName: settings.schoolName,
    schoolEmail: settings.schoolEmail,
  };
}

/**
 * Parent: marks an invoice as "wire pending" — they say they've sent the
 * wire from their bank. Stores a reference (e.g. wire confirmation #) for the
 * office to match against the bank statement, and emails the office.
 */
export async function recordWirePending(input: {
  invoiceId: string;
  reference?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not signed in." };

  const invoice = await db.invoice.findUnique({
    where: { id: input.invoiceId },
  });
  if (!invoice) return { error: "Invoice not found." };
  if (invoice.parentId !== session.user.id) {
    return { error: "Not your invoice." };
  }
  if (invoice.status === "paid") return { error: "Already paid." };
  if (invoice.status === "void") return { error: "Invoice is void." };

  const parent = await db.user.findUnique({
    where: { id: invoice.parentId },
    select: { name: true, email: true },
  });

  await db.invoice.update({
    where: { id: invoice.id },
    data: {
      wirePendingAt: new Date(),
      wireReference: input.reference?.trim() || null,
    },
  });

  // Notify the office so they know to look for the wire.
  const officeEmail = await db.systemSettings.findUnique({
    where: { id: "settings" },
    select: { schoolEmail: true },
  });
  if (officeEmail?.schoolEmail && parent) {
    const remaining = ((invoice.total - invoice.amountPaid) / 100).toFixed(2);
    await sendEmail({
      to: officeEmail.schoolEmail,
      subject: `Wire payment pending — Invoice ${invoice.invoiceNumber}`,
      html: `
        <p><strong>${parent.name}</strong> (${parent.email}) has indicated a wire is on its way for invoice <strong>${invoice.invoiceNumber}</strong>.</p>
        <p>Amount: <strong>$${remaining}</strong></p>
        ${input.reference ? `<p>Reference / confirmation #: <strong>${input.reference}</strong></p>` : ""}
        <p>Once the wire arrives at the bank, mark the invoice paid (method: wire) in the admin billing screen — that will clear the pending flag and complete the record.</p>
      `,
    });
  }

  revalidatePath("/portal/payments");
  revalidatePath("/admin/billing");
  return { success: true };
}
