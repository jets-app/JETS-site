"use server";

import { db } from "@/server/db";
import { auth } from "@/server/auth";
import { revalidatePath } from "next/cache";

// ==================== Upload Student Photo ====================
export async function uploadStudentPhoto(
  applicationId: string,
  photoDataUrl: string
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in." };
  }

  if (!photoDataUrl || typeof photoDataUrl !== "string") {
    return { error: "Invalid photo data." };
  }

  // Basic validation: must look like a data URL for an image
  if (!photoDataUrl.startsWith("data:image/")) {
    return { error: "Invalid image format." };
  }

  // Enforce a reasonable size limit (~5MB base64 string ~= ~3.75MB binary)
  const MAX_LENGTH = 7_000_000;
  if (photoDataUrl.length > MAX_LENGTH) {
    return {
      error: "Image is too large. Please use an image under 5MB.",
    };
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
      return { error: "You do not have permission to modify this application." };
    }

    if (!application.student) {
      return {
        error:
          "Please complete the student information section before uploading a photo.",
      };
    }

    if (application.status !== "DRAFT") {
      return { error: "This application has already been submitted." };
    }

    await db.student.update({
      where: { applicationId },
      data: { photoUrl: photoDataUrl },
    });

    revalidatePath(`/portal/applications/${applicationId}/photo`);
    revalidatePath(`/portal/applications/${applicationId}/edit`);
    return { success: true };
  } catch (error) {
    console.error("Error uploading student photo:", error);
    return { error: "Failed to upload photo. Please try again." };
  }
}

// ==================== Remove Student Photo ====================
export async function removeStudentPhoto(applicationId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in." };
  }

  try {
    const application = await db.application.findUnique({
      where: { id: applicationId },
      include: { student: true },
    });

    if (!application || application.parentId !== session.user.id) {
      return { error: "Application not found." };
    }

    if (!application.student) {
      return { error: "No student record found." };
    }

    await db.student.update({
      where: { applicationId },
      data: { photoUrl: null },
    });

    revalidatePath(`/portal/applications/${applicationId}/photo`);
    revalidatePath(`/portal/applications/${applicationId}/edit`);
    return { success: true };
  } catch (error) {
    console.error("Error removing student photo:", error);
    return { error: "Failed to remove photo. Please try again." };
  }
}
