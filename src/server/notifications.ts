import { db } from "@/server/db";
import type { ApplicationStatus, ApplicationType } from "@prisma/client";
import { getStaffEmails } from "@/server/staff-emails";

interface NotificationData {
  studentName: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string | null;
  referenceNumber: string;
  applicationId: string;
  type: ApplicationType;
  schoolName: string;
  appHost: string;
}

type Recipient = "parent" | "office" | "principals" | "office_and_principals";

interface NotificationTemplate {
  recipient: Recipient;
  subject: (d: NotificationData) => string;
  body: (d: NotificationData) => string;
  /** Optional short SMS body. Only sent when recipient === "parent" and the
   *  parent's phone number is on file. SMS is best-effort, never blocking. */
  sms?: (d: NotificationData) => string;
}

const ADMIN_LINK = (d: NotificationData) =>
  `${d.appHost}/admin/applications/${d.applicationId}`;
const PORTAL_LINK = (d: NotificationData) =>
  `${d.appHost}/portal/applications/${d.applicationId}`;

const STATUS_NOTIFICATIONS: Partial<
  Record<ApplicationStatus, NotificationTemplate[]>
> = {
  // 1. Submitted → office + principals (FYI), parent (thank you)
  SUBMITTED: [
    {
      recipient: "parent",
      subject: (d) => `We've received ${d.studentName}'s application`,
      body: (d) =>
        `Dear ${d.parentName},\n\n` +
        `Thank you for submitting ${d.studentName}'s application to ${d.schoolName}. We're excited to review it.\n\n` +
        `What happens next:\n` +
        `  1. Our office will review the application for completeness (1-2 business days).\n` +
        `  2. It then goes to our principals for review.\n` +
        `  3. If the principals move forward, you'll get a link to schedule an interview.\n` +
        `  4. After the interview, we'll let you know the decision.\n\n` +
        `You can check on progress anytime in your parent portal:\n${PORTAL_LINK(d)}\n\n` +
        `Reference: ${d.referenceNumber}\n\n` +
        `Warm regards,\nThe JETS Admissions Team`,
      sms: (d) =>
        `JETS School: We received ${d.studentName}'s application. Track progress at ${d.appHost}/portal — Ref ${d.referenceNumber}`,
    },
    {
      recipient: "office_and_principals",
      subject: (d) => `New application: ${d.studentName}`,
      body: (d) =>
        `A new ${d.type === "REAPPLICATION" ? "reapplication" : "application"} has been submitted.\n\n` +
        `Student: ${d.studentName}\n` +
        `Parent: ${d.parentName} (${d.parentEmail})\n` +
        `Reference: ${d.referenceNumber}\n\n` +
        `Review it here:\n${ADMIN_LINK(d)}`,
    },
  ],

  // 2. Office → Principal Review → principals (action)
  PRINCIPAL_REVIEW: [
    {
      recipient: "principals",
      subject: (d) => `Ready for principal review: ${d.studentName}`,
      body: (d) =>
        `A new application is ready for your review.\n\n` +
        `Student: ${d.studentName}\n` +
        `Reference: ${d.referenceNumber}\n\n` +
        `Review here:\n${ADMIN_LINK(d)}\n\n` +
        `Once you've reviewed, you can click "Schedule Interview" to send the applicant a link to book a time.`,
    },
  ],

  // 3. Interview Scheduled → parent (action: pick a time)
  INTERVIEW_SCHEDULED: [
    {
      recipient: "parent",
      subject: (d) => `Please schedule ${d.studentName}'s interview`,
      body: (d) =>
        `Dear ${d.parentName},\n\n` +
        `We'd like to invite ${d.studentName} for an admissions interview.\n\n` +
        `Please pick a convenient time here:\n${d.appHost}/portal/interview/${d.applicationId}\n\n` +
        `Once you book, you'll receive a confirmation with the Zoom link.\n\n` +
        `Reference: ${d.referenceNumber}\n\n` +
        `Warm regards,\nThe JETS Admissions Team`,
      sms: (d) =>
        `JETS School: ${d.studentName} is invited to interview! Pick a time: ${d.appHost}/portal/interview/${d.applicationId}`,
    },
  ],

  // 4. Accepted → office (action: send acceptance email with forms)
  ACCEPTED: [
    {
      recipient: "office",
      subject: (d) => `Action needed: Send acceptance email to ${d.studentName}`,
      body: (d) =>
        `The principals have accepted ${d.studentName}.\n\n` +
        `Please send the acceptance email to ${d.parentName} (${d.parentEmail}). ` +
        `The email should include the list of enrollment forms they need to complete.\n\n` +
        `Reference: ${d.referenceNumber}\nApplication: ${ADMIN_LINK(d)}`,
    },
  ],

  // 5. Enrollment Documents → parent (action: sign forms)
  DOCUMENTS_PENDING: [
    {
      recipient: "parent",
      subject: (d) => `Enrollment forms ready for ${d.studentName}`,
      body: (d) =>
        `Dear ${d.parentName},\n\n` +
        `Your enrollment forms are ready to review and sign in your parent portal:\n${PORTAL_LINK(d)}\n\n` +
        `Please complete these to finalize ${d.studentName}'s enrollment.\n\n` +
        `Reference: ${d.referenceNumber}\n\n` +
        `Warm regards,\nThe JETS Admissions Team`,
      sms: (d) =>
        `JETS School: Enrollment forms are ready to sign for ${d.studentName}. Open: ${PORTAL_LINK(d)}`,
    },
  ],

  // 6. Enrolled → everyone (FYI)
  ENROLLED: [
    {
      recipient: "parent",
      subject: (d) => `Welcome to ${d.schoolName}! ${d.studentName} is enrolled`,
      body: (d) =>
        `Dear ${d.parentName},\n\n` +
        `${d.studentName} is now officially enrolled at ${d.schoolName}. Welcome!\n\n` +
        `We'll be in touch with orientation and back-to-school information soon.\n\n` +
        `Reference: ${d.referenceNumber}\n\n` +
        `Warm regards,\nThe JETS Admissions Team`,
      sms: (d) =>
        `Welcome to ${d.schoolName}! ${d.studentName} is officially enrolled. Orientation info coming soon.`,
    },
    {
      recipient: "office_and_principals",
      subject: (d) => `Enrolled: ${d.studentName}`,
      body: (d) =>
        `${d.studentName} is now enrolled.\n\nReference: ${d.referenceNumber}\n${ADMIN_LINK(d)}`,
    },
  ],

  // NOTE: REJECTED is deliberately NOT in this table — rejection emails are sent
  // manually by the office, so we don't want an automatic blast.
};

export async function triggerStatusNotifications(
  applicationId: string,
  newStatus: ApplicationStatus,
) {
  const templates = STATUS_NOTIFICATIONS[newStatus];
  if (!templates || templates.length === 0) return;

  const application = await db.application.findUnique({
    where: { id: applicationId },
    include: {
      student: { select: { firstName: true, lastName: true } },
      parent: { select: { name: true, email: true, phone: true } },
    },
  });
  if (!application) return;

  const settings = await db.systemSettings.findFirst();
  const schoolName = settings?.schoolName ?? "JETS School";
  const appHost =
    process.env.AUTH_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "https://app.jetscollege.org";

  const data: NotificationData = {
    studentName: application.student
      ? `${application.student.firstName} ${application.student.lastName}`
      : "the applicant",
    parentName: application.parent.name,
    parentEmail: application.parent.email,
    parentPhone: application.parent.phone,
    referenceNumber: application.referenceNumber,
    applicationId,
    type: application.type,
    schoolName,
    appHost,
  };

  const { sendEmail } = await import("@/server/email");
  const { sendSMS } = await import("@/server/sms");

  for (const template of templates) {
    const recipients = resolveRecipients(template.recipient, data);
    if (recipients.length === 0) continue;

    const subject = template.subject(data);
    const body = template.body(data);
    const html = toHtmlEmail(body);

    for (const to of recipients) {
      await db.notificationLog.create({
        data: {
          templateName: `${newStatus}_${template.recipient}`,
          channel: "EMAIL",
          recipientEmail: to,
          recipientName: to === data.parentEmail ? data.parentName : "Staff",
          subject,
          body,
          status: "QUEUED",
          applicationId,
          metadata: { trigger: newStatus, recipient: template.recipient },
        },
      });

      const result = await sendEmail({ to, subject, html });

      await db.notificationLog.updateMany({
        where: { recipientEmail: to, subject, status: "QUEUED" },
        data: {
          status: result.success ? "SENT" : "FAILED",
          sentAt: result.success ? new Date() : undefined,
          errorMessage: result.success ? undefined : result.error,
        },
      });
    }

    // SMS to parent — only when:
    //   1. The template defines an `sms` body for this status
    //   2. The recipient is the parent (we don't text staff)
    //   3. The parent has a phone number on file
    // Best-effort: failures are logged but never block the email path.
    if (template.sms && template.recipient === "parent" && data.parentPhone) {
      const smsBody = template.sms(data);
      const smsResult = await sendSMS({ to: data.parentPhone, body: smsBody });
      await db.notificationLog
        .create({
          data: {
            templateName: `${newStatus}_${template.recipient}_sms`,
            channel: "SMS",
            recipientEmail: data.parentEmail,
            recipientName: data.parentName,
            subject: subject,
            body: smsBody,
            status: smsResult.success ? "SENT" : "FAILED",
            sentAt: smsResult.success ? new Date() : undefined,
            errorMessage: smsResult.success ? undefined : smsResult.error,
            applicationId,
            metadata: { trigger: newStatus, recipient: template.recipient, channel: "sms" },
          },
        })
        .catch((e) => console.error("[notifications] sms log failed:", e));
    }
  }
}

function resolveRecipients(recipient: Recipient, data: NotificationData): string[] {
  switch (recipient) {
    case "parent":
      return [data.parentEmail];
    case "office":
      return getStaffEmails("office");
    case "principals":
      return getStaffEmails("principals");
    case "office_and_principals":
      return getStaffEmails("office", "principals");
  }
}

function toHtmlEmail(body: string) {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #A30018;">
        <h1 style="color: #A30018; font-size: 24px; margin: 0;">JETS School</h1>
      </div>
      <div style="padding: 30px 0; white-space: pre-wrap; line-height: 1.6; color: #333;">
        ${body.replace(/\n/g, "<br>")}
      </div>
      <div style="border-top: 1px solid #eee; padding: 20px 0; text-align: center; color: #999; font-size: 12px;">
        Jewish Educational Trade School<br>
        16601 Rinaldi Street, Granada Hills, CA 91344<br>
        (818) 831-3000
      </div>
    </div>
  `;
}
