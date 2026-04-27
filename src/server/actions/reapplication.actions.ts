"use server";

import { db } from "@/server/db";
import { auth } from "@/server/auth";
import { revalidatePath } from "next/cache";
import { reapplicationSchema, type ReapplicationInput } from "@/lib/validators/reapplication";
import { triggerStatusNotifications } from "@/server/notifications";
import { clearReapplyIntent } from "@/lib/reapply-intent";

async function generateReferenceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `JETS-RE-${year}-`;
  const last = await db.application.findFirst({
    where: { referenceNumber: { startsWith: prefix } },
    orderBy: { referenceNumber: "desc" },
    select: { referenceNumber: true },
  });
  let next = 1;
  if (last) {
    const parts = last.referenceNumber.split("-");
    const n = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(n)) next = n + 1;
  }
  return `${prefix}${String(next).padStart(4, "0")}`;
}

export async function createReapplication(input: ReapplicationInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Please sign in to submit a reapplication." };
  }

  const parsed = reapplicationSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const data = parsed.data;

  try {
    // Check if this parent already has a reapplication for this year
    const existing = await db.application.findFirst({
      where: {
        parentId: session.user.id,
        academicYear: data.academicYear,
        type: "REAPPLICATION",
      },
    });

    if (existing) {
      return {
        error: "You already started a reapplication for this year.",
        existingId: existing.id,
      };
    }

    const settings = await db.systemSettings.findFirst();
    const feeAmount = settings?.applicationFeeAmount ?? 50000;
    const referenceNumber = await generateReferenceNumber();

    // Early-bird promo: reapplications are free until 2026-04-27 22:00 LA time
    // (PDT, UTC-7) → 2026-04-28T05:00:00Z. After that, the normal $500 fee applies.
    const FREE_UNTIL = new Date("2026-04-28T05:00:00Z");
    const isPromoActive = new Date() < FREE_UNTIL;

    // Create application + student in one transaction
    const app = await db.application.create({
      data: {
        referenceNumber,
        type: "REAPPLICATION",
        academicYear: data.academicYear,
        parentId: session.user.id,
        applicationFeeAmount: feeAmount,
        // During the early-bird window: auto-waive the fee, mark paid, and
        // jump straight to principal review so parents don't even see a
        // payment screen.
        discountCode: isPromoActive ? "EARLYBIRD" : undefined,
        discountAmount: isPromoActive ? feeAmount : 0,
        applicationFeePaid: isPromoActive,
        status: isPromoActive ? "PRINCIPAL_REVIEW" : "SUBMITTED",
        submittedAt: new Date(),
        completionPct: 100,
        student: {
          create: {
            firstName: data.firstName,
            lastName: data.lastName,
            dateOfBirth: new Date(data.dateOfBirth),
            email: data.email,
            phone: data.phone,
            addressLine1: data.addressLine1,
            addressLine2: data.addressLine2,
            city: data.city,
            state: data.state,
            zipCode: data.zipCode,
            country: data.country,
          },
        },
      },
    });

    if (isPromoActive) {
      // Same notifications the manual fee-waived path fires
      triggerStatusNotifications(app.id, "SUBMITTED").catch(console.error);
      triggerStatusNotifications(app.id, "PRINCIPAL_REVIEW").catch(console.error);
    }

    await clearReapplyIntent();

    revalidatePath("/portal/dashboard");
    return { success: true, applicationId: app.id };
  } catch (err) {
    console.error("Reapplication error:", err);
    return { error: "Something went wrong. Please try again." };
  }
}

export async function applyReapplicationDiscount(
  applicationId: string,
  code: string,
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authorized" };

  const app = await db.application.findUnique({
    where: { id: applicationId },
    select: { parentId: true, applicationFeeAmount: true },
  });
  if (!app || app.parentId !== session.user.id) {
    return { error: "Application not found." };
  }

  const discount = await db.discountCode.findUnique({
    where: { code: code.trim() },
  });

  if (!discount || !discount.isActive) {
    return { error: "Invalid discount code." };
  }

  if (discount.expiresAt && discount.expiresAt < new Date()) {
    return { error: "This discount code has expired." };
  }

  if (discount.maxUses && discount.usedCount >= discount.maxUses) {
    return { error: "This discount code is no longer available." };
  }

  // Calculate discount amount in cents
  let discountAmount = 0;
  if (discount.percentOff) {
    discountAmount = Math.round((app.applicationFeeAmount * discount.percentOff) / 100);
  } else if (discount.amountOff) {
    discountAmount = discount.amountOff;
  }

  const finalAmount = Math.max(0, app.applicationFeeAmount - discountAmount);

  const isWaived = finalAmount === 0;

  await db.application.update({
    where: { id: applicationId },
    data: {
      discountCode: discount.code,
      discountAmount,
      // If fee is now $0, auto-mark as paid + advance to principal review
      applicationFeePaid: isWaived ? true : undefined,
      status: isWaived ? "PRINCIPAL_REVIEW" : undefined,
    },
  });

  await db.discountCode.update({
    where: { id: discount.id },
    data: { usedCount: { increment: 1 } },
  });

  if (isWaived) {
    // Fee fully covered by discount — fire both the "application submitted" emails
    // (since reapps effectively "submit" when the fee is settled) and the
    // "principal review" action email so principals know to look at it.
    triggerStatusNotifications(applicationId, "SUBMITTED").catch(console.error);
    triggerStatusNotifications(applicationId, "PRINCIPAL_REVIEW").catch(console.error);
  }

  revalidatePath(`/portal/reapply/${applicationId}`);

  return {
    success: true,
    discountAmount,
    finalAmount,
    waived: isWaived,
  };
}
