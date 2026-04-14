"use server";

import { db } from "@/server/db";
import { auth } from "@/server/auth";
import { revalidatePath } from "next/cache";
import { createInvoice } from "./invoice.actions";
import type { LineItem } from "./invoice.actions";

// ==================== Types ====================
export type PaymentPlan = "FULL" | "SEMESTER" | "QUARTERLY" | "MONTHLY";

const PLAN_INSTALLMENTS: Record<PaymentPlan, number> = {
  FULL: 1,
  SEMESTER: 2,
  QUARTERLY: 4,
  MONTHLY: 10,
};

const PLAN_LABELS: Record<PaymentPlan, string> = {
  FULL: "Full Payment",
  SEMESTER: "Semester (2 payments)",
  QUARTERLY: "Quarterly (4 payments)",
  MONTHLY: "Monthly (10 payments)",
};

// ==================== Set Student Tuition (Admin) ====================
export async function setStudentTuition(
  applicationId: string,
  amount: number, // total tuition in cents
  paymentPlan: PaymentPlan
) {
  const session = await auth();
  if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "PRINCIPAL")) {
    return { error: "Admin access required." };
  }

  try {
    const application = await db.application.findUnique({
      where: { id: applicationId },
      select: {
        id: true,
        parentId: true,
        student: { select: { firstName: true, lastName: true } },
      },
    });

    if (!application) {
      return { error: "Application not found." };
    }

    // Store tuition info in a TuitionAssessment or create one
    const existing = await db.tuitionAssessment.findUnique({
      where: { applicationId },
    });

    if (existing) {
      await db.tuitionAssessment.update({
        where: { applicationId },
        data: {
          adminAdjustedAmount: amount,
          adminNotes: `Payment plan: ${PLAN_LABELS[paymentPlan]}`,
        },
      });
    } else {
      await db.tuitionAssessment.create({
        data: {
          applicationId,
          adminAdjustedAmount: amount,
          adminNotes: `Payment plan: ${PLAN_LABELS[paymentPlan]}`,
        },
      });
    }

    // Auto-generate invoices based on payment plan
    const installments = PLAN_INSTALLMENTS[paymentPlan];
    const installmentAmount = Math.floor(amount / installments);
    const remainder = amount - installmentAmount * installments;

    const studentName = application.student
      ? `${application.student.firstName} ${application.student.lastName}`
      : "Student";

    // Generate due dates
    const now = new Date();
    const startMonth = now.getMonth() >= 7 ? 8 : 1; // August or January
    const startYear = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear();

    for (let i = 0; i < installments; i++) {
      const dueDate = new Date(startYear, startMonth + (paymentPlan === "MONTHLY" ? i : i * (12 / installments)), 1);
      const isLast = i === installments - 1;
      const thisAmount = isLast ? installmentAmount + remainder : installmentAmount;

      const lineItems: LineItem[] = [
        {
          description: `Tuition for ${studentName} - ${PLAN_LABELS[paymentPlan]} (${i + 1}/${installments})`,
          quantity: 1,
          unitPrice: thisAmount,
          total: thisAmount,
        },
      ];

      await createInvoice(
        application.parentId,
        lineItems,
        dueDate.toISOString(),
        applicationId
      );
    }

    revalidatePath("/admin/billing");
    revalidatePath("/portal/payments");
    return {
      success: true,
      message: `Tuition set to $${(amount / 100).toFixed(2)} with ${PLAN_LABELS[paymentPlan]} plan. ${installments} invoice(s) generated.`,
    };
  } catch (error) {
    console.error("Error setting tuition:", error);
    return { error: "Failed to set tuition." };
  }
}

// ==================== Get Student Tuition ====================
export async function getStudentTuition(applicationId: string) {
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
        student: { select: { firstName: true, lastName: true } },
      },
    });

    if (!application) {
      return { error: "Application not found." };
    }

    const isAdmin = session.user.role === "ADMIN" || session.user.role === "PRINCIPAL";
    if (application.parentId !== session.user.id && !isAdmin) {
      return { error: "Access denied." };
    }

    const assessment = await db.tuitionAssessment.findUnique({
      where: { applicationId },
    });

    const invoices = await db.invoice.findMany({
      where: { applicationId },
      orderBy: { dueDate: "asc" },
    });

    const totalInvoiced = invoices.reduce((s, i) => s + i.total, 0);
    const totalPaid = invoices.reduce((s, i) => s + i.amountPaid, 0);

    return {
      tuitionAmount: assessment?.adminAdjustedAmount ?? assessment?.recommendedContribution ?? null,
      paymentPlan: assessment?.adminNotes ?? null,
      invoices,
      totalInvoiced,
      totalPaid,
      balance: totalInvoiced - totalPaid,
    };
  } catch (error) {
    console.error("Error fetching tuition:", error);
    return { error: "Failed to fetch tuition details." };
  }
}

export { PLAN_LABELS, PLAN_INSTALLMENTS };
