"use server";

import { db } from "@/server/db";
import { auth } from "@/server/auth";
import { revalidatePath } from "next/cache";

// ==================== Types ====================
export interface ScholarshipFormData {
  // Family info
  familyInfo?: {
    fatherName?: string;
    motherName?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    phone?: string;
    email?: string;
    numberOfChildren?: number;
    childrenAges?: string;
  };

  // Father's income
  fatherIncome?: {
    occupation?: string;
    employer?: string;
    annualGrossSalary?: number;
    checkingSavings?: number;
    investmentIncome?: number;
    businessIncome?: number;
    rentalIncome?: number;
    otherIncome?: number;
    totalIncome?: number;
  };

  // Mother's income
  motherIncome?: {
    occupation?: string;
    employer?: string;
    annualGrossSalary?: number;
    checkingSavings?: number;
    investmentIncome?: number;
    businessIncome?: number;
    rentalIncome?: number;
    otherIncome?: number;
    totalIncome?: number;
  };

  // Expenses
  expenses?: {
    incomeTaxes?: {
      federalCurrentYear?: number;
      federalPriorYear?: number;
      stateCurrentYear?: number;
      statePriorYear?: number;
      ficaCurrentYear?: number;
      ficaPriorYear?: number;
      otherCurrentYear?: number;
      otherPriorYear?: number;
    };
    housing?: {
      type?: "rent" | "own";
      monthlyRent?: number;
      mortgagePayment?: number;
      propertyTax?: number;
      homeInsurance?: number;
      marketValue?: number;
      loanBalance?: number;
    };
    monthlyHousehold?: {
      clothing?: number;
      food?: number;
      householdHelp?: number;
      medical?: number;
    };
    utilities?: {
      gas?: number;
      electric?: number;
      water?: number;
      phone?: number;
    };
    automobile?: {
      year?: string;
      make?: string;
      model?: string;
      monthlyRepairs?: number;
      loanPayment?: number;
    };
  };

  // Scholarship request
  scholarshipRequest?: {
    affordableAmount?: number;
    requestedAmount?: number;
    reason?: string;
  };

  // References
  references?: Array<{
    name?: string;
    phone?: string;
    relationship?: string;
  }>;

  // Certification
  certified?: boolean;
}

// ==================== Submit Scholarship Application ====================
export async function submitScholarshipApplication(
  applicationId: string,
  data: ScholarshipFormData
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in." };
  }

  try {
    const application = await db.application.findUnique({
      where: { id: applicationId },
      select: { id: true, parentId: true },
    });

    if (!application) {
      return { error: "Application not found." };
    }

    if (application.parentId !== session.user.id) {
      return { error: "You do not own this application." };
    }

    // Check if already submitted
    const existing = await db.scholarshipApplication.findUnique({
      where: { applicationId },
    });

    if (existing) {
      // Update existing
      await db.scholarshipApplication.update({
        where: { applicationId },
        data: {
          financialInfo: data as unknown as Record<string, unknown>,
          affordableAmount: data.scholarshipRequest?.affordableAmount
            ? Math.round(data.scholarshipRequest.affordableAmount * 100)
            : null,
          requestedAmount: data.scholarshipRequest?.requestedAmount
            ? Math.round(data.scholarshipRequest.requestedAmount * 100)
            : null,
          essayResponse: data.scholarshipRequest?.reason ?? null,
          status: "SUBMITTED",
        },
      });
    } else {
      await db.scholarshipApplication.create({
        data: {
          applicationId,
          financialInfo: data as unknown as Record<string, unknown>,
          affordableAmount: data.scholarshipRequest?.affordableAmount
            ? Math.round(data.scholarshipRequest.affordableAmount * 100)
            : null,
          requestedAmount: data.scholarshipRequest?.requestedAmount
            ? Math.round(data.scholarshipRequest.requestedAmount * 100)
            : null,
          essayResponse: data.scholarshipRequest?.reason ?? null,
          status: "SUBMITTED",
        },
      });
    }

    revalidatePath("/portal/scholarship");
    revalidatePath("/admin/scholarships");
    return { success: true, message: "Scholarship application submitted successfully." };
  } catch (error) {
    console.error("Error submitting scholarship:", error);
    return { error: "Failed to submit scholarship application." };
  }
}

// ==================== Get Scholarship Application ====================
export async function getScholarshipApplication(applicationId: string) {
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

    const isAdmin = session.user.role === "ADMIN" || session.user.role === "PRINCIPAL";
    if (application.parentId !== session.user.id && !isAdmin) {
      return { error: "Access denied." };
    }

    const scholarship = await db.scholarshipApplication.findUnique({
      where: { applicationId },
      include: {
        application: {
          select: {
            referenceNumber: true,
            student: { select: { firstName: true, lastName: true } },
            parent: { select: { name: true, email: true } },
          },
        },
      },
    });

    return { scholarship };
  } catch (error) {
    console.error("Error fetching scholarship:", error);
    return { error: "Failed to fetch scholarship application." };
  }
}

// ==================== Review Scholarship (Admin) ====================
export async function reviewScholarship(
  scholarshipId: string,
  decision: "APPROVED" | "DENIED",
  approvedAmount?: number,
  notes?: string
) {
  const session = await auth();
  if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "PRINCIPAL")) {
    return { error: "Admin access required." };
  }

  try {
    const scholarship = await db.scholarshipApplication.findUnique({
      where: { id: scholarshipId },
    });

    if (!scholarship) {
      return { error: "Scholarship application not found." };
    }

    await db.scholarshipApplication.update({
      where: { id: scholarshipId },
      data: {
        status: decision,
        approvedAmount: decision === "APPROVED" && approvedAmount ? approvedAmount : null,
        reviewNotes: notes ?? null,
      },
    });

    revalidatePath("/admin/scholarships");
    revalidatePath("/portal/scholarship");
    return { success: true };
  } catch (error) {
    console.error("Error reviewing scholarship:", error);
    return { error: "Failed to review scholarship." };
  }
}

// ==================== Get All Scholarship Applications (Admin) ====================
export async function getAllScholarshipApplications(filters?: {
  status?: string;
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

    const scholarships = await db.scholarshipApplication.findMany({
      where,
      include: {
        application: {
          select: {
            referenceNumber: true,
            student: { select: { firstName: true, lastName: true } },
            parent: { select: { name: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Stats
    const all = await db.scholarshipApplication.findMany({
      select: { status: true, requestedAmount: true, approvedAmount: true },
    });

    const stats = {
      total: all.length,
      submitted: all.filter((s) => s.status === "SUBMITTED").length,
      underReview: all.filter((s) => s.status === "UNDER_REVIEW").length,
      approved: all.filter((s) => s.status === "APPROVED").length,
      denied: all.filter((s) => s.status === "DENIED").length,
      totalRequested: all.reduce((s, a) => s + (a.requestedAmount ?? 0), 0),
      totalApproved: all.reduce((s, a) => s + (a.approvedAmount ?? 0), 0),
    };

    return { scholarships, stats };
  } catch (error) {
    console.error("Error fetching scholarships:", error);
    return { error: "Failed to fetch scholarship applications." };
  }
}
