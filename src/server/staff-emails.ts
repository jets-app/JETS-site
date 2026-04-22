export const STAFF_EMAILS = {
  principals: ["rabbisufrin@jetsschool.org", "matt@jetsschool.org"],
  office: ["memem@jetsschool.org", "grace@jetsschool.org"],
} as const;

export type StaffRole = keyof typeof STAFF_EMAILS;

export function getStaffEmails(...roles: StaffRole[]): string[] {
  const set = new Set<string>();
  for (const role of roles) {
    for (const email of STAFF_EMAILS[role]) set.add(email);
  }
  return Array.from(set);
}
