"use server";

import { db } from "@/server/db";
import { auth } from "@/server/auth";
import { revalidatePath } from "next/cache";
import type { PaymentMethodType } from "@prisma/client";

// ==================== Constants ====================
const CARD_FEE_PCT = 0.03; // 3%
const ACH_FEE_CENTS = 50; // $0.50 flat

function calcProcessingFee(
  amountCents: number,
  type: "CREDIT_CARD" | "BANK_ACCOUNT"
): number {
  if (type === "CREDIT_CARD") return Math.round(amountCents * CARD_FEE_PCT);
  return ACH_FEE_CENTS;
}

// ==================== Auth helper ====================
async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) return { error: "You must be logged in." as const };
  return { session };
}

function isAdmin(role?: string | null) {
  return role === "ADMIN" || role === "PRINCIPAL";
}

// ==================== Auto-Pay Settings ====================
export async function getAutoPaySettings(userId?: string) {
  const check = await requireUser();
  if ("error" in check) return { error: check.error };
  const targetId =
    isAdmin(check.session.user.role) && userId ? userId : check.session.user.id;

  let settings = await db.autoPaySettings.findUnique({
    where: { userId: targetId },
  });
  if (!settings) {
    // Initialize as enabled by default
    settings = await db.autoPaySettings.create({
      data: { userId: targetId, enabled: true },
    });
  }
  return { settings };
}

export async function updateAutoPaySettings(
  enabled: boolean,
  paymentMethodId?: string | null
) {
  const check = await requireUser();
  if ("error" in check) return { error: check.error };
  const userId = check.session.user.id;

  const existing = await db.autoPaySettings.findUnique({ where: { userId } });
  const data = {
    enabled,
    paymentMethodId: paymentMethodId === undefined ? existing?.paymentMethodId ?? null : paymentMethodId,
  };

  const settings = existing
    ? await db.autoPaySettings.update({ where: { userId }, data })
    : await db.autoPaySettings.create({ data: { userId, ...data } });

  revalidatePath("/portal/payments");
  revalidatePath("/portal/payments/autopay");
  revalidatePath("/admin/billing");
  return { success: true, settings };
}

// ==================== Payment Methods ====================
export async function getPaymentMethods(userId?: string) {
  const check = await requireUser();
  if ("error" in check) return { error: check.error };
  const targetId =
    isAdmin(check.session.user.role) && userId ? userId : check.session.user.id;

  const methods = await db.paymentMethod.findMany({
    where: { userId: targetId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
  return { methods };
}

export async function addPaymentMethod(input: {
  type: "CREDIT_CARD" | "BANK_ACCOUNT";
  cardNumber?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  routingNumber?: string;
  accountNumber?: string;
  bankName?: string;
  accountNickname?: string;
}) {
  const check = await requireUser();
  if ("error" in check) return { error: check.error };
  const userId = check.session.user.id;

  let last4 = "0000";
  if (input.type === "CREDIT_CARD") {
    const num = (input.cardNumber ?? "").replace(/\D/g, "");
    if (num.length < 4) return { error: "Invalid card number." };
    last4 = num.slice(-4);
  } else {
    const num = (input.accountNumber ?? "").replace(/\D/g, "");
    if (num.length < 4) return { error: "Invalid account number." };
    last4 = num.slice(-4);
  }

  const existingCount = await db.paymentMethod.count({ where: { userId } });

  const method = await db.paymentMethod.create({
    data: {
      userId,
      type: input.type as PaymentMethodType,
      last4,
      brand: input.brand ?? (input.type === "CREDIT_CARD" ? "Visa" : null),
      expiryMonth: input.type === "CREDIT_CARD" ? input.expiryMonth ?? null : null,
      expiryYear: input.type === "CREDIT_CARD" ? input.expiryYear ?? null : null,
      bankName: input.type === "BANK_ACCOUNT" ? input.bankName ?? "Bank" : null,
      accountNickname: input.accountNickname ?? null,
      isDefault: existingCount === 0,
    },
  });

  // If this is the first method, also point auto-pay at it.
  if (existingCount === 0) {
    await db.autoPaySettings.upsert({
      where: { userId },
      create: { userId, enabled: true, paymentMethodId: method.id },
      update: { paymentMethodId: method.id },
    });
  }

  revalidatePath("/portal/payments");
  revalidatePath("/portal/payments/methods");
  revalidatePath("/portal/payments/autopay");
  return { success: true, method };
}

export async function deletePaymentMethod(id: string) {
  const check = await requireUser();
  if ("error" in check) return { error: check.error };
  const userId = check.session.user.id;

  const method = await db.paymentMethod.findUnique({ where: { id } });
  if (!method) return { error: "Payment method not found." };
  if (method.userId !== userId && !isAdmin(check.session.user.role)) {
    return { error: "Access denied." };
  }

  await db.paymentMethod.delete({ where: { id } });

  // If this was default, promote another to default if any
  if (method.isDefault) {
    const next = await db.paymentMethod.findFirst({
      where: { userId: method.userId },
      orderBy: { createdAt: "desc" },
    });
    if (next) {
      await db.paymentMethod.update({
        where: { id: next.id },
        data: { isDefault: true },
      });
    }
  }

  // Clear auto-pay reference if pointed here
  await db.autoPaySettings.updateMany({
    where: { userId: method.userId, paymentMethodId: id },
    data: { paymentMethodId: null },
  });

  revalidatePath("/portal/payments");
  revalidatePath("/portal/payments/methods");
  revalidatePath("/portal/payments/autopay");
  return { success: true };
}

export async function setDefaultPaymentMethod(id: string) {
  const check = await requireUser();
  if ("error" in check) return { error: check.error };
  const userId = check.session.user.id;

  const method = await db.paymentMethod.findUnique({ where: { id } });
  if (!method) return { error: "Payment method not found." };
  if (method.userId !== userId && !isAdmin(check.session.user.role)) {
    return { error: "Access denied." };
  }

  await db.$transaction([
    db.paymentMethod.updateMany({
      where: { userId: method.userId },
      data: { isDefault: false },
    }),
    db.paymentMethod.update({
      where: { id },
      data: { isDefault: true },
    }),
  ]);

  revalidatePath("/portal/payments");
  revalidatePath("/portal/payments/methods");
  revalidatePath("/portal/payments/autopay");
  return { success: true };
}

// ==================== Charge Invoice (mock) ====================
export async function chargeInvoice(invoiceId: string, paymentMethodId: string) {
  const check = await requireUser();
  if ("error" in check) return { error: check.error };

  const invoice = await db.invoice.findUnique({ where: { id: invoiceId } });
  if (!invoice) return { error: "Invoice not found." };

  const method = await db.paymentMethod.findUnique({
    where: { id: paymentMethodId },
  });
  if (!method) return { error: "Payment method not found." };

  // Permission: parent who owns invoice, owner of method, or admin
  const userId = check.session.user.id;
  const admin = isAdmin(check.session.user.role);
  if (!admin && invoice.parentId !== userId) {
    return { error: "Access denied." };
  }
  if (!admin && method.userId !== userId) {
    return { error: "Access denied." };
  }

  if (invoice.status === "paid") {
    return { error: "Invoice is already paid." };
  }

  const remaining = invoice.total - invoice.amountPaid;
  if (remaining <= 0) return { error: "Nothing to charge." };

  const fee = calcProcessingFee(remaining, method.type);
  const totalCharged = remaining + fee;

  const methodLabel =
    method.type === "CREDIT_CARD"
      ? `${method.brand ?? "Card"} •••• ${method.last4}`
      : `${method.bankName ?? "Bank"} •••• ${method.last4}`;

  await db.$transaction([
    db.invoice.update({
      where: { id: invoiceId },
      data: {
        amountPaid: invoice.total,
        status: "paid",
        paidAt: new Date(),
        processingFee: fee,
        paymentMethodType: method.type,
      },
    }),
    db.payment.create({
      data: {
        applicationId: invoice.applicationId,
        type: "TUITION",
        status: "SUCCEEDED",
        amount: totalCharged,
        description: `Invoice ${invoice.invoiceNumber} paid via ${methodLabel}${fee > 0 ? ` (incl. $${(fee / 100).toFixed(2)} processing fee)` : ""}`,
        paidAt: new Date(),
      },
    }),
    db.autoPaySettings.updateMany({
      where: { userId: invoice.parentId, paymentMethodId },
      data: { lastChargedAt: new Date() },
    }),
  ]);

  revalidatePath("/admin/billing");
  revalidatePath("/portal/payments");
  return {
    success: true,
    fee,
    totalCharged,
    message: `Charged $${(totalCharged / 100).toFixed(2)} to ${methodLabel}.`,
  };
}
