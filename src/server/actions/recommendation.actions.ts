"use server";

import { db } from "@/server/db";
import { auth } from "@/server/auth";
import {
  recommendationResponseSchema,
  refereeInputSchema,
  type RefereeInput,
  type RecommendationResponse,
} from "@/lib/validators/recommendation";

// ==================== Create Recommendation ====================

export async function createRecommendation(
  applicationId: string,
  referee: RefereeInput
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in to add a reference" };
  }

  const validated = refereeInputSchema.safeParse(referee);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const { name, email, phone, relation } = validated.data;

  try {
    // Verify the application belongs to this user (or caller is admin)
    const application = await db.application.findUnique({
      where: { id: applicationId },
      select: { parentId: true },
    });

    if (!application) {
      return { error: "Application not found" };
    }

    if (
      application.parentId !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return { error: "You do not have permission to modify this application" };
    }

    // Check if there are already 2 recommendations
    const existingCount = await db.recommendation.count({
      where: { applicationId },
    });

    if (existingCount >= 2) {
      return { error: "This application already has 2 references" };
    }

    // Check for duplicate email on this application
    const duplicate = await db.recommendation.findFirst({
      where: {
        applicationId,
        refereeEmail: email.toLowerCase(),
      },
    });

    if (duplicate) {
      return { error: "A reference with this email has already been added" };
    }

    // Create the recommendation with a 30-day expiry
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const recommendation = await db.recommendation.create({
      data: {
        applicationId,
        refereeName: name,
        refereeEmail: email.toLowerCase(),
        refereePhone: phone || null,
        refereeRelation: relation,
        status: "PENDING",
        expiresAt,
      },
    });

    // TODO: Send email to referee with the recommendation link
    // The link will be: ${process.env.NEXT_PUBLIC_APP_URL}/r/${recommendation.token}

    return { success: true, recommendationId: recommendation.id };
  } catch (error) {
    console.error("Error creating recommendation:", error);
    return { error: "Something went wrong. Please try again." };
  }
}

// ==================== Get Recommendations for Application ====================

export async function getRecommendationsForApplication(
  applicationId: string
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in" };
  }

  try {
    const application = await db.application.findUnique({
      where: { id: applicationId },
      select: { parentId: true },
    });

    if (!application) {
      return { error: "Application not found" };
    }

    const isAdmin =
      session.user.role === "ADMIN" ||
      session.user.role === "PRINCIPAL" ||
      session.user.role === "REVIEWER";
    const isOwner = application.parentId === session.user.id;

    if (!isAdmin && !isOwner) {
      return { error: "You do not have permission to view these recommendations" };
    }

    const recommendations = await db.recommendation.findMany({
      where: { applicationId },
      orderBy: { sentAt: "asc" },
    });

    // Parents can only see status, not content
    if (!isAdmin) {
      return {
        success: true,
        recommendations: recommendations.map((rec) => ({
          id: rec.id,
          refereeName: rec.refereeName,
          refereeEmail: rec.refereeEmail,
          refereeRelation: rec.refereeRelation,
          status: rec.status,
          sentAt: rec.sentAt,
          submittedAt: rec.submittedAt,
          expiresAt: rec.expiresAt,
        })),
      };
    }

    // Admins get full responses
    return {
      success: true,
      recommendations: recommendations.map((rec) => ({
        id: rec.id,
        refereeName: rec.refereeName,
        refereeEmail: rec.refereeEmail,
        refereePhone: rec.refereePhone,
        refereeRelation: rec.refereeRelation,
        status: rec.status,
        responses: rec.responses as RecommendationResponse | null,
        sentAt: rec.sentAt,
        viewedAt: rec.viewedAt,
        submittedAt: rec.submittedAt,
        expiresAt: rec.expiresAt,
      })),
    };
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return { error: "Something went wrong. Please try again." };
  }
}

// ==================== Submit Recommendation (Public - No Auth) ====================

export async function submitRecommendation(
  token: string,
  responses: RecommendationResponse
) {
  const validated = recommendationResponseSchema.safeParse(responses);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  try {
    const recommendation = await db.recommendation.findUnique({
      where: { token },
    });

    if (!recommendation) {
      return { error: "Invalid recommendation link" };
    }

    if (recommendation.status === "COMPLETED") {
      return { error: "This recommendation has already been submitted" };
    }

    if (new Date() > recommendation.expiresAt) {
      // Mark as expired
      await db.recommendation.update({
        where: { id: recommendation.id },
        data: { status: "EXPIRED" },
      });
      return { error: "This recommendation link has expired. Please contact the applicant to request a new link." };
    }

    await db.recommendation.update({
      where: { id: recommendation.id },
      data: {
        status: "COMPLETED",
        responses: validated.data,
        submittedAt: new Date(),
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error submitting recommendation:", error);
    return { error: "Something went wrong. Please try again." };
  }
}

// ==================== Resend Recommendation Request (Admin Only) ====================

export async function resendRecommendationRequest(
  recommendationId: string
) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { error: "Only administrators can resend recommendation requests" };
  }

  try {
    const recommendation = await db.recommendation.findUnique({
      where: { id: recommendationId },
      include: {
        application: {
          include: {
            student: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });

    if (!recommendation) {
      return { error: "Recommendation not found" };
    }

    if (recommendation.status === "COMPLETED") {
      return { error: "This recommendation has already been completed" };
    }

    // Reset expiry to 30 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await db.recommendation.update({
      where: { id: recommendationId },
      data: {
        status: "SENT",
        expiresAt,
        sentAt: new Date(),
      },
    });

    // TODO: Send email to referee with the recommendation link
    // The link will be: ${process.env.NEXT_PUBLIC_APP_URL}/r/${recommendation.token}

    return { success: true };
  } catch (error) {
    console.error("Error resending recommendation request:", error);
    return { error: "Something went wrong. Please try again." };
  }
}

// ==================== Get Recommendation by Token (Public - No Auth) ====================

export async function getRecommendationByToken(token: string) {
  try {
    const recommendation = await db.recommendation.findUnique({
      where: { token },
      include: {
        application: {
          include: {
            student: {
              select: { firstName: true, lastName: true },
            },
            parent: {
              select: { name: true },
            },
          },
        },
      },
    });

    if (!recommendation) {
      return { error: "not_found" as const };
    }

    if (recommendation.status === "COMPLETED") {
      return { error: "already_submitted" as const };
    }

    if (new Date() > recommendation.expiresAt) {
      await db.recommendation.update({
        where: { id: recommendation.id },
        data: { status: "EXPIRED" },
      });
      return { error: "expired" as const };
    }

    // Mark as viewed if first visit
    if (!recommendation.viewedAt) {
      await db.recommendation.update({
        where: { id: recommendation.id },
        data: {
          status: "VIEWED",
          viewedAt: new Date(),
        },
      });
    }

    return {
      success: true,
      data: {
        id: recommendation.id,
        token: recommendation.token,
        refereeName: recommendation.refereeName,
        refereeEmail: recommendation.refereeEmail,
        refereeRelation: recommendation.refereeRelation,
        studentName: recommendation.application.student
          ? `${recommendation.application.student.firstName} ${recommendation.application.student.lastName}`
          : "the applicant",
        parentName: recommendation.application.parent.name,
        expiresAt: recommendation.expiresAt,
      },
    };
  } catch (error) {
    console.error("Error fetching recommendation by token:", error);
    return { error: "server_error" as const };
  }
}
