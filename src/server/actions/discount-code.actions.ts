"use server";

import { db } from "@/server/db";
import { auth } from "@/server/auth";
import { revalidatePath } from "next/cache";

// ==================== Get All Discount Codes ====================
export async function getAllDiscountCodes() {
  const session = await auth();
  if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "PRINCIPAL")) {
    return { error: "Admin access required." };
  }

  try {
    const codes = await db.discountCode.findMany({
      orderBy: { createdAt: "desc" },
    });
    return { codes };
  } catch (error) {
    console.error("Error fetching discount codes:", error);
    return { error: "Failed to fetch discount codes." };
  }
}

// ==================== Create Discount Code ====================
export async function createDiscountCode(data: {
  code: string;
  description?: string;
  amountOff?: number; // in cents
  percentOff?: number;
  maxUses?: number;
  expiresAt?: string;
}) {
  const session = await auth();
  if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "PRINCIPAL")) {
    return { error: "Admin access required." };
  }

  try {
    if (!data.amountOff && !data.percentOff) {
      return { error: "Must specify either amount off or percent off." };
    }

    if (data.amountOff && data.percentOff) {
      return { error: "Specify either amount off or percent off, not both." };
    }

    const existing = await db.discountCode.findUnique({
      where: { code: data.code.toUpperCase().trim() },
    });

    if (existing) {
      return { error: "A discount code with this code already exists." };
    }

    const code = await db.discountCode.create({
      data: {
        code: data.code.toUpperCase().trim(),
        description: data.description || null,
        amountOff: data.amountOff || null,
        percentOff: data.percentOff || null,
        maxUses: data.maxUses || null,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        isActive: true,
      },
    });

    revalidatePath("/admin/billing/discount-codes");
    return { success: true, code };
  } catch (error) {
    console.error("Error creating discount code:", error);
    return { error: "Failed to create discount code." };
  }
}

// ==================== Toggle Discount Code Active ====================
export async function toggleDiscountCode(codeId: string) {
  const session = await auth();
  if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "PRINCIPAL")) {
    return { error: "Admin access required." };
  }

  try {
    const code = await db.discountCode.findUnique({
      where: { id: codeId },
    });

    if (!code) {
      return { error: "Discount code not found." };
    }

    await db.discountCode.update({
      where: { id: codeId },
      data: { isActive: !code.isActive },
    });

    revalidatePath("/admin/billing/discount-codes");
    return { success: true };
  } catch (error) {
    console.error("Error toggling discount code:", error);
    return { error: "Failed to update discount code." };
  }
}
