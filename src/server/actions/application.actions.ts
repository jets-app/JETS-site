"use server";

import { db } from "@/server/db";
import { auth } from "@/server/auth";
import { revalidatePath } from "next/cache";
import type { ApplicationFormData } from "@/lib/validators/application";

// ==================== Generate Reference Number ====================
async function generateReferenceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `JETS-${year}-`;

  const lastApp = await db.application.findFirst({
    where: { referenceNumber: { startsWith: prefix } },
    orderBy: { referenceNumber: "desc" },
    select: { referenceNumber: true },
  });

  let nextNum = 1;
  if (lastApp) {
    const lastNum = parseInt(lastApp.referenceNumber.split("-")[2], 10);
    if (!isNaN(lastNum)) nextNum = lastNum + 1;
  }

  return `${prefix}${String(nextNum).padStart(4, "0")}`;
}

// ==================== Create Application ====================
export async function getOpenSchoolYears() {
  const settings = await db.systemSettings.findFirst({
    where: { id: "settings" },
  });
  return settings?.openSchoolYears ?? ["2026-2027"];
}

export async function createApplication(selectedYear?: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in to create an application." };
  }

  try {
    // One application per account — check if they already have one
    const existingApplication = await db.application.findFirst({
      where: { parentId: session.user.id },
      select: { id: true, status: true },
      orderBy: { createdAt: "desc" },
    });

    if (existingApplication) {
      return {
        error: "You already have an application.",
        existingApplicationId: existingApplication.id,
      };
    }

    // Get system settings for academic year
    const settings = await db.systemSettings.findFirst({
      where: { id: "settings" },
    });

    const openYears = settings?.openSchoolYears ?? ["2026-2027"];
    const academicYear = selectedYear && openYears.includes(selectedYear)
      ? selectedYear
      : settings?.currentAcademicYear ?? "2026-2027";
    const feeAmount = settings?.applicationFeeAmount ?? 50000;

    // Check if applications are open
    if (settings && !settings.applicationsOpen) {
      return { error: "Applications are currently closed." };
    }

    const referenceNumber = await generateReferenceNumber();

    const application = await db.application.create({
      data: {
        referenceNumber,
        academicYear,
        parentId: session.user.id,
        applicationFeeAmount: feeAmount,
        currentStep: 1,
        completionPct: 0,
      },
    });

    revalidatePath("/portal/applications");
    return { success: true, applicationId: application.id };
  } catch (error) {
    console.error("Error creating application:", error);
    return { error: "Failed to create application. Please try again." };
  }
}

// ==================== Update Application Step ====================
export async function updateApplicationStep(
  applicationId: string,
  step: number,
  data: Record<string, unknown>
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in." };
  }

  try {
    const application = await db.application.findUnique({
      where: { id: applicationId },
      include: { student: true },
    });

    if (!application) {
      return { error: "Application not found." };
    }

    if (application.parentId !== session.user.id) {
      return { error: "You don't have permission to edit this application." };
    }

    if (application.status !== "DRAFT") {
      return { error: "This application has already been submitted." };
    }

    // Build the update payload based on step
    const updateData: Record<string, unknown> = {};

    switch (step) {
      case 1: {
        // Student info — create/update Student record
        const studentData = data as {
          firstName: string;
          lastName: string;
          middleName?: string;
          preferredName?: string;
          dateOfBirth: string;
          phone?: string;
          email?: string;
          addressLine1?: string;
          addressLine2?: string;
          city?: string;
          state?: string;
          zipCode?: string;
          country?: string;
          familyPhone?: string;
        };

        const dob = new Date(studentData.dateOfBirth);

        if (application.student) {
          await db.student.update({
            where: { applicationId },
            data: {
              firstName: studentData.firstName,
              lastName: studentData.lastName,
              middleName: studentData.middleName || null,
              preferredName: studentData.preferredName || null,
              dateOfBirth: dob,
              phone: studentData.phone || null,
              email: studentData.email || null,
              addressLine1: studentData.addressLine1 || null,
              addressLine2: studentData.addressLine2 || null,
              city: studentData.city || null,
              state: studentData.state || null,
              zipCode: studentData.zipCode || null,
              country: studentData.country || "United States",
            },
          });
        } else {
          await db.student.create({
            data: {
              applicationId,
              firstName: studentData.firstName,
              lastName: studentData.lastName,
              middleName: studentData.middleName || null,
              preferredName: studentData.preferredName || null,
              dateOfBirth: dob,
              phone: studentData.phone || null,
              email: studentData.email || null,
              addressLine1: studentData.addressLine1 || null,
              addressLine2: studentData.addressLine2 || null,
              city: studentData.city || null,
              state: studentData.state || null,
              zipCode: studentData.zipCode || null,
              country: studentData.country || "United States",
            },
          });
        }
        break;
      }
      case 2:
        updateData.hebrewNames = data;
        break;
      case 3:
        updateData.fatherInfo = (data as { father: unknown }).father ?? null;
        updateData.motherInfo = (data as { mother: unknown }).mother ?? null;
        updateData.guardianInfo = (data as { guardian: unknown }).guardian ?? null;
        updateData.emergencyContact =
          (data as { emergencyContact: unknown }).emergencyContact ?? null;
        break;
      case 4:
        updateData.siblings = (data as { siblings: unknown }).siblings ?? null;
        updateData.grandparents = {
          closeToSiblings: (data as { closeToSiblings: boolean }).closeToSiblings,
          grandparentsFather: (data as { grandparentsFather: unknown })
            .grandparentsFather,
          grandparentsMother: (data as { grandparentsMother: unknown })
            .grandparentsMother,
        };
        break;
      case 5:
        updateData.schoolHistory = data;
        break;
      case 6:
        updateData.parentQuestions = data;
        break;
      case 7:
        updateData.applicantAssessment = data;
        break;
      case 8:
        updateData.studiesInfo = (data as { academics: unknown }).academics ?? null;
        updateData.tradePreferences =
          (data as { trades: unknown }).trades ?? null;
        updateData.extracurricular =
          (data as { extracurricular: unknown }).extracurricular ?? null;
        break;
      case 9:
        updateData.essay = (data as { essay: string }).essay ?? null;
        updateData.additionalQuestions = {
          gedInterest: (data as { gedInterest: boolean }).gedInterest,
          gemarahMaterial: (data as { gemarahMaterial: string }).gemarahMaterial,
          chassidusMaterial: (data as { chassidusMaterial: string })
            .chassidusMaterial,
          halachaMaterial: (data as { halachaMaterial: string }).halachaMaterial,
          otherFactors: (data as { otherFactors: string }).otherFactors,
        };
        break;
      case 10:
        // Photo URL is handled separately (upload), recommendations created below
        break;
    }

    // Update the current step to the max visited
    const newCurrentStep = Math.max(application.currentStep, step);

    // Calculate completion percentage
    const completionPct = Math.round((step / 10) * 100);

    await db.application.update({
      where: { id: applicationId },
      data: {
        ...updateData,
        currentStep: newCurrentStep,
        completionPct: Math.max(application.completionPct, completionPct),
      },
    });

    revalidatePath(`/portal/applications/${applicationId}/edit`);
    return { success: true };
  } catch (error) {
    console.error("Error updating application step:", error);
    return { error: "Failed to save. Please try again." };
  }
}

// ==================== Add Recommendation Reference ====================
export async function addRecommendation(
  applicationId: string,
  data: {
    name: string;
    email: string;
    phone?: string;
    relationship: string;
  }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in." };
  }

  try {
    const application = await db.application.findUnique({
      where: { id: applicationId },
      include: { recommendations: true },
    });

    if (!application || application.parentId !== session.user.id) {
      return { error: "Application not found." };
    }

    if (application.recommendations.length >= 2) {
      return { error: "Maximum of 2 recommendations allowed." };
    }

    // Set expiry 60 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 60);

    await db.recommendation.create({
      data: {
        applicationId,
        refereeName: data.name,
        refereeEmail: data.email,
        refereePhone: data.phone || null,
        refereeRelation: data.relationship,
        expiresAt,
      },
    });

    revalidatePath(`/portal/applications/${applicationId}/edit`);
    return { success: true };
  } catch (error) {
    console.error("Error adding recommendation:", error);
    return { error: "Failed to add recommendation." };
  }
}

// ==================== Remove Recommendation ====================
export async function removeRecommendation(
  applicationId: string,
  recommendationId: string
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in." };
  }

  try {
    const rec = await db.recommendation.findUnique({
      where: { id: recommendationId },
      include: { application: true },
    });

    if (!rec || rec.application.parentId !== session.user.id) {
      return { error: "Recommendation not found." };
    }

    await db.recommendation.delete({ where: { id: recommendationId } });

    revalidatePath(`/portal/applications/${applicationId}/edit`);
    return { success: true };
  } catch (error) {
    console.error("Error removing recommendation:", error);
    return { error: "Failed to remove recommendation." };
  }
}

// ==================== Submit Application ====================
export async function submitApplication(applicationId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in." };
  }

  try {
    const application = await db.application.findUnique({
      where: { id: applicationId },
      include: { student: true, recommendations: true },
    });

    if (!application || application.parentId !== session.user.id) {
      return { error: "Application not found." };
    }

    if (application.status !== "DRAFT") {
      return { error: "Application has already been submitted." };
    }

    // Validate all requirements
    const errors: string[] = [];

    if (!application.student) {
      errors.push("Student information is incomplete.");
    }

    if (!application.essay) {
      errors.push("Essay is required.");
    }

    if (application.recommendations.length < 2) {
      errors.push("Two recommendation references are required.");
    }

    if (!application.applicationFeePaid) {
      errors.push("Application fee must be paid.");
    }

    if (errors.length > 0) {
      return { error: errors.join(" ") };
    }

    await db.application.update({
      where: { id: applicationId },
      data: {
        status: "SUBMITTED",
        completionPct: 100,
        submittedAt: new Date(),
      },
    });

    revalidatePath("/portal/applications");
    revalidatePath(`/portal/applications/${applicationId}/edit`);
    return { success: true };
  } catch (error) {
    console.error("Error submitting application:", error);
    return { error: "Failed to submit application. Please try again." };
  }
}

// ==================== Get Application by ID ====================
export async function getApplicationById(id: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const application = await db.application.findUnique({
    where: { id },
    include: {
      student: true,
      recommendations: true,
      payments: true,
    },
  });

  if (!application) return null;

  // Parents can only see their own; admins can see all
  if (
    application.parentId !== session.user.id &&
    session.user.role !== "ADMIN"
  ) {
    return null;
  }

  return application;
}

// ==================== Get My Applications ====================
export async function getMyApplications() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return db.application.findMany({
    where: { parentId: session.user.id },
    include: { student: true },
    orderBy: { createdAt: "desc" },
  });
}

// ==================== Apply Discount Code ====================
export async function applyDiscountCode(
  applicationId: string,
  code: string
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in." };
  }

  try {
    const application = await db.application.findUnique({
      where: { id: applicationId },
    });

    if (!application || application.parentId !== session.user.id) {
      return { error: "Application not found." };
    }

    const discount = await db.discountCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!discount || !discount.isActive) {
      return { error: "Invalid or expired discount code." };
    }

    if (discount.expiresAt && discount.expiresAt < new Date()) {
      return { error: "This discount code has expired." };
    }

    if (discount.maxUses && discount.usedCount >= discount.maxUses) {
      return { error: "This discount code has reached its usage limit." };
    }

    let discountAmount = 0;
    if (discount.amountOff) {
      discountAmount = discount.amountOff;
    } else if (discount.percentOff) {
      discountAmount = Math.round(
        (application.applicationFeeAmount * discount.percentOff) / 100
      );
    }

    await db.application.update({
      where: { id: applicationId },
      data: {
        discountCode: code.toUpperCase(),
        discountAmount,
      },
    });

    await db.discountCode.update({
      where: { id: discount.id },
      data: { usedCount: { increment: 1 } },
    });

    revalidatePath(`/portal/applications/${applicationId}/edit`);
    return { success: true, discountAmount };
  } catch (error) {
    console.error("Error applying discount:", error);
    return { error: "Failed to apply discount code." };
  }
}
