"use server";

import { db } from "@/server/db";
import { auth } from "@/server/auth";
import { revalidatePath } from "next/cache";
import type {
  DocumentTemplateType,
  DocumentStatus,
  DocumentRecipientType,
} from "@prisma/client";
import { isStaff } from "@/lib/roles";
import { sanitizeTemplateHtml } from "@/lib/sanitize-html";

// ---------- Helpers ----------

// Allows any staff role (admin/principal/secretary/reviewer). Kept the name
// historically — the function predates the SECRETARY role.
async function requireAdmin() {
  const session = await auth();
  if (!session?.user || !isStaff(session.user.role)) {
    throw new Error("Unauthorized: Staff access required");
  }
  return session.user;
}

// ---------- Document Templates ----------

export async function getDocumentTemplates() {
  await requireAdmin();

  return db.documentTemplate.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { documents: true },
      },
    },
  });
}

export async function getDocumentTemplate(id: string) {
  await requireAdmin();

  const template = await db.documentTemplate.findUnique({
    where: { id },
  });

  if (!template) {
    throw new Error("Template not found");
  }

  return template;
}

export async function createDocumentTemplate(data: {
  name: string;
  type: DocumentTemplateType;
  htmlContent: string;
  fields?: Record<string, unknown>[];
}) {
  await requireAdmin();

  const template = await db.documentTemplate.create({
    data: {
      name: data.name,
      type: data.type,
      htmlContent: sanitizeTemplateHtml(data.htmlContent),
      content: JSON.parse(JSON.stringify({ fields: data.fields ?? [] })),
    },
  });

  revalidatePath("/admin/documents");
  return template;
}

export async function updateDocumentTemplate(
  id: string,
  data: {
    name?: string;
    type?: DocumentTemplateType;
    htmlContent?: string;
    fields?: Record<string, unknown>[];
    isActive?: boolean;
  }
) {
  await requireAdmin();

  const existing = await db.documentTemplate.findUnique({ where: { id } });
  if (!existing) {
    throw new Error("Template not found");
  }

  const template = await db.documentTemplate.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.type !== undefined && { type: data.type }),
      ...(data.htmlContent !== undefined && { htmlContent: sanitizeTemplateHtml(data.htmlContent) }),
      ...(data.fields !== undefined && { content: JSON.parse(JSON.stringify({ fields: data.fields })) }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
      version: { increment: 1 },
    },
  });

  revalidatePath("/admin/documents");
  revalidatePath(`/admin/documents/templates/${id}`);
  return template;
}

// ---------- Send Documents ----------

export async function sendDocumentToRecipient(
  applicationId: string,
  templateId: string,
  recipientType: DocumentRecipientType,
  customizations?: { tuitionAmount?: number; scholarshipAmount?: number }
) {
  await requireAdmin();

  const application = await db.application.findUnique({
    where: { id: applicationId },
    include: {
      student: true,
      parent: { select: { name: true, email: true } },
    },
  });

  if (!application) {
    throw new Error("Application not found");
  }

  const template = await db.documentTemplate.findUnique({
    where: { id: templateId },
  });

  if (!template) {
    throw new Error("Template not found");
  }

  const studentName = application.student
    ? `${application.student.firstName} ${application.student.lastName}`
    : "Student";

  // Customize HTML content with application data. The replaced values come
  // from user-controlled fields (parent name, student name) so we re-run the
  // sanitizer after substitution to strip anything injected via, say, a
  // registration name like "<script>...".
  let customizedHtml = template.htmlContent ?? "";
  customizedHtml = customizedHtml
    .replace(/\{\{studentName\}\}/g, studentName)
    .replace(/\{\{parentName\}\}/g, application.parent.name)
    .replace(
      /\{\{dateOfBirth\}\}/g,
      application.student?.dateOfBirth
        ? new Date(application.student.dateOfBirth).toLocaleDateString()
        : ""
    )
    .replace(/\{\{academicYear\}\}/g, application.academicYear)
    .replace(/\{\{date\}\}/g, new Date().toLocaleDateString())
    .replace(
      /\{\{tuitionAmount\}\}/g,
      customizations?.tuitionAmount
        ? `$${(customizations.tuitionAmount / 100).toLocaleString()}`
        : "TBD"
    )
    .replace(
      /\{\{scholarshipAmount\}\}/g,
      customizations?.scholarshipAmount
        ? `$${(customizations.scholarshipAmount / 100).toLocaleString()}`
        : "TBD"
    );
  customizedHtml = sanitizeTemplateHtml(customizedHtml);

  const recipientLabel =
    recipientType === "PARENT" ? "Parent" : "Student";

  // Set expiry to 30 days from now
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  const document = await db.document.create({
    data: {
      applicationId,
      templateId,
      title: `${template.name} - ${recipientLabel}`,
      status: "SENT",
      recipientType,
      content: template.content as object,
      customizedHtml,
      sentAt: new Date(),
      expiresAt,
    },
  });

  // Send signing link via email
  const { sendEmail } = await import("@/server/email");
  const appUrl = process.env.AUTH_URL || "https://jets-crm.vercel.app";
  const signingLink = `${appUrl}/d/${document.token}`;
  const docTitle = document.title;

  {
    const recipientEmail = recipientType === "STUDENT" && application.student?.email
      ? application.student.email
      : application.parent.email;
    const recipientName = recipientType === "STUDENT" && application.student
      ? `${application.student.firstName} ${application.student.lastName}`
      : application.parent.name;

    // Email is best-effort — Resend without a verified domain rejects mail to
    // anyone other than the account owner, and we don't want that to crash
    // document creation. Doc + signing link still get created in the DB.
    sendEmail({
      to: recipientEmail,
      subject: `Document for Signing: ${docTitle} — JETS School`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #A30018;">
            <h1 style="color: #A30018; font-size: 24px; margin: 0;">JETS School</h1>
          </div>
          <div style="padding: 30px 0; line-height: 1.6; color: #333;">
            <p>Dear ${recipientName},</p>
            <p>A document requires your signature: <strong>${docTitle}</strong></p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${signingLink}" style="background: #A30018; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
                Review &amp; Sign Document
              </a>
            </p>
            <p style="color: #666; font-size: 14px;">This link expires on ${expiresAt.toLocaleDateString()}. If you have questions, contact the JETS admissions office at (818) 831-3000.</p>
          </div>
          <div style="border-top: 1px solid #eee; padding: 20px 0; text-align: center; color: #999; font-size: 12px;">
            Jewish Educational Trade School<br>16601 Rinaldi Street, Granada Hills, CA 91344
          </div>
        </div>
      `,
    }).catch((e) => console.error("[sendDocument] email failed:", e));
  }

  revalidatePath(`/admin/applications/${applicationId}`);
  return document;
}

export async function sendEnrollmentPackage(applicationId: string) {
  await requireAdmin();

  const application = await db.application.findUnique({
    where: { id: applicationId },
    include: { student: true, documents: true },
  });

  if (!application) {
    throw new Error("Application not found");
  }

  if (
    application.status !== "ACCEPTED" &&
    application.status !== "DOCUMENTS_PENDING" &&
    application.status !== "ENROLLED"
  ) {
    throw new Error(
      "Application must be at least at ACCEPTED status to send enrollment documents"
    );
  }

  // Find the required templates
  const templates = await db.documentTemplate.findMany({
    where: {
      isActive: true,
      type: {
        in: [
          "MEDICAL_FORM",
          "STUDENT_HANDBOOK",
          "TUITION_CONTRACT",
          "ENROLLMENT_AGREEMENT",
        ],
      },
    },
  });

  const templateByType = new Map(templates.map((t) => [t.type, t]));

  const missingTypes: string[] = [];
  for (const type of [
    "MEDICAL_FORM",
    "STUDENT_HANDBOOK",
    "TUITION_CONTRACT",
    "ENROLLMENT_AGREEMENT",
  ]) {
    if (!templateByType.has(type as DocumentTemplateType)) {
      missingTypes.push(type);
    }
  }

  if (missingTypes.length > 0) {
    throw new Error(
      `Missing active templates for: ${missingTypes.join(", ")}. Please create them in Document Templates first.`
    );
  }

  const documentsToCreate: Array<{
    templateId: string;
    recipientType: DocumentRecipientType;
  }> = [
    {
      templateId: templateByType.get("MEDICAL_FORM")!.id,
      recipientType: "PARENT",
    },
    {
      templateId: templateByType.get("STUDENT_HANDBOOK")!.id,
      recipientType: "PARENT",
    },
    {
      templateId: templateByType.get("STUDENT_HANDBOOK")!.id,
      recipientType: "STUDENT",
    },
    {
      templateId: templateByType.get("TUITION_CONTRACT")!.id,
      recipientType: "PARENT",
    },
    {
      templateId: templateByType.get("ENROLLMENT_AGREEMENT")!.id,
      recipientType: "PARENT",
    },
  ];

  const createdDocuments = [];

  for (const doc of documentsToCreate) {
    const created = await sendDocumentToRecipient(
      applicationId,
      doc.templateId,
      doc.recipientType
    );
    createdDocuments.push(created);
  }

  // Update application status to DOCUMENTS_PENDING
  if (application.status === "ACCEPTED") {
    await db.application.update({
      where: { id: applicationId },
      data: { status: "DOCUMENTS_PENDING" },
    });

    await db.applicationNote.create({
      data: {
        applicationId,
        authorId: (await requireAdmin()).id!,
        content:
          "Status changed from ACCEPTED to DOCUMENTS_PENDING. Enrollment document package sent.",
        isInternal: true,
      },
    });
  }

  revalidatePath(`/admin/applications/${applicationId}`);
  return { success: true, documentCount: createdDocuments.length };
}

// ---------- Send Scholarship Documents ----------

export async function sendScholarshipDocuments(
  applicationId: string,
  scholarshipAmount: number
) {
  await requireAdmin();

  const application = await db.application.findUnique({
    where: { id: applicationId },
  });

  if (!application) {
    throw new Error("Application not found");
  }

  const templates = await db.documentTemplate.findMany({
    where: {
      isActive: true,
      type: {
        in: ["TUITION_CONTRACT", "SCHOLARSHIP_CONTRACT"],
      },
    },
  });

  const templateByType = new Map(templates.map((t) => [t.type, t]));

  const tuitionTemplate = templateByType.get("TUITION_CONTRACT");
  const scholarshipTemplate = templateByType.get("SCHOLARSHIP_CONTRACT");

  if (!tuitionTemplate || !scholarshipTemplate) {
    throw new Error(
      "Missing active Tuition Contract or Scholarship Contract template"
    );
  }

  // Void existing tuition contract if one was sent
  const existingTuition = await db.document.findFirst({
    where: {
      applicationId,
      templateId: tuitionTemplate.id,
      status: { in: ["SENT", "VIEWED", "DRAFT"] },
    },
  });

  if (existingTuition) {
    await db.document.update({
      where: { id: existingTuition.id },
      data: { status: "VOIDED" },
    });
  }

  // Send updated tuition contract to parent
  await sendDocumentToRecipient(
    applicationId,
    tuitionTemplate.id,
    "PARENT",
    { scholarshipAmount }
  );

  // Send scholarship contract to student
  await sendDocumentToRecipient(
    applicationId,
    scholarshipTemplate.id,
    "STUDENT",
    { scholarshipAmount }
  );

  revalidatePath(`/admin/applications/${applicationId}`);
  return { success: true };
}

// ---------- Query Documents ----------

export async function getDocumentsForApplication(applicationId: string) {
  await requireAdmin();

  return db.document.findMany({
    where: { applicationId },
    include: {
      template: {
        select: { name: true, type: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

// ---------- Public Document Access (No Auth) ----------

export async function getDocumentByToken(token: string) {
  const document = await db.document.findUnique({
    where: { token },
    include: {
      application: {
        include: {
          student: {
            select: { firstName: true, lastName: true, dateOfBirth: true },
          },
          parent: {
            select: { name: true, email: true },
          },
        },
      },
      template: {
        select: { name: true, type: true },
      },
    },
  });

  if (!document) {
    return { error: "not_found" as const };
  }

  if (document.status === "COMPLETED") {
    return { error: "already_signed" as const };
  }

  if (document.status === "VOIDED") {
    return { error: "voided" as const };
  }

  if (document.expiresAt && new Date() > document.expiresAt) {
    await db.document.update({
      where: { id: document.id },
      data: { status: "EXPIRED" },
    });
    return { error: "expired" as const };
  }

  // Mark as viewed on first access
  if (document.status === "SENT" && !document.viewedAt) {
    await db.document.update({
      where: { id: document.id },
      data: {
        status: "VIEWED",
        viewedAt: new Date(),
      },
    });
  }

  const studentName = document.application.student
    ? `${document.application.student.firstName} ${document.application.student.lastName}`
    : "Student";

  return {
    success: true,
    data: {
      id: document.id,
      token: document.token,
      title: document.title,
      recipientType: document.recipientType,
      customizedHtml: document.customizedHtml,
      content: document.content as { fields?: Record<string, unknown>[] },
      studentName,
      parentName: document.application.parent.name,
      studentDob: document.application.student?.dateOfBirth ?? null,
      templateType: document.template?.type ?? null,
    },
  };
}

// ---------- Submit Signed Document ----------

export async function submitSignedDocument(
  token: string,
  signatureDataUrl: string,
  signerName: string,
  fieldValues?: Record<string, string>
) {
  const { rateLimitPublicToken } = await import("@/server/security/rate-limit");
  const rl = await rateLimitPublicToken();
  if (!rl.ok) {
    return { error: "Too many requests from this network. Please wait a moment and try again." };
  }

  const document = await db.document.findUnique({
    where: { token },
  });

  if (!document) {
    return { error: "Document not found" };
  }

  if (document.status === "COMPLETED") {
    return { error: "This document has already been signed" };
  }

  if (document.status === "VOIDED") {
    return { error: "This document has been voided" };
  }

  if (document.expiresAt && new Date() > document.expiresAt) {
    return { error: "This document has expired" };
  }

  if (!signerName.trim()) {
    return { error: "Signer name is required" };
  }

  if (!signatureDataUrl.trim()) {
    return { error: "Signature is required" };
  }

  // Store the field values in the content JSON
  const existingContent = (document.content as Record<string, unknown>) ?? {};
  const updatedContent = {
    ...existingContent,
    fieldValues: fieldValues ?? {},
    signedAt: new Date().toISOString(),
  };

  await db.document.update({
    where: { id: document.id },
    data: {
      status: "COMPLETED",
      signatureUrl: signatureDataUrl,
      signerName: signerName.trim(),
      signedAt: new Date(),
      content: updatedContent,
    },
  });

  // Check if all documents for this application are signed
  await checkAllDocumentsSigned(document.applicationId);

  return { success: true };
}

// ---------- Void Document ----------

export async function voidDocument(documentId: string) {
  await requireAdmin();

  const document = await db.document.findUnique({
    where: { id: documentId },
  });

  if (!document) {
    throw new Error("Document not found");
  }

  if (document.status === "COMPLETED") {
    throw new Error("Cannot void a completed document");
  }

  await db.document.update({
    where: { id: documentId },
    data: { status: "VOIDED" },
  });

  revalidatePath(`/admin/applications/${document.applicationId}`);
  return { success: true };
}

// ---------- Resend Document ----------

export async function resendDocument(documentId: string) {
  await requireAdmin();

  const document = await db.document.findUnique({
    where: { id: documentId },
  });

  if (!document) {
    throw new Error("Document not found");
  }

  if (document.status === "COMPLETED") {
    throw new Error("Cannot resend a completed document");
  }

  // Reset expiry to 30 days from now
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  await db.document.update({
    where: { id: documentId },
    data: {
      status: "SENT",
      sentAt: new Date(),
      viewedAt: null,
      expiresAt,
    },
  });

  // TODO: Resend email to recipient
  // Link: ${process.env.NEXT_PUBLIC_APP_URL}/d/${document.token}

  revalidatePath(`/admin/applications/${document.applicationId}`);
  return { success: true };
}

// ---------- Check All Documents Signed ----------

export async function checkAllDocumentsSigned(applicationId: string) {
  const documents = await db.document.findMany({
    where: {
      applicationId,
      status: { not: "VOIDED" },
    },
  });

  if (documents.length === 0) return false;

  const allSigned = documents.every((doc) => doc.status === "COMPLETED");

  if (allSigned) {
    const application = await db.application.findUnique({
      where: { id: applicationId },
      select: { status: true },
    });

    if (
      application?.status === "DOCUMENTS_PENDING" ||
      application?.status === "ACCEPTED"
    ) {
      await db.application.update({
        where: { id: applicationId },
        data: { status: "ENROLLED" },
      });

      // Add a system note — use the first admin user as the author
      const adminUser = await db.user.findFirst({
        where: { role: "ADMIN" },
        select: { id: true },
      });

      if (adminUser) {
        await db.applicationNote.create({
          data: {
            applicationId,
            authorId: adminUser.id,
            content:
              "Status changed from DOCUMENTS_PENDING to ENROLLED. All enrollment documents have been signed. (Auto-updated)",
            isInternal: true,
          },
        });
      }
    }
  }

  return allSigned;
}

// ---------- Document Stats ----------

export async function getDocumentStats() {
  await requireAdmin();

  const counts = await db.document.groupBy({
    by: ["status"],
    _count: { status: true },
  });

  const statusMap: Record<string, number> = {};
  let total = 0;
  for (const item of counts) {
    statusMap[item.status] = item._count.status;
    total += item._count.status;
  }

  return { statusMap, total };
}

// ---------- Seed Default Templates ----------

/**
 * Seeds JETS-specific document templates. Upserts by (name, type) so re-running
 * picks up content updates from this file. Set force=true to overwrite even
 * when an admin has hand-edited the template (use sparingly).
 */
export async function seedDefaultTemplates(opts?: { force?: boolean }) {
  await requireAdmin();
  const force = opts?.force ?? false;

  const defaultTemplates: Array<{
    name: string;
    type: DocumentTemplateType;
    htmlContent: string;
    content: { fields: Array<{ name: string; label: string; type: string; required: boolean }> };
  }> = [
    {
      name: "Medical Treatment Form",
      type: "MEDICAL_FORM",
      content: {
        fields: [
          { name: "allergies", label: "Known allergies (food, medication, environmental, etc.)", type: "textarea", required: true },
          { name: "conditions", label: "Existing health conditions (asthma, diabetes, epilepsy, anxiety, etc.)", type: "textarea", required: true },
          { name: "medications", label: "Current medications, dosage, and reason prescribed", type: "textarea", required: false },
          { name: "physicianName", label: "Family doctor / pediatrician name", type: "text", required: true },
          { name: "physicianPhone", label: "Family doctor phone", type: "tel", required: true },
          { name: "insuranceProvider", label: "Primary insurance provider", type: "text", required: true },
          { name: "insurancePolicyNumber", label: "Policy number", type: "text", required: true },
          { name: "insuranceGroupNumber", label: "Group number (if applicable)", type: "text", required: false },
          { name: "subscriberName", label: "Subscriber / policy-holder name", type: "text", required: true },
          { name: "emergencyContactName", label: "Local emergency contact (not living with you)", type: "text", required: true },
          { name: "emergencyContactRelation", label: "Relationship to student", type: "text", required: true },
          { name: "emergencyContactPhone", label: "Emergency contact phone", type: "tel", required: true },
          { name: "counselingConsent", label: "I authorize JETS counselors, parents, and staff to share information about my counseling for the purpose of supporting the student's wellbeing.", type: "checkbox", required: true },
        ],
      },
      htmlContent: `<div style="font-family: Georgia, serif; max-width: 720px; margin: 0 auto; color: #1a1a1a;">
  <h2 style="text-align: center; color: #7a0012; border-bottom: 2px solid #7a0012; padding-bottom: 12px;">JETS School &mdash; Medical Treatment Form</h2>
  <p style="color: #555; text-align: center; margin-bottom: 24px;">Academic Year {{academicYear}}</p>

  <h3 style="color: #7a0012; margin-top: 24px;">Student</h3>
  <p><strong>Name:</strong> {{studentName}} &nbsp;&middot;&nbsp; <strong>Date of Birth:</strong> {{dateOfBirth}}</p>

  <h3 style="color: #7a0012; margin-top: 24px;">Medical history</h3>
  <p>Please complete the fields below with allergies, current health conditions, and any medications. Accurate information protects your son in an emergency.</p>

  <h3 style="color: #7a0012; margin-top: 24px;">Family doctor</h3>
  <p>Provide your family doctor / pediatrician's name and phone in the fields below so JETS staff can coordinate with them when needed.</p>

  <h3 style="color: #7a0012; margin-top: 24px;">Insurance</h3>
  <p>Please provide primary insurance details in the fields below. JETS does not collect Social Security numbers; your insurance card information is sufficient for billing.</p>

  <h3 style="color: #7a0012; margin-top: 24px;">Local emergency contact</h3>
  <p>Provide one local relative or family friend (not living with the student) who can be reached if neither parent is available.</p>

  <h3 style="color: #7a0012; margin-top: 24px;">Authorization for emergency medical treatment</h3>
  <p>I, {{parentName}}, parent/guardian of {{studentName}}, authorize JETS School and its staff to seek emergency medical, surgical, or psychological care for my child <strong>when I cannot be reached in time</strong> and the care provider deems treatment immediately necessary. JETS will make every reasonable effort to contact me first. I will be notified of any treatment as soon as possible afterward.</p>
  <p>I authorize my insurance benefits to be paid directly to the care provider and understand I am financially responsible for any balance not covered by insurance. I authorize JETS or my insurance company to release any information required to process claims.</p>

  <h3 style="color: #7a0012; margin-top: 24px;">Counseling information sharing</h3>
  <p>To allow JETS counselors, parents, and relevant staff to coordinate care when appropriate, please check the consent box below. This applies only to counseling notes shared between JETS staff, your child's counselor, and you as the parent/guardian.</p>

  <p style="margin-top: 32px; color: #555; font-size: 0.85em;">Date: {{date}} &nbsp;&middot;&nbsp; JETS School &middot; 16601 Rinaldi St., Granada Hills, CA 91344 &middot; (818) 831-3000</p>
</div>`,
    },
    {
      name: "Student Handbook Acknowledgment",
      type: "STUDENT_HANDBOOK",
      content: {
        fields: [],
      },
      htmlContent: `<div style="font-family: Georgia, serif; max-width: 700px; margin: 0 auto;">
  <h2 style="text-align: center; color: #7a0012; border-bottom: 2px solid #7a0012; padding-bottom: 12px;">JETS School &mdash; Student Handbook Acknowledgment</h2>
  <p style="color: #555; text-align: center; margin-bottom: 24px;">Academic Year {{academicYear}}</p>

  <p><strong>Student Name:</strong> {{studentName}}</p>

  <h3 style="color: #7a0012; margin-top: 24px;">General Code of Conduct</h3>
  <ul>
    <li>Students are expected to conduct themselves with respect, integrity, and responsibility at all times.</li>
    <li>All students must adhere to the school dress code as outlined in the full handbook.</li>
    <li>The use of mobile phones and personal electronic devices is prohibited during school hours unless authorized by a teacher.</li>
    <li>Students must attend all scheduled classes, davening, and school events.</li>
  </ul>

  <h3 style="color: #7a0012; margin-top: 24px;">Academic Standards</h3>
  <ul>
    <li>Homework and assignments must be completed and submitted on time.</li>
    <li>Academic dishonesty, including cheating and plagiarism, will result in disciplinary action.</li>
    <li>Students who are struggling are encouraged to seek help from teachers or tutors.</li>
  </ul>

  <h3 style="color: #7a0012; margin-top: 24px;">Behavioral Expectations</h3>
  <ul>
    <li>Bullying, harassment, and discrimination of any kind are strictly prohibited.</li>
    <li>Students must treat all faculty, staff, and fellow students with dignity.</li>
    <li>Possession of alcohol, drugs, tobacco, or weapons on school premises is prohibited and grounds for immediate expulsion.</li>
  </ul>

  <h3 style="color: #7a0012; margin-top: 24px;">Attendance Policy</h3>
  <ul>
    <li>Students must maintain a minimum 90% attendance rate.</li>
    <li>All absences must be reported by a parent/guardian before 9:00 AM.</li>
    <li>Excessive unexcused absences may result in academic consequences.</li>
  </ul>

  <h3 style="color: #7a0012; margin-top: 24px;">Acknowledgment</h3>
  <p>By signing below, I acknowledge that I have read, understand, and agree to abide by all rules and policies set forth in the JETS School Student Handbook. I understand that violations may result in disciplinary action, up to and including suspension or expulsion.</p>

  <p style="margin-top: 24px; color: #555; font-size: 0.9em;">Date: {{date}}</p>
</div>`,
    },
    {
      name: "Tuition Contract",
      type: "TUITION_CONTRACT",
      content: {
        fields: [
          { name: "paymentPlan", label: "Payment plan: Annual (full), Semi-Annual (2x), Quarterly (4x), or Monthly (10x)", type: "select", required: true },
          { name: "billingAddress", label: "Billing address (street, city, state, zip)", type: "text", required: true },
          { name: "agreeToTerms", label: "I have read, reviewed, and understand the entire tuition contract and agree to all provisions.", type: "checkbox", required: true },
        ],
      },
      htmlContent: `<div style="font-family: Georgia, serif; max-width: 720px; margin: 0 auto; color: #1a1a1a;">
  <h2 style="text-align: center; color: #7a0012; border-bottom: 2px solid #7a0012; padding-bottom: 12px;">JETS School &mdash; Tuition Contract</h2>
  <p style="color: #555; text-align: center; margin-bottom: 24px;">Academic Year {{academicYear}}</p>

  <div style="background: #fef7f7; border-left: 4px solid #A30018; padding: 10px 14px; margin-bottom: 20px; font-size: 0.9em;">
    <strong>Note:</strong> This contract is a working draft pending final attorney review. Once approved by counsel the bracketed flags will be removed.
  </div>

  <p><strong>Student:</strong> {{studentName}} &nbsp;&middot;&nbsp; <strong>Parent / Guardian:</strong> {{parentName}}</p>

  <h3 style="color: #7a0012; margin-top: 24px;">Tuition for {{academicYear}}</h3>
  <p><strong>Total tuition:</strong> {{tuitionAmount}}</p>
  <p>If a scholarship or Pay-It-Forward award has been granted, the amount above is the net balance after that award.</p>

  <h3 style="color: #7a0012; margin-top: 24px;">Payment</h3>
  <ul>
    <li>Tuition may be paid in full at enrollment, or split across an approved plan: Annual, Semi-Annual (2 payments), Quarterly (4 payments), or Monthly (10 payments &mdash; first due at enrollment, the remaining nine due on the 1st of the month from September through May).</li>
    <li>A <strong>$50 late fee</strong> applies to payments more than 10 days past due. Three late payments may result in suspension or termination of enrollment.</li>
    <li>Returned checks or failed electronic payments incur a <strong>$35 fee</strong>.</li>
    <li>JETS uses Stripe for credit and debit card payments; <strong>card details are entered through our secure payment portal</strong> and are not collected on this contract.</li>
  </ul>

  <h3 style="color: #7a0012; margin-top: 24px;">Parent responsibilities</h3>
  <ol>
    <li>Review the Student Handbook with your son and abide by its guidelines.</li>
    <li>Arrange housing for your son when school is not in session, and notify JETS of those arrangements at least 10 days in advance. If you do not, JETS may help locate an alternative; in that case the family is responsible for a minimum of $100 per day of additional accommodation costs.</li>
    <li>Ensure your son arrives with everything needed to live away from home (bedding, clothing per the handbook, etc.).</li>
    <li>Provide weekly spending money (minimum $25). JETS recommends giving spending money to the office for safekeeping; JETS is not responsible for funds not held by the office.</li>
    <li>Provide proof of medical insurance prior to your son's arrival and report any coverage changes during the year.</li>
  </ol>

  <h3 style="color: #7a0012; margin-top: 24px;">Withdrawal &amp; refunds</h3>
  <ul>
    <li>Application processing and enrollment fees are non-refundable.</li>
    <li>Withdrawal requires <strong>30 days written notice</strong> to the administration. Payments are due for the month of notice plus two additional installments.</li>
    <li>If a student is withdrawn after April 1, all remaining tuition payments for the balance of the school year are due.</li>
  </ul>

  <h3 style="color: #7a0012; margin-top: 24px;">Hold harmless</h3>
  <p>I/we, the parent(s) or legal guardian(s), authorize my son's participation in JETS programs and activities, including school-related field trips. I/we assume the ordinary risks incidental to those activities and release JETS, its directors, employees, and agents from claims arising from those ordinary risks.</p>
  <p>I/we authorize JETS staff to (a) seek emergency medical care when I cannot be reached in time, (b) administer reasonable discipline consistent with the Student Handbook, and (c) supervise field-trip and activity participation. I/we understand JETS is not a legal guardian for matters outside these specific authorities.</p>
  <p>I/we understand this agreement may be terminated and my son dismissed for repeated failure to comply with the Student Handbook or the terms of this contract.</p>

  <h3 style="color: #7a0012; margin-top: 24px;">Binding arbitration (Bais Din)</h3>
  <p>Any dispute arising out of or related to this agreement &mdash; including claims of negligence or malpractice &mdash; will be decided exclusively by binding arbitration before a Bais Din applying Jewish law. This serves as binding arbitration under California law; a court of competent jurisdiction may enter judgment on any award.</p>
  <p>By signing, the parties give up the right to a court trial, jury trial, and the right to appeal an arbitration award. Each party has the right to consult independent counsel before signing.</p>

  <h3 style="color: #7a0012; margin-top: 24px;">Acknowledgment</h3>
  <p>By signing below, I/we confirm that I/we have read this entire contract, including the binding arbitration clause, and agree to be bound by all of its provisions.</p>

  <p style="margin-top: 32px; color: #555; font-size: 0.85em;">Date: {{date}} &nbsp;&middot;&nbsp; JETS School &middot; 16601 Rinaldi St., Granada Hills, CA 91344</p>
</div>`,
    },
    {
      name: "Enrollment Agreement",
      type: "ENROLLMENT_AGREEMENT",
      content: {
        fields: [
          { name: "programYear", label: "Program Year", type: "text", required: false },
        ],
      },
      htmlContent: `<div style="font-family: Georgia, serif; max-width: 700px; margin: 0 auto;">
  <h2 style="text-align: center; color: #7a0012; border-bottom: 2px solid #7a0012; padding-bottom: 12px;">JETS School &mdash; Enrollment Agreement</h2>
  <p style="color: #555; text-align: center; margin-bottom: 24px;">Academic Year {{academicYear}}</p>

  <p><strong>Student Name:</strong> {{studentName}}</p>
  <p><strong>Parent/Guardian:</strong> {{parentName}}</p>

  <h3 style="color: #7a0012; margin-top: 24px;">Enrollment Commitment</h3>
  <p>This agreement confirms the enrollment of the above-named student at JETS School for the {{academicYear}} academic year. By signing this agreement, the parent/guardian and the school enter into a mutual commitment.</p>

  <h3 style="color: #7a0012; margin-top: 24px;">School Responsibilities</h3>
  <ul>
    <li>Provide a comprehensive Torah and general studies education.</li>
    <li>Maintain a safe and nurturing environment conducive to learning.</li>
    <li>Communicate regularly with parents regarding student progress.</li>
    <li>Provide access to the full trade and vocational program.</li>
  </ul>

  <h3 style="color: #7a0012; margin-top: 24px;">Parent/Guardian Responsibilities</h3>
  <ul>
    <li>Ensure the student attends school regularly and on time.</li>
    <li>Support the school's educational mission and policies.</li>
    <li>Fulfill all financial obligations as outlined in the Tuition Contract.</li>
    <li>Communicate with teachers and staff regarding any concerns.</li>
    <li>Ensure the student arrives with all necessary materials and supplies.</li>
  </ul>

  <h3 style="color: #7a0012; margin-top: 24px;">Agreement</h3>
  <p>By signing below, I confirm my commitment to enroll my child at JETS School and agree to the terms and responsibilities outlined above.</p>

  <p style="margin-top: 24px; color: #555; font-size: 0.9em;">Date: {{date}}</p>
</div>`,
    },
    {
      name: "Pay It Forward Contract",
      type: "SCHOLARSHIP_CONTRACT",
      content: {
        fields: [
          { name: "agreeToCap", label: "I understand my total Pay It Forward repayment will never exceed the scholarship amount listed above.", type: "checkbox", required: true },
          { name: "agreeToTerms", label: "I have read and agree to all the terms of the Pay It Forward Contract.", type: "checkbox", required: true },
        ],
      },
      htmlContent: `<div style="font-family: Georgia, serif; max-width: 720px; margin: 0 auto; color: #1a1a1a;">
  <h2 style="text-align: center; color: #7a0012; border-bottom: 2px solid #7a0012; padding-bottom: 12px;">JETS School &mdash; Pay It Forward Contract</h2>
  <p style="color: #555; text-align: center; margin-bottom: 24px;">Academic Year {{academicYear}}</p>

  <div style="background: #fef7f7; border-left: 4px solid #A30018; padding: 10px 14px; margin-bottom: 20px; font-size: 0.9em;">
    <strong>Note:</strong> This contract is a working draft. Final attorney review for compliance with California Income Share Agreement law (DFPI registration) is pending before this is used for new awards.
  </div>

  <h3 style="color: #7a0012; margin-top: 24px;">The Pay It Forward idea</h3>
  <p>JETS believes every motivated student deserves a JETS education regardless of family finances. Through the Pay It Forward (PIF) Program we offer <strong>deferred tuition &mdash; an interest-free advance from JETS that you repay only when you can</strong>, so we can fund the next student in need.</p>

  <h3 style="color: #7a0012; margin-top: 24px;">Acknowledgment</h3>
  <p>I, {{studentName}} (the &ldquo;Pledger&rdquo;), acknowledge that during my enrollment at JETS I have received or may receive financial consideration in the form of deferred tuition through the Pay It Forward Program. The deferred tuition is a debenture from JETS, not a subsidy or concession.</p>
  <p><strong>Total deferred tuition awarded:</strong> {{scholarshipAmount}}</p>

  <h3 style="color: #7a0012; margin-top: 24px;">My commitment</h3>
  <p>As a member of the JETS learning community, I affirm my commitment <em>(bli neder)</em> to the Pay It Forward Program and agree to the following:</p>
  <ol>
    <li>Upon my transition from JETS, I will receive an accounting from the school of the full deferred-tuition amount.</li>
    <li>Once I am gainfully employed (defined below), I will donate <strong>10% of my gross annual income</strong> to JETS each year until my deferred tuition has been repaid.</li>
    <li><strong>Total payment cap.</strong> The cumulative amount I am required to pay back will <strong>never exceed the original deferred-tuition amount listed above</strong> &mdash; not 10x, not 1.5x, not even slightly more. Once I have paid that amount in total, my obligation under this contract ends.</li>
  </ol>

  <h3 style="color: #7a0012; margin-top: 24px;">Income floor</h3>
  <p>Repayment is paused for any year in which my gross annual income is below <strong>$50,000</strong> (adjusted for inflation every five years). Years below the floor do not extend the maximum term.</p>

  <h3 style="color: #7a0012; margin-top: 24px;">Maximum term</h3>
  <p>My obligation under this contract ends automatically <strong>10 years</strong> after my transition from JETS, even if I have not paid the full deferred-tuition amount. After year 10, no further payment is owed.</p>

  <h3 style="color: #7a0012; margin-top: 24px;">Hardship pause</h3>
  <p>I may request a temporary pause for hardship (job loss, serious illness, family emergency, etc.). JETS will pause my obligation in good faith for up to 12 consecutive months at a time. Pause periods do not extend the 10-year maximum term.</p>

  <h3 style="color: #7a0012; margin-top: 24px;">What I'll provide</h3>
  <p>I'll provide a copy of my annual tax filing each year my obligation is active, so JETS can calculate my 10% contribution. JETS keeps this confidential.</p>

  <h3 style="color: #7a0012; margin-top: 24px;">Why this matters</h3>
  <p>Donations from PIF alumni are critical to the operating viability of JETS. Every dollar you pay forward funds another student who otherwise couldn't attend. Donations are made annually, at minimum.</p>

  <h3 style="color: #7a0012; margin-top: 24px;">Disputes (Bais Din)</h3>
  <p>Any dispute arising out of or related to this agreement will be settled exclusively by arbitration in accordance with the rules of a Bais Din.</p>

  <h3 style="color: #7a0012; margin-top: 24px;">Acknowledgment</h3>
  <p>By signing below, I acknowledge that I have read, understand, and agree to all the terms above &mdash; especially the <strong>cap of 1&times; the deferred-tuition amount</strong>, the income floor, the 10-year maximum, and the hardship pause.</p>

  <p style="margin-top: 32px; color: #555; font-size: 0.85em;">Date: {{date}} &nbsp;&middot;&nbsp; JETS School &middot; 16601 Rinaldi St., Granada Hills, CA 91344</p>
</div>`,
    },
  ];

  let created = 0;
  let updated = 0;
  let skipped = 0;
  for (const template of defaultTemplates) {
    const existing = await db.documentTemplate.findFirst({
      where: { type: template.type, name: template.name },
    });
    if (existing) {
      // Skip if admin has bumped the version (manual edit) and force is not set.
      if (!force && existing.version > 1) {
        skipped++;
        continue;
      }
      await db.documentTemplate.update({
        where: { id: existing.id },
        data: {
          htmlContent: template.htmlContent,
          content: JSON.parse(JSON.stringify(template.content)),
          isActive: true,
          version: { increment: 1 },
        },
      });
      updated++;
    } else {
      await db.documentTemplate.create({
        data: {
          name: template.name,
          type: template.type,
          htmlContent: template.htmlContent,
          content: JSON.parse(JSON.stringify(template.content)),
        },
      });
      created++;
    }
  }

  revalidatePath("/admin/documents");
  return {
    message: `${created} created, ${updated} updated, ${skipped} skipped (manually edited; pass force=true to overwrite).`,
    seeded: created + updated,
  };
}
