"use server";

import { db } from "@/server/db";
import { auth } from "@/server/auth";
import { revalidatePath } from "next/cache";
import {
  triggerInvoiceAutoSync,
  triggerPaymentAutoSync,
} from "@/server/actions/quickbooks.actions";

// ==================== Generate Invoice Number ====================
async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;

  const lastInvoice = await db.invoice.findFirst({
    where: { invoiceNumber: { startsWith: prefix } },
    orderBy: { invoiceNumber: "desc" },
    select: { invoiceNumber: true },
  });

  let nextNum = 1;
  if (lastInvoice) {
    const parts = lastInvoice.invoiceNumber.split("-");
    const lastNum = parseInt(parts[2], 10);
    if (!isNaN(lastNum)) nextNum = lastNum + 1;
  }

  return `${prefix}${String(nextNum).padStart(4, "0")}`;
}

// ==================== Types ====================
export interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number; // in cents
  total: number; // in cents
}

// ==================== Create Invoice ====================
export async function createInvoice(
  parentId: string,
  lineItems: LineItem[],
  dueDate: string,
  applicationId?: string
) {
  const session = await auth();
  if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "PRINCIPAL")) {
    return { error: "Admin access required." };
  }

  try {
    const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
    const invoiceNumber = await generateInvoiceNumber();

    const invoice = await db.invoice.create({
      data: {
        invoiceNumber,
        parentId,
        applicationId: applicationId || null,
        lineItems: JSON.parse(JSON.stringify(lineItems)),
        subtotal,
        tax: 0,
        total: subtotal,
        amountPaid: 0,
        status: "draft",
        dueDate: new Date(dueDate),
      },
    });

    revalidatePath("/admin/billing");

    // Fire-and-forget QuickBooks auto-sync
    void triggerInvoiceAutoSync(invoice.id);

    return { success: true, invoice };
  } catch (error) {
    console.error("Error creating invoice:", error);
    return { error: "Failed to create invoice." };
  }
}

// ==================== Update Invoice ====================
export async function updateInvoice(
  invoiceId: string,
  data: {
    lineItems?: LineItem[];
    dueDate?: string;
    tax?: number;
  }
) {
  const session = await auth();
  if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "PRINCIPAL")) {
    return { error: "Admin access required." };
  }

  try {
    const existing = await db.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!existing) {
      return { error: "Invoice not found." };
    }

    if (existing.status !== "draft") {
      return { error: "Only draft invoices can be edited." };
    }

    const updateData: Record<string, unknown> = {};

    if (data.lineItems) {
      const subtotal = data.lineItems.reduce((sum, item) => sum + item.total, 0);
      updateData.lineItems = JSON.parse(JSON.stringify(data.lineItems));
      updateData.subtotal = subtotal;
      updateData.total = subtotal + (data.tax ?? existing.tax);
    }

    if (data.dueDate) {
      updateData.dueDate = new Date(data.dueDate);
    }

    if (data.tax !== undefined) {
      updateData.tax = data.tax;
      updateData.total = (updateData.subtotal as number ?? existing.subtotal) + data.tax;
    }

    const invoice = await db.invoice.update({
      where: { id: invoiceId },
      data: updateData,
    });

    revalidatePath("/admin/billing");

    // Fire-and-forget QuickBooks auto-sync for updated invoice
    void triggerInvoiceAutoSync(invoice.id);

    return { success: true, invoice };
  } catch (error) {
    console.error("Error updating invoice:", error);
    return { error: "Failed to update invoice." };
  }
}

// ==================== Send Invoice ====================
export async function sendInvoice(invoiceId: string) {
  const session = await auth();
  if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "PRINCIPAL")) {
    return { error: "Admin access required." };
  }

  try {
    const invoice = await db.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      return { error: "Invoice not found." };
    }

    if (invoice.status !== "draft") {
      return { error: "Only draft invoices can be sent." };
    }

    await db.invoice.update({
      where: { id: invoiceId },
      data: { status: "sent" },
    });

    // TODO: Send email notification to parent

    revalidatePath("/admin/billing");
    revalidatePath("/portal/payments");
    return { success: true };
  } catch (error) {
    console.error("Error sending invoice:", error);
    return { error: "Failed to send invoice." };
  }
}

// ==================== Record Invoice Payment ====================
export async function recordInvoicePayment(invoiceId: string, amount: number) {
  const session = await auth();
  if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "PRINCIPAL")) {
    return { error: "Admin access required." };
  }

  try {
    const invoice = await db.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      return { error: "Invoice not found." };
    }

    const newAmountPaid = invoice.amountPaid + amount;
    const isPaidInFull = newAmountPaid >= invoice.total;

    const [, payment] = await db.$transaction([
      db.invoice.update({
        where: { id: invoiceId },
        data: {
          amountPaid: newAmountPaid,
          status: isPaidInFull ? "paid" : "partially_paid",
          paidAt: isPaidInFull ? new Date() : null,
        },
      }),
      db.payment.create({
        data: {
          applicationId: invoice.applicationId,
          type: "TUITION",
          status: "SUCCEEDED",
          amount,
          description: `Payment for invoice ${invoice.invoiceNumber}`,
          paidAt: new Date(),
        },
      }),
    ]);

    revalidatePath("/admin/billing");
    revalidatePath("/portal/payments");

    // Fire-and-forget QuickBooks auto-sync
    void triggerInvoiceAutoSync(invoiceId);
    void triggerPaymentAutoSync(payment.id);

    return { success: true, isPaidInFull, remaining: invoice.total - newAmountPaid };
  } catch (error) {
    console.error("Error recording payment:", error);
    return { error: "Failed to record payment." };
  }
}

// ==================== Get Invoices for Parent ====================
export async function getInvoicesForParent(parentId?: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in." };
  }

  const isAdmin = session.user.role === "ADMIN" || session.user.role === "PRINCIPAL";
  const targetParentId = isAdmin && parentId ? parentId : session.user.id;

  try {
    const invoices = await db.invoice.findMany({
      where: { parentId: targetParentId },
      orderBy: { createdAt: "desc" },
    });

    return { invoices };
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return { error: "Failed to fetch invoices." };
  }
}

// ==================== Get All Invoices (Admin) ====================
export async function getAllInvoices(filters?: {
  status?: string;
  search?: string;
}) {
  const session = await auth();
  if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "PRINCIPAL")) {
    return { error: "Admin access required." };
  }

  try {
    const where: Record<string, unknown> = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    const invoices = await db.invoice.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    // Fetch parent info for all invoices
    const parentIds = [...new Set(invoices.map((inv) => inv.parentId))];
    const parents = await db.user.findMany({
      where: { id: { in: parentIds } },
      select: { id: true, name: true, email: true },
    });
    const parentMap = new Map(parents.map((p) => [p.id, p]));

    const invoicesWithParent = invoices.map((inv) => ({
      ...inv,
      parent: parentMap.get(inv.parentId) ?? null,
    }));

    // Stats
    const allInvoices = await db.invoice.findMany({
      select: { total: true, amountPaid: true, status: true, dueDate: true },
    });

    const totalInvoiced = allInvoices.reduce((s, i) => s + i.total, 0);
    const totalPaid = allInvoices.reduce((s, i) => s + i.amountPaid, 0);
    const overdue = allInvoices.filter(
      (i) => i.status !== "paid" && i.dueDate < new Date()
    ).length;

    return {
      invoices: invoicesWithParent,
      stats: {
        totalInvoiced,
        totalPaid,
        outstanding: totalInvoiced - totalPaid,
        overdueCount: overdue,
      },
    };
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return { error: "Failed to fetch invoices." };
  }
}

// ==================== Get Invoice by ID ====================
export async function getInvoiceById(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in." };
  }

  try {
    const invoice = await db.invoice.findUnique({
      where: { id },
    });

    if (!invoice) {
      return { error: "Invoice not found." };
    }

    // Check access: must be parent owner or admin
    const isAdmin = session.user.role === "ADMIN" || session.user.role === "PRINCIPAL";
    if (invoice.parentId !== session.user.id && !isAdmin) {
      return { error: "Access denied." };
    }

    const parent = await db.user.findUnique({
      where: { id: invoice.parentId },
      select: { name: true, email: true },
    });

    return { invoice: { ...invoice, parent } };
  } catch (error) {
    console.error("Error fetching invoice:", error);
    return { error: "Failed to fetch invoice." };
  }
}
