"use server";

import { db } from "@/server/db";
import { auth } from "@/server/auth";
import { revalidatePath } from "next/cache";

// ==================== Helper: Format cents to dollars ====================
export async function formatCents(cents: number): Promise<string> {
  return `$${(cents / 100).toFixed(2)}`;
}

// ==================== Create Application Fee Checkout ====================
// Mock implementation — Stripe not yet configured
export async function createApplicationFeeCheckout(applicationId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in." };
  }

  try {
    const application = await db.application.findUnique({
      where: { id: applicationId },
      select: {
        id: true,
        parentId: true,
        applicationFeePaid: true,
        applicationFeeAmount: true,
        discountAmount: true,
      },
    });

    if (!application) {
      return { error: "Application not found." };
    }

    if (application.parentId !== session.user.id) {
      return { error: "You do not own this application." };
    }

    if (application.applicationFeePaid) {
      return { error: "Application fee has already been paid." };
    }

    const finalAmount = application.applicationFeeAmount - application.discountAmount;

    // Mock: Mark fee as paid and create payment record
    await db.$transaction([
      db.payment.create({
        data: {
          applicationId,
          type: "APPLICATION_FEE",
          status: "SUCCEEDED",
          amount: finalAmount,
          description: "Application fee (mock payment)",
          paidAt: new Date(),
        },
      }),
      db.application.update({
        where: { id: applicationId },
        data: { applicationFeePaid: true },
      }),
    ]);

    revalidatePath("/portal/payments");
    revalidatePath(`/portal/applications/${applicationId}`);

    // In production, this would return a Stripe checkout URL
    return { success: true, message: "Application fee marked as paid (mock)." };
  } catch (error) {
    console.error("Error creating checkout:", error);
    return { error: "Failed to process payment." };
  }
}

// ==================== Apply Discount Code ====================
export async function applyDiscountCode(applicationId: string, code: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in." };
  }

  try {
    const application = await db.application.findUnique({
      where: { id: applicationId },
      select: {
        id: true,
        parentId: true,
        applicationFeePaid: true,
        applicationFeeAmount: true,
      },
    });

    if (!application) {
      return { error: "Application not found." };
    }

    if (application.parentId !== session.user.id) {
      return { error: "You do not own this application." };
    }

    if (application.applicationFeePaid) {
      return { error: "Fee already paid. Cannot apply discount." };
    }

    const discount = await db.discountCode.findUnique({
      where: { code: code.toUpperCase().trim() },
    });

    if (!discount) {
      return { error: "Invalid discount code." };
    }

    if (!discount.isActive) {
      return { error: "This discount code is no longer active." };
    }

    if (discount.expiresAt && discount.expiresAt < new Date()) {
      return { error: "This discount code has expired." };
    }

    if (discount.maxUses && discount.usedCount >= discount.maxUses) {
      return { error: "This discount code has reached its maximum uses." };
    }

    let discountAmount = 0;
    if (discount.amountOff) {
      discountAmount = discount.amountOff;
    } else if (discount.percentOff) {
      discountAmount = Math.round(
        (application.applicationFeeAmount * discount.percentOff) / 100
      );
    }

    // Cap discount at the fee amount
    discountAmount = Math.min(discountAmount, application.applicationFeeAmount);

    await db.$transaction([
      db.application.update({
        where: { id: applicationId },
        data: {
          discountCode: discount.code,
          discountAmount,
        },
      }),
      db.discountCode.update({
        where: { id: discount.id },
        data: { usedCount: { increment: 1 } },
      }),
    ]);

    const newAmount = application.applicationFeeAmount - discountAmount;

    revalidatePath("/portal/payments");
    return {
      success: true,
      discountAmount,
      newAmount,
      message: `Discount applied! New amount: ${formatCents(newAmount)}`,
    };
  } catch (error) {
    console.error("Error applying discount:", error);
    return { error: "Failed to apply discount code." };
  }
}

// ==================== Handle Payment Webhook (stub) ====================
export async function handlePaymentWebhook(event: Record<string, unknown>) {
  // Stub: will be implemented when Stripe is configured
  console.log("Webhook event received:", event.type);
  return { received: true };
}

// ==================== Get Payments for Application ====================
export async function getPaymentsForApplication(applicationId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in." };
  }

  try {
    const application = await db.application.findUnique({
      where: { id: applicationId },
      select: { parentId: true },
    });

    if (!application) {
      return { error: "Application not found." };
    }

    // Allow parent owner or admin
    const isAdmin = session.user.role === "ADMIN" || session.user.role === "PRINCIPAL";
    if (application.parentId !== session.user.id && !isAdmin) {
      return { error: "Access denied." };
    }

    const payments = await db.payment.findMany({
      where: { applicationId },
      orderBy: { createdAt: "desc" },
    });

    return { payments };
  } catch (error) {
    console.error("Error fetching payments:", error);
    return { error: "Failed to fetch payments." };
  }
}

// ==================== Record Manual Payment (Admin) ====================
export async function recordManualPayment(
  applicationId: string,
  amount: number,
  description: string
) {
  const session = await auth();
  if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "PRINCIPAL")) {
    return { error: "Admin access required." };
  }

  try {
    const payment = await db.payment.create({
      data: {
        applicationId,
        type: "OTHER",
        status: "SUCCEEDED",
        amount,
        description: description || "Manual payment recorded by admin",
        paidAt: new Date(),
      },
    });

    revalidatePath("/admin/billing");
    revalidatePath("/portal/payments");
    return { success: true, payment };
  } catch (error) {
    console.error("Error recording payment:", error);
    return { error: "Failed to record payment." };
  }
}

// ==================== Mark Application Fee Paid (Admin) ====================
export async function markApplicationFeePaid(applicationId: string) {
  const session = await auth();
  if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "PRINCIPAL")) {
    return { error: "Admin access required." };
  }

  try {
    const application = await db.application.findUnique({
      where: { id: applicationId },
      select: { applicationFeePaid: true, applicationFeeAmount: true, discountAmount: true },
    });

    if (!application) {
      return { error: "Application not found." };
    }

    if (application.applicationFeePaid) {
      return { error: "Fee already marked as paid." };
    }

    const finalAmount = application.applicationFeeAmount - application.discountAmount;

    await db.$transaction([
      db.payment.create({
        data: {
          applicationId,
          type: "APPLICATION_FEE",
          status: "SUCCEEDED",
          amount: finalAmount,
          description: "Application fee marked paid by admin",
          paidAt: new Date(),
        },
      }),
      db.application.update({
        where: { id: applicationId },
        data: { applicationFeePaid: true },
      }),
    ]);

    revalidatePath("/admin/billing");
    revalidatePath("/portal/payments");
    return { success: true };
  } catch (error) {
    console.error("Error marking fee paid:", error);
    return { error: "Failed to mark fee as paid." };
  }
}

// ==================== Get Payment History (Parent) ====================
export async function getPaymentHistory(parentId?: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in." };
  }

  const isAdmin = session.user.role === "ADMIN" || session.user.role === "PRINCIPAL";
  const targetParentId = isAdmin && parentId ? parentId : session.user.id;

  try {
    const applications = await db.application.findMany({
      where: { parentId: targetParentId },
      select: { id: true },
    });

    const applicationIds = applications.map((a) => a.id);

    const payments = await db.payment.findMany({
      where: { applicationId: { in: applicationIds } },
      include: {
        application: {
          select: {
            referenceNumber: true,
            student: { select: { firstName: true, lastName: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { payments };
  } catch (error) {
    console.error("Error fetching payment history:", error);
    return { error: "Failed to fetch payment history." };
  }
}

// ==================== Get All Payments (Admin) ====================
export async function getAllPayments(filters?: {
  status?: string;
  type?: string;
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
    if (filters?.type) {
      where.type = filters.type;
    }

    const payments = await db.payment.findMany({
      where,
      include: {
        application: {
          select: {
            referenceNumber: true,
            parentId: true,
            parent: { select: { name: true, email: true } },
            student: { select: { firstName: true, lastName: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    // Stats
    const stats = await db.payment.aggregate({
      _sum: {
        amount: true,
      },
      where: { status: "SUCCEEDED" },
    });

    const outstandingPayments = await db.payment.aggregate({
      _sum: {
        amount: true,
      },
      where: { status: "PENDING" },
    });

    return {
      payments,
      stats: {
        totalCollected: stats._sum.amount ?? 0,
        outstanding: outstandingPayments._sum.amount ?? 0,
      },
    };
  } catch (error) {
    console.error("Error fetching all payments:", error);
    return { error: "Failed to fetch payments." };
  }
}
