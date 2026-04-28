/**
 * Role helpers — central definition of who can do what at a high level.
 *
 * - ADMIN: full control. Only role that can override pipeline status, change
 *   system settings, and manage staff accounts.
 * - PRINCIPAL: makes admissions decisions. Conducts interviews.
 * - SECRETARY: day-to-day office work on applications. Same access as PRINCIPAL
 *   for the workflow pages, but can't override status, change settings, or
 *   add staff (those are ADMIN-only).
 * - REVIEWER: read + comment only.
 * - PARENT: their own application only.
 */

export const STAFF_ROLES = ["ADMIN", "PRINCIPAL", "SECRETARY", "REVIEWER"] as const;
export type StaffRole = (typeof STAFF_ROLES)[number];

export const ASSIGNABLE_STAFF_ROLES = ["ADMIN", "PRINCIPAL", "SECRETARY", "REVIEWER"] as const;

export function isStaff(role: string | null | undefined): boolean {
  return !!role && (STAFF_ROLES as readonly string[]).includes(role);
}

/** Has access to admin pages (applications, students, families, etc.) */
export function canAccessAdmin(role: string | null | undefined): boolean {
  return isStaff(role);
}

/** Can change system settings, manage staff, override pipeline */
export function isFullAdmin(role: string | null | undefined): boolean {
  return role === "ADMIN";
}
