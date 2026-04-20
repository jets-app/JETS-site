import { db } from "@/server/db";
import type { ApplicationStatus } from "@prisma/client";

interface NotificationData {
  studentName: string;
  parentName: string;
  parentEmail: string;
  referenceNumber: string;
  applicationId: string;
  schoolName?: string;
  calendlyUrl?: string;
}

const STATUS_NOTIFICATIONS: Record<
  string,
  {
    subject: string;
    body: (data: NotificationData) => string;
    recipientType: "parent" | "admin";
  }[]
> = {
  SUBMITTED: [
    {
      recipientType: "parent",
      subject: "Application Received — {{schoolName}}",
      body: (d) =>
        `Dear ${d.parentName},\n\nThank you for submitting ${d.studentName}'s application to ${d.schoolName ?? "JETS School"} (Ref: ${d.referenceNumber}).\n\nOur admissions team will review the application and reach out with next steps. You can track the status of the application at any time through your parent portal.\n\nWith warm regards,\nThe Admissions Office`,
    },
    {
      recipientType: "admin",
      subject: "New Application Submitted: {{studentName}}",
      body: (d) =>
        `A new application has been submitted.\n\nStudent: ${d.studentName}\nParent: ${d.parentName} (${d.parentEmail})\nRef: ${d.referenceNumber}\n\nReview it in the admin dashboard.`,
    },
  ],
  OFFICE_REVIEW: [
    {
      recipientType: "parent",
      subject: "Application Under Review — {{schoolName}}",
      body: (d) =>
        `Dear ${d.parentName},\n\n${d.studentName}'s application (Ref: ${d.referenceNumber}) is now being reviewed by our admissions office.\n\nWe will be in touch shortly with any questions or updates.\n\nWith warm regards,\nThe Admissions Office`,
    },
  ],
  PRINCIPAL_REVIEW: [],
  INTERVIEW_SCHEDULED: [
    {
      recipientType: "parent",
      subject: "Interview Invitation — {{schoolName}}",
      body: (d) =>
        `Dear ${d.parentName},\n\nWe are pleased to invite ${d.studentName} for an admissions interview at ${d.schoolName ?? "JETS School"}.\n\nPlease schedule a convenient time using the link below:\n${d.calendlyUrl ?? "https://calendly.com/jets-admissions"}\n\nApplication Ref: ${d.referenceNumber}\n\nWe look forward to meeting ${d.studentName}.\n\nWith warm regards,\nThe Admissions Office`,
    },
  ],
  INTERVIEW_COMPLETED: [],
  ACCEPTED: [
    {
      recipientType: "parent",
      subject: "Congratulations — {{studentName}} Has Been Accepted!",
      body: (d) =>
        `Dear ${d.parentName},\n\nWe are delighted to inform you that ${d.studentName} has been accepted to ${d.schoolName ?? "JETS School"} for the upcoming academic year!\n\nNext steps:\n1. Log in to your parent portal\n2. Review and sign enrollment documents\n3. Complete tuition arrangements\n\nApplication Ref: ${d.referenceNumber}\n\nWe look forward to welcoming ${d.studentName} to our community.\n\nWith warm regards,\nThe Admissions Office`,
    },
  ],
  DOCUMENTS_PENDING: [
    {
      recipientType: "parent",
      subject: "Enrollment Documents Ready for Signing",
      body: (d) =>
        `Dear ${d.parentName},\n\nEnrollment documents for ${d.studentName} are now available in your parent portal. Please review and sign them at your earliest convenience.\n\nApplication Ref: ${d.referenceNumber}\n\nWith warm regards,\nThe Admissions Office`,
    },
  ],
  ENROLLED: [
    {
      recipientType: "parent",
      subject: "Welcome to {{schoolName}} — {{studentName}} is Enrolled!",
      body: (d) =>
        `Dear ${d.parentName},\n\nAll enrollment requirements have been completed. ${d.studentName} is now officially enrolled at ${d.schoolName ?? "JETS School"}!\n\nWe will send further information about orientation and the upcoming semester in the weeks ahead.\n\nApplication Ref: ${d.referenceNumber}\n\nWith warm regards,\nThe Admissions Office`,
    },
  ],
  REJECTED: [
    {
      recipientType: "parent",
      subject: "Application Update — {{schoolName}}",
      body: (d) =>
        `Dear ${d.parentName},\n\nAfter careful consideration, we regret to inform you that we are unable to offer ${d.studentName} a place at ${d.schoolName ?? "JETS School"} at this time.\n\nWe wish ${d.studentName} every success in the future.\n\nApplication Ref: ${d.referenceNumber}\n\nWith warm regards,\nThe Admissions Office`,
    },
  ],
  WAITLISTED: [
    {
      recipientType: "parent",
      subject: "Application Waitlisted — {{schoolName}}",
      body: (d) =>
        `Dear ${d.parentName},\n\n${d.studentName}'s application (Ref: ${d.referenceNumber}) has been placed on our waitlist. We will notify you if a spot becomes available.\n\nWith warm regards,\nThe Admissions Office`,
    },
  ],
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
  const calendlyUrl = settings?.calendlyUrl ?? undefined;

  const data: NotificationData = {
    studentName: application.student
      ? `${application.student.firstName} ${application.student.lastName}`
      : "the applicant",
    parentName: application.parent.name,
    parentEmail: application.parent.email,
    referenceNumber: application.referenceNumber,
    applicationId,
    schoolName,
    calendlyUrl,
  };

  for (const template of templates) {
    const subject = template.subject
      .replace("{{schoolName}}", schoolName)
      .replace("{{studentName}}", data.studentName);
    const body = template.body(data);

    let recipientEmail = data.parentEmail;
    let recipientName = data.parentName;

    if (template.recipientType === "admin") {
      recipientEmail = settings?.schoolEmail ?? "admin@jetsschool.org";
      recipientName = "Admin";
    }

    await db.notificationLog.create({
      data: {
        templateName: `${newStatus}_${template.recipientType}`,
        channel: "EMAIL",
        recipientEmail,
        recipientName,
        subject,
        body,
        status: "QUEUED",
        applicationId,
        metadata: { trigger: newStatus, recipientType: template.recipientType },
      },
    });

    await sendNotificationEmail(recipientEmail, subject, body);
  }
}

async function sendNotificationEmail(to: string, subject: string, body: string) {
  const { sendEmail } = await import("@/server/email");

  const htmlBody = `
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

  const result = await sendEmail({ to, subject, html: htmlBody });

  await db.notificationLog.updateMany({
    where: {
      recipientEmail: to,
      subject,
      status: "QUEUED",
    },
    data: {
      status: result.success ? "SENT" : "FAILED",
      sentAt: result.success ? new Date() : undefined,
      errorMessage: result.success ? undefined : result.error,
    },
  });
}
