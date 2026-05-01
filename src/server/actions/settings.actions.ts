"use server";

import { db } from "@/server/db";
import { auth } from "@/server/auth";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required");
  }
  return session.user;
}

// Default record ID for the singleton SystemSettings row
const SETTINGS_ID = "settings";

export async function getSettings() {
  // Accessible to any authenticated user (admin UI needs it, but no sensitive
  // secrets are exposed here — QB tokens are only set server-side).
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  let settings = await db.systemSettings.findUnique({
    where: { id: SETTINGS_ID },
  });

  if (!settings) {
    settings = await db.systemSettings.create({
      data: { id: SETTINGS_ID },
    });
  }

  return settings;
}

export interface UpdateSettingsInput {
  currentAcademicYear?: string;
  openSchoolYears?: string[];
  applicationFeeAmount?: number; // in cents
  applicationsOpen?: boolean;
  schoolName?: string;
  schoolLegalName?: string;
  schoolEin?: string;
  schoolAddress?: string;
  schoolPhone?: string;
  schoolEmail?: string;
  calendlyUrl?: string | null;
  wireBankName?: string | null;
  wireAccountName?: string | null;
  wireRoutingNumber?: string | null;
  wireAccountNumber?: string | null;
  wireSwiftCode?: string | null;
  wireBankAddress?: string | null;
  wireInstructions?: string | null;
}

export async function updateSettings(data: UpdateSettingsInput) {
  await requireAdmin();

  // Sanitize: only pass through allowed fields
  const update: Record<string, unknown> = {};
  if (data.currentAcademicYear !== undefined)
    update.currentAcademicYear = data.currentAcademicYear.trim();
  if (data.openSchoolYears !== undefined)
    update.openSchoolYears = data.openSchoolYears.map((y) => y.trim()).filter(Boolean);
  if (data.applicationFeeAmount !== undefined)
    update.applicationFeeAmount = Math.max(0, Math.round(data.applicationFeeAmount));
  if (data.applicationsOpen !== undefined)
    update.applicationsOpen = data.applicationsOpen;
  if (data.schoolName !== undefined) update.schoolName = data.schoolName.trim();
  if (data.schoolLegalName !== undefined)
    update.schoolLegalName = data.schoolLegalName.trim();
  if (data.schoolEin !== undefined) update.schoolEin = data.schoolEin.trim();
  if (data.schoolAddress !== undefined)
    update.schoolAddress = data.schoolAddress.trim();
  if (data.schoolPhone !== undefined) update.schoolPhone = data.schoolPhone.trim();
  if (data.schoolEmail !== undefined) update.schoolEmail = data.schoolEmail.trim();
  if (data.calendlyUrl !== undefined)
    update.calendlyUrl = data.calendlyUrl?.trim() || null;

  // Wire fields — null clears, empty string clears, trimmed value otherwise.
  const wireFields = [
    "wireBankName",
    "wireAccountName",
    "wireRoutingNumber",
    "wireAccountNumber",
    "wireSwiftCode",
    "wireBankAddress",
    "wireInstructions",
  ] as const;
  for (const f of wireFields) {
    const v = data[f];
    if (v !== undefined) update[f] = v?.trim() || null;
  }

  const settings = await db.systemSettings.upsert({
    where: { id: SETTINGS_ID },
    update,
    create: { id: SETTINGS_ID, ...update },
  });

  revalidatePath("/admin/settings");
  revalidatePath("/admin/dashboard");
  return settings;
}

export async function toggleApplicationsOpen() {
  await requireAdmin();

  const current = await db.systemSettings.findUnique({
    where: { id: SETTINGS_ID },
  });

  const settings = await db.systemSettings.upsert({
    where: { id: SETTINGS_ID },
    update: { applicationsOpen: !(current?.applicationsOpen ?? true) },
    create: { id: SETTINGS_ID, applicationsOpen: false },
  });

  revalidatePath("/admin/settings");
  revalidatePath("/admin/dashboard");
  return settings;
}
