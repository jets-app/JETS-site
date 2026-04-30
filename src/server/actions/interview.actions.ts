"use server";

import { db } from "@/server/db";
import { auth } from "@/server/auth";
import { revalidatePath } from "next/cache";
import { createZoomInterview } from "@/server/zoom";
import { sendEmail } from "@/server/email";
import { getStaffEmails } from "@/server/staff-emails";

const TIMEZONE = "America/Los_Angeles";
const SLOT_MINUTES = 30;
const LOOKAHEAD_DAYS = 14;

/**
 * Return available 30-minute slots over the next LOOKAHEAD_DAYS days for any
 * principal, excluding already-booked interviews.
 *
 * This reads weekly availability rows from `InterviewAvailability`. If a user
 * has no rows at all, we fall back to defaults of Mon-Thu 9:00-17:00 so the
 * scheduler works out of the box.
 */
export async function getAvailableInterviewSlots(): Promise<string[]> {
  // Load all principals + their availability
  const principals = await db.user.findMany({
    where: { role: { in: ["PRINCIPAL", "ADMIN"] } },
    select: { id: true, interviewAvailability: true },
  });

  // Existing bookings that would block a slot
  const booked = await db.application.findMany({
    where: {
      interviewDate: { not: null },
      interviewStatus: { in: ["SCHEDULED"] },
    },
    select: { interviewDate: true, interviewPrincipalId: true },
  });

  const bookedSet = new Set(
    booked
      .filter((b) => b.interviewDate)
      .map((b) => `${b.interviewPrincipalId ?? ""}|${b.interviewDate!.toISOString()}`),
  );

  const slots = new Set<string>();
  const now = new Date();
  const minStart = new Date(now.getTime() + 60 * 60 * 1000); // at least 1 hr out

  for (let d = 0; d < LOOKAHEAD_DAYS; d++) {
    const day = new Date(now);
    day.setDate(day.getDate() + d);
    const dayOfWeek = day.getDay(); // 0-6

    for (const principal of principals) {
      const windows = principal.interviewAvailability.filter(
        (a) => a.dayOfWeek === dayOfWeek,
      );
      const effectiveWindows =
        windows.length > 0
          ? windows
          : defaultAvailability(dayOfWeek);

      for (const win of effectiveWindows) {
        for (
          let m = win.startMinutes;
          m + SLOT_MINUTES <= win.endMinutes;
          m += SLOT_MINUTES
        ) {
          const slotStart = buildLocalDate(day, m);
          if (slotStart < minStart) continue;
          const key = `${principal.id}|${slotStart.toISOString()}`;
          if (bookedSet.has(key)) continue;
          slots.add(slotStart.toISOString());
        }
      }
    }
  }

  return Array.from(slots).sort();
}

/**
 * Book an interview slot. Assigns the first principal whose availability covers
 * the chosen time and who isn't already booked at that time. Creates a Zoom
 * meeting if Zoom is configured. Emails both the applicant and principals.
 */
export async function bookInterview(
  applicationId: string,
  slotStartIso: string,
): Promise<{ success?: true; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Please sign in." };

  const application = await db.application.findUnique({
    where: { id: applicationId },
    include: {
      student: { select: { firstName: true, lastName: true } },
      parent: { select: { name: true, email: true, phone: true } },
    },
  });
  if (!application) return { error: "Application not found." };
  if (application.parentId !== session.user.id) return { error: "Access denied." };
  if (application.status !== "INTERVIEW_SCHEDULED") {
    return { error: "This application is not ready for interview scheduling." };
  }

  const slotStart = new Date(slotStartIso);
  if (isNaN(slotStart.getTime())) return { error: "Invalid time." };
  if (slotStart < new Date(Date.now() + 60 * 60 * 1000)) {
    return { error: "Please pick a time at least an hour from now." };
  }

  // Pick a principal who's available & free at this time
  const principals = await db.user.findMany({
    where: { role: { in: ["PRINCIPAL", "ADMIN"] } },
    select: { id: true, name: true, email: true, interviewAvailability: true },
  });

  let chosenPrincipal: { id: string; name: string; email: string } | null = null;
  for (const p of principals) {
    if (!isSlotAllowed(slotStart, p.interviewAvailability)) continue;
    const conflict = await db.application.findFirst({
      where: {
        interviewPrincipalId: p.id,
        interviewDate: slotStart,
        interviewStatus: "SCHEDULED",
      },
      select: { id: true },
    });
    if (conflict) continue;
    chosenPrincipal = { id: p.id, name: p.name, email: p.email };
    break;
  }

  if (!chosenPrincipal) {
    return { error: "That time was just taken — please pick another." };
  }

  const studentName = application.student
    ? `${application.student.firstName} ${application.student.lastName}`
    : "Applicant";
  const endsAt = new Date(slotStart.getTime() + SLOT_MINUTES * 60 * 1000);

  const zoom = await createZoomInterview({
    topic: `JETS Interview — ${studentName}`,
    startIso: slotStart.toISOString(),
    durationMinutes: SLOT_MINUTES,
    agenda: `Admissions interview with ${application.parent.name}`,
  });

  await db.application.update({
    where: { id: applicationId },
    data: {
      interviewStatus: "SCHEDULED",
      interviewDate: slotStart,
      interviewEndsAt: endsAt,
      interviewPrincipalId: chosenPrincipal.id,
      interviewZoomMeetingId: zoom?.id ?? null,
      interviewZoomJoinUrl: zoom?.joinUrl ?? null,
      interviewZoomStartUrl: zoom?.startUrl ?? null,
      interviewZoomPasscode: zoom?.passcode ?? null,
    },
  });

  // Send confirmations — don't block success on email/SMS delivery
  sendBookingEmails({
    studentName,
    parentName: application.parent.name,
    parentEmail: application.parent.email,
    parentPhone: application.parent.phone,
    principalEmail: chosenPrincipal.email,
    principalName: chosenPrincipal.name,
    startAt: slotStart,
    endsAt,
    zoomJoinUrl: zoom?.joinUrl ?? null,
    zoomStartUrl: zoom?.startUrl ?? null,
    zoomPasscode: zoom?.passcode ?? null,
    referenceNumber: application.referenceNumber,
  }).catch((err) => console.error("Interview email error:", err));

  revalidatePath("/portal/dashboard");
  revalidatePath(`/admin/applications/${applicationId}`);
  return { success: true };
}

async function sendBookingEmails(params: {
  studentName: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string | null;
  principalName: string;
  principalEmail: string;
  startAt: Date;
  endsAt: Date;
  zoomJoinUrl: string | null;
  zoomStartUrl: string | null;
  zoomPasscode: string | null;
  referenceNumber: string;
}) {
  const when = formatSlotLong(params.startAt);
  const zoomParent = params.zoomJoinUrl
    ? `Join Zoom: ${params.zoomJoinUrl}${params.zoomPasscode ? `\nPasscode: ${params.zoomPasscode}` : ""}`
    : "Zoom link will be emailed separately.";

  const zoomStaff = params.zoomStartUrl
    ? `Host start link: ${params.zoomStartUrl}\nJoin link: ${params.zoomJoinUrl}${params.zoomPasscode ? `\nPasscode: ${params.zoomPasscode}` : ""}`
    : "Zoom link still needs to be added manually.";

  // Parent confirmation
  await sendEmail({
    to: params.parentEmail,
    subject: `Interview confirmed — ${when}`,
    html: htmlWrap(
      `Dear ${params.parentName},\n\n` +
        `Your admissions interview for ${params.studentName} is confirmed.\n\n` +
        `When: ${when} (Los Angeles time)\n` +
        `Duration: 30 minutes\n\n` +
        `${zoomParent}\n\n` +
        `Reference: ${params.referenceNumber}\n\n` +
        `We look forward to meeting you.\n\n` +
        `Warm regards,\nThe JETS Admissions Team`,
    ),
  });

  // Parent SMS confirmation — short, with the Zoom link if available
  if (params.parentPhone) {
    const { sendSMS } = await import("@/server/sms");
    const smsBody = params.zoomJoinUrl
      ? `JETS School: ${params.studentName}'s interview confirmed for ${when} (LA time). Zoom: ${params.zoomJoinUrl}`
      : `JETS School: ${params.studentName}'s interview confirmed for ${when} (LA time). Zoom link will follow by email.`;
    await sendSMS({ to: params.parentPhone, body: smsBody });
  }

  // Assigned principal + both principals (FYI) + office (FYI)
  const staffRecipients = new Set<string>([
    params.principalEmail,
    ...getStaffEmails("principals", "office"),
  ]);
  for (const to of staffRecipients) {
    await sendEmail({
      to,
      subject: `Interview booked: ${params.studentName} — ${when}`,
      html: htmlWrap(
        `${params.studentName}'s admissions interview is confirmed.\n\n` +
          `When: ${when} (Los Angeles time)\n` +
          `Duration: 30 minutes\n` +
          `Host: ${params.principalName} (${params.principalEmail})\n` +
          `Parent: ${params.parentName} (${params.parentEmail})\n\n` +
          `${zoomStaff}\n\n` +
          `Reference: ${params.referenceNumber}`,
      ),
    });
  }
}

function defaultAvailability(dayOfWeek: number) {
  // Mon (1) through Thu (4), 9:00 - 17:00 LA time
  if (dayOfWeek >= 1 && dayOfWeek <= 4) {
    return [{ startMinutes: 9 * 60, endMinutes: 17 * 60 }];
  }
  return [];
}

function isSlotAllowed(
  slotStart: Date,
  availability: { dayOfWeek: number; startMinutes: number; endMinutes: number }[],
) {
  const dow = slotStart.getDay();
  const mins = slotStart.getHours() * 60 + slotStart.getMinutes();
  const windows =
    availability.filter((a) => a.dayOfWeek === dow).length > 0
      ? availability.filter((a) => a.dayOfWeek === dow)
      : defaultAvailability(dow);
  return windows.some(
    (w) => mins >= w.startMinutes && mins + SLOT_MINUTES <= w.endMinutes,
  );
}

function buildLocalDate(day: Date, minutesFromMidnight: number) {
  const d = new Date(day);
  d.setHours(Math.floor(minutesFromMidnight / 60), minutesFromMidnight % 60, 0, 0);
  return d;
}

function formatSlotLong(d: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: TIMEZONE,
    timeZoneName: "short",
  }).format(d);
}

function htmlWrap(body: string) {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #A30018;">
        <h1 style="color: #A30018; font-size: 24px; margin: 0;">JETS School</h1>
      </div>
      <div style="padding: 30px 0; white-space: pre-wrap; line-height: 1.6; color: #333;">
        ${body.replace(/\n/g, "<br>")}
      </div>
      <div style="border-top: 1px solid #eee; padding: 20px 0; text-align: center; color: #999; font-size: 12px;">
        Jewish Educational Trade School · 16601 Rinaldi Street, Granada Hills, CA · (818) 831-3000
      </div>
    </div>
  `;
}
