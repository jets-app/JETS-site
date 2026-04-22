import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { sendEmail } from "@/server/email";

export const runtime = "nodejs";
// Allow long execution in case many reminders are due
export const maxDuration = 60;

/**
 * Runs every 15 minutes via Vercel Cron (see vercel.ts). Sends:
 *   - 24-hour reminder to applicants whose interview is in ~24 hours
 *   - 1-hour reminder to applicants whose interview is in ~1 hour
 *   - Scheduling nudge to applicants who've been at INTERVIEW_SCHEDULED for
 *     3+ days without picking a time.
 *
 * Idempotent: each send is gated on a sentAt column so the same message won't
 * go twice even if the cron fires multiple times.
 */
export async function GET(request: Request) {
  // Vercel Cron adds this header — accept either that or a manual admin call
  // from our own app. Reject anything else.
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  const isVercelCron = authHeader === `Bearer ${cronSecret}`;
  if (!isVercelCron && cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const results = {
    reminder24h: 0,
    reminder1h: 0,
    nudge: 0,
    errors: [] as string[],
  };

  // ---------- 24-hour reminders ----------
  const in24hStart = new Date(now.getTime() + 23 * 60 * 60 * 1000);
  const in24hEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000);

  const upcoming24h = await db.application.findMany({
    where: {
      interviewDate: { gte: in24hStart, lte: in24hEnd },
      interviewStatus: "SCHEDULED",
      interviewReminder24hSentAt: null,
    },
    include: {
      student: { select: { firstName: true, lastName: true } },
      parent: { select: { name: true, email: true } },
    },
  });

  for (const app of upcoming24h) {
    try {
      await sendInterviewReminder(app, "24 hours");
      await db.application.update({
        where: { id: app.id },
        data: { interviewReminder24hSentAt: new Date() },
      });
      results.reminder24h++;
    } catch (e) {
      results.errors.push(`24h ${app.id}: ${e}`);
    }
  }

  // ---------- 1-hour reminders ----------
  const in1hStart = new Date(now.getTime() + 45 * 60 * 1000);
  const in1hEnd = new Date(now.getTime() + 75 * 60 * 1000);

  const upcoming1h = await db.application.findMany({
    where: {
      interviewDate: { gte: in1hStart, lte: in1hEnd },
      interviewStatus: "SCHEDULED",
      interviewReminder1hSentAt: null,
    },
    include: {
      student: { select: { firstName: true, lastName: true } },
      parent: { select: { name: true, email: true } },
    },
  });

  for (const app of upcoming1h) {
    try {
      await sendInterviewReminder(app, "1 hour");
      await db.application.update({
        where: { id: app.id },
        data: { interviewReminder1hSentAt: new Date() },
      });
      results.reminder1h++;
    } catch (e) {
      results.errors.push(`1h ${app.id}: ${e}`);
    }
  }

  // ---------- Scheduling nudge (3 days after moved to INTERVIEW_SCHEDULED) ----------
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const notYetBooked = await db.application.findMany({
    where: {
      status: "INTERVIEW_SCHEDULED",
      interviewDate: null,
      interviewScheduleNudgeSentAt: null,
      updatedAt: { lte: threeDaysAgo },
    },
    include: {
      student: { select: { firstName: true, lastName: true } },
      parent: { select: { name: true, email: true } },
    },
  });

  for (const app of notYetBooked) {
    try {
      await sendScheduleNudge(app);
      await db.application.update({
        where: { id: app.id },
        data: { interviewScheduleNudgeSentAt: new Date() },
      });
      results.nudge++;
    } catch (e) {
      results.errors.push(`nudge ${app.id}: ${e}`);
    }
  }

  return NextResponse.json(results);
}

type AppWithRelations = {
  id: string;
  referenceNumber: string;
  interviewDate: Date | null;
  interviewZoomJoinUrl: string | null;
  interviewZoomPasscode: string | null;
  student: { firstName: string; lastName: string } | null;
  parent: { name: string; email: string };
};

async function sendInterviewReminder(
  app: AppWithRelations,
  hoursLabel: "24 hours" | "1 hour",
) {
  if (!app.interviewDate) return;
  const studentName = app.student
    ? `${app.student.firstName} ${app.student.lastName}`
    : "the applicant";
  const when = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Los_Angeles",
    timeZoneName: "short",
  }).format(app.interviewDate);

  const zoomBlock = app.interviewZoomJoinUrl
    ? `Join Zoom: ${app.interviewZoomJoinUrl}${app.interviewZoomPasscode ? `\nPasscode: ${app.interviewZoomPasscode}` : ""}`
    : "The Zoom link will be sent by email separately.";

  await sendEmail({
    to: app.parent.email,
    subject: `Reminder: ${studentName}'s interview in ${hoursLabel}`,
    html: wrap(
      `Dear ${app.parent.name},\n\n` +
        `This is a friendly reminder that ${studentName}'s admissions interview is in ${hoursLabel}.\n\n` +
        `When: ${when} (Los Angeles time)\n\n` +
        `${zoomBlock}\n\n` +
        `Reference: ${app.referenceNumber}\n\n` +
        `Looking forward to it,\nThe JETS Admissions Team`,
    ),
  });
}

async function sendScheduleNudge(app: AppWithRelations) {
  const studentName = app.student
    ? `${app.student.firstName} ${app.student.lastName}`
    : "the applicant";
  const host =
    process.env.AUTH_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "https://app.jetscollege.org";

  await sendEmail({
    to: app.parent.email,
    subject: `Friendly nudge: please schedule ${studentName}'s interview`,
    html: wrap(
      `Dear ${app.parent.name},\n\n` +
        `We noticed you haven't picked an interview time yet for ${studentName}. ` +
        `Book a 30-minute slot here whenever works for you:\n\n` +
        `${host}/portal/interview/${app.id}\n\n` +
        `If none of the times work, just reply to this email and we'll coordinate directly.\n\n` +
        `Reference: ${app.referenceNumber}\n\n` +
        `Warm regards,\nThe JETS Admissions Team`,
    ),
  });
}

function wrap(body: string) {
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
