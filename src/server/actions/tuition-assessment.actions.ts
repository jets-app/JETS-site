"use server";

import { db } from "@/server/db";
import { auth } from "@/server/auth";
import { revalidatePath } from "next/cache";

// ==================== Types ====================
export interface TuitionAssessmentData {
  fatherIncome?: {
    occupation?: string;
    employer?: string;
    annualGrossSalary?: number;
    checkingSavings?: number;
    investmentIncome?: number;
    businessIncome?: number;
    rentalIncome?: number;
    otherIncome?: number;
  };
  motherIncome?: {
    occupation?: string;
    employer?: string;
    annualGrossSalary?: number;
    checkingSavings?: number;
    investmentIncome?: number;
    businessIncome?: number;
    rentalIncome?: number;
    otherIncome?: number;
  };
  assets?: {
    savings?: number;
    investments?: number;
    realEstate?: number;
    vehicles?: number;
    other?: number;
  };
  liabilities?: {
    mortgage?: number;
    carLoans?: number;
    studentLoans?: number;
    creditCards?: number;
    other?: number;
  };
  monthlyExpenses?: {
    housing?: number;
    utilities?: number;
    food?: number;
    transportation?: number;
    insurance?: number;
    medical?: number;
    childcare?: number;
    other?: number;
  };
  householdSize?: number;
  childrenInTuitionSchools?: number;
}

// ==================== Helper: Sum object values ====================
function sumValues(obj?: Record<string, unknown>): number {
  if (!obj) return 0;
  return Object.values(obj).reduce((sum: number, val) => {
    const num = typeof val === "number" ? val : 0;
    return sum + num;
  }, 0);
}

// ==================== Submit Tuition Assessment ====================
export async function submitTuitionAssessment(
  applicationId: string,
  data: TuitionAssessmentData
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

    const totalFatherIncome = sumValues(data.fatherIncome);
    const totalMotherIncome = sumValues(data.motherIncome);
    const totalAnnualIncome = totalFatherIncome + totalMotherIncome;
    const totalAssets = sumValues(data.assets);
    const totalLiabilities = sumValues(data.liabilities);
    const totalMonthlyExpenses = sumValues(data.monthlyExpenses);

    const existing = await db.tuitionAssessment.findUnique({
      where: { applicationId },
    });

    const assessmentData = {
      fatherIncome: data.fatherIncome as unknown as Record<string, unknown>,
      motherIncome: data.motherIncome as unknown as Record<string, unknown>,
      totalAnnualIncome: Math.round(totalAnnualIncome * 100), // store in cents
      assets: data.assets as unknown as Record<string, unknown>,
      totalAssets: Math.round(totalAssets * 100),
      liabilities: data.liabilities as unknown as Record<string, unknown>,
      totalLiabilities: Math.round(totalLiabilities * 100),
      monthlyExpenses: data.monthlyExpenses as unknown as Record<string, unknown>,
      totalMonthlyExpenses: Math.round(totalMonthlyExpenses * 100),
      householdSize: data.householdSize ?? null,
      childrenInTuitionSchools: data.childrenInTuitionSchools ?? null,
    };

    if (existing) {
      await db.tuitionAssessment.update({
        where: { applicationId },
        data: assessmentData,
      });
    } else {
      await db.tuitionAssessment.create({
        data: {
          applicationId,
          ...assessmentData,
        },
      });
    }

    revalidatePath("/portal/payments");
    return { success: true, message: "Tuition assessment submitted." };
  } catch (error) {
    console.error("Error submitting assessment:", error);
    return { error: "Failed to submit tuition assessment." };
  }
}

// ==================== Get Tuition Assessment ====================
export async function getTuitionAssessment(applicationId: string) {
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

    const assessment = await db.tuitionAssessment.findUnique({
      where: { applicationId },
    });

    return { assessment };
  } catch (error) {
    console.error("Error fetching assessment:", error);
    return { error: "Failed to fetch tuition assessment." };
  }
}

// ==================== Calculate Recommended Contribution ====================
export async function calculateRecommendedContribution(assessmentId: string) {
  const session = await auth();
  if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "PRINCIPAL")) {
    return { error: "Admin access required." };
  }

  try {
    const assessment = await db.tuitionAssessment.findUnique({
      where: { id: assessmentId },
    });

    if (!assessment) {
      return { error: "Assessment not found." };
    }

    // Formula: total income - essential expenses = available income
    // Recommended contribution = percentage of available income
    const annualIncome = assessment.totalAnnualIncome ?? 0;
    const annualExpenses = (assessment.totalMonthlyExpenses ?? 0) * 12;
    const availableIncome = Math.max(0, annualIncome - annualExpenses);

    // Sliding scale: 8-15% of available income depending on household size
    const householdSize = assessment.householdSize ?? 4;
    const childrenInSchools = assessment.childrenInTuitionSchools ?? 1;

    // Base percentage: 12%, adjusted for household size and children in tuition schools
    let percentage = 12;
    if (householdSize > 5) percentage -= 1.5;
    if (householdSize > 7) percentage -= 1.5;
    if (childrenInSchools > 1) percentage -= 1.5 * (childrenInSchools - 1);
    percentage = Math.max(5, Math.min(15, percentage));

    const recommended = Math.round(availableIncome * (percentage / 100));

    const calculationDetails = {
      annualIncome,
      annualExpenses,
      availableIncome,
      householdSize,
      childrenInSchools,
      percentageUsed: percentage,
      recommended,
    };

    await db.tuitionAssessment.update({
      where: { id: assessmentId },
      data: {
        recommendedContribution: recommended,
        calculationDetails: calculationDetails as unknown as Record<string, unknown>,
      },
    });

    revalidatePath("/admin/billing");
    return {
      success: true,
      recommended,
      details: calculationDetails,
    };
  } catch (error) {
    console.error("Error calculating contribution:", error);
    return { error: "Failed to calculate recommendation." };
  }
}

// ==================== Admin Review Assessment ====================
export async function adminReviewAssessment(
  assessmentId: string,
  adjustedAmount?: number,
  notes?: string
) {
  const session = await auth();
  if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "PRINCIPAL")) {
    return { error: "Admin access required." };
  }

  try {
    await db.tuitionAssessment.update({
      where: { id: assessmentId },
      data: {
        adminAdjustedAmount: adjustedAmount ?? null,
        adminNotes: notes ?? null,
        reviewedAt: new Date(),
        reviewedBy: session.user.id,
      },
    });

    revalidatePath("/admin/billing");
    return { success: true };
  } catch (error) {
    console.error("Error reviewing assessment:", error);
    return { error: "Failed to review assessment." };
  }
}
