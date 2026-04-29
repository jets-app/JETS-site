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

export async function seedDefaultTemplates() {
  await requireAdmin();

  const existingCount = await db.documentTemplate.count();
  if (existingCount > 0) {
    return { message: "Templates already exist. Skipping seed.", seeded: 0 };
  }

  const defaultTemplates: Array<{
    name: string;
    type: DocumentTemplateType;
    htmlContent: string;
    content: { fields: Array<{ name: string; label: string; type: string; required: boolean }> };
  }> = [
    {
      name: "Medical Form",
      type: "MEDICAL_FORM",
      content: {
        fields: [
          { name: "studentName", label: "Student Full Name", type: "text", required: true },
          { name: "dateOfBirth", label: "Date of Birth", type: "date", required: true },
          { name: "allergies", label: "Known Allergies", type: "textarea", required: false },
          { name: "medications", label: "Current Medications", type: "textarea", required: false },
          { name: "insuranceProvider", label: "Insurance Provider", type: "text", required: true },
          { name: "insurancePolicyNumber", label: "Insurance Policy #", type: "text", required: true },
          { name: "physicianName", label: "Physician Name", type: "text", required: true },
          { name: "physicianPhone", label: "Physician Phone", type: "tel", required: true },
        ],
      },
      htmlContent: `<div style="font-family: Georgia, serif; max-width: 700px; margin: 0 auto;">
  <h2 style="text-align: center; color: #7a0012; border-bottom: 2px solid #7a0012; padding-bottom: 12px;">JETS School &mdash; Medical Information Form</h2>
  <p style="color: #555; text-align: center; margin-bottom: 24px;">Academic Year {{academicYear}}</p>

  <p>This form authorizes JETS School to take any necessary emergency medical action for the student listed below. Please complete all fields accurately.</p>

  <h3 style="color: #7a0012; margin-top: 24px;">Student Information</h3>
  <p><strong>Student Name:</strong> {{studentName}}</p>
  <p><strong>Date of Birth:</strong> {{dateOfBirth}}</p>

  <h3 style="color: #7a0012; margin-top: 24px;">Medical Details</h3>
  <p>Please provide the following information in the fields below.</p>

  <h3 style="color: #7a0012; margin-top: 24px;">Insurance Information</h3>
  <p>Please fill in your insurance details in the fields below.</p>

  <h3 style="color: #7a0012; margin-top: 24px;">Authorization</h3>
  <p>I, the undersigned parent/guardian, authorize JETS School and its staff to seek emergency medical treatment for my child in the event that I cannot be reached. I understand that every effort will be made to contact me first.</p>

  <p style="margin-top: 24px; color: #555; font-size: 0.9em;">Date: {{date}}</p>
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
          { name: "tuitionAmount", label: "Annual Tuition Amount", type: "text", required: false },
          { name: "paymentPlan", label: "Preferred Payment Plan", type: "select", required: false },
        ],
      },
      htmlContent: `<div style="font-family: Georgia, serif; max-width: 700px; margin: 0 auto;">
  <h2 style="text-align: center; color: #7a0012; border-bottom: 2px solid #7a0012; padding-bottom: 12px;">JETS School &mdash; Tuition Contract</h2>
  <p style="color: #555; text-align: center; margin-bottom: 24px;">Academic Year {{academicYear}}</p>

  <p><strong>Student Name:</strong> {{studentName}}</p>
  <p><strong>Parent/Guardian:</strong> {{parentName}}</p>

  <h3 style="color: #7a0012; margin-top: 24px;">Tuition Details</h3>
  <p><strong>Annual Tuition:</strong> {{tuitionAmount}}</p>
  <p>If a scholarship has been awarded, the adjusted amount will be reflected above.</p>

  <h3 style="color: #7a0012; margin-top: 24px;">Payment Terms</h3>
  <ul>
    <li>Tuition is due in full by August 15th, or according to an approved payment plan.</li>
    <li>Payment plans include: Annual (full payment), Semi-Annual (2 payments), Quarterly (4 payments), or Monthly (10 payments).</li>
    <li>A late fee of $50 will be assessed for payments received more than 10 days past due.</li>
    <li>Returned checks or failed electronic payments will incur a $35 fee.</li>
  </ul>

  <h3 style="color: #7a0012; margin-top: 24px;">Withdrawal Policy</h3>
  <ul>
    <li>Written notice of withdrawal must be provided at least 30 days in advance.</li>
    <li>Refunds will be prorated based on the date of withdrawal.</li>
    <li>No refunds will be issued after the midpoint of the academic year.</li>
  </ul>

  <h3 style="color: #7a0012; margin-top: 24px;">Agreement</h3>
  <p>By signing below, I agree to the tuition amount and payment terms as described above. I understand that failure to meet payment obligations may result in the student being unable to continue enrollment.</p>

  <p style="margin-top: 24px; color: #555; font-size: 0.9em;">Date: {{date}}</p>
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
      name: "Pay It Forward Scholarship Contract",
      type: "SCHOLARSHIP_CONTRACT",
      content: {
        fields: [
          { name: "scholarshipAmount", label: "Scholarship Amount", type: "text", required: false },
        ],
      },
      htmlContent: `<div style="font-family: Georgia, serif; max-width: 700px; margin: 0 auto;">
  <h2 style="text-align: center; color: #7a0012; border-bottom: 2px solid #7a0012; padding-bottom: 12px;">JETS School &mdash; Pay It Forward Scholarship Contract</h2>
  <p style="color: #555; text-align: center; margin-bottom: 24px;">Academic Year {{academicYear}}</p>

  <p><strong>Student Name:</strong> {{studentName}}</p>
  <p><strong>Scholarship Amount:</strong> {{scholarshipAmount}}</p>

  <h3 style="color: #7a0012; margin-top: 24px;">Scholarship Terms</h3>
  <p>You have been awarded a scholarship from the JETS School "Pay It Forward" fund. This scholarship is funded by alumni and community members who believe in giving back. In accepting this scholarship, you commit to the following:</p>

  <h3 style="color: #7a0012; margin-top: 24px;">Student Commitments</h3>
  <ul>
    <li><strong>Academic Excellence:</strong> Maintain satisfactory academic standing throughout the school year.</li>
    <li><strong>Community Service:</strong> Complete a minimum of 20 hours of community service during the academic year.</li>
    <li><strong>Pay It Forward:</strong> When you are financially able after completing your education, contribute back to the JETS School scholarship fund to help future students.</li>
    <li><strong>Good Standing:</strong> Remain in good behavioral standing as defined in the Student Handbook.</li>
  </ul>

  <h3 style="color: #7a0012; margin-top: 24px;">Scholarship Conditions</h3>
  <ul>
    <li>This scholarship is for the {{academicYear}} academic year only and must be renewed annually.</li>
    <li>The scholarship may be revoked if the student fails to meet the commitments above.</li>
    <li>This scholarship cannot be combined with other JETS School financial awards unless approved by the administration.</li>
  </ul>

  <h3 style="color: #7a0012; margin-top: 24px;">Acknowledgment</h3>
  <p>By signing below, I acknowledge that I have read, understand, and agree to the terms of this scholarship. I commit to honoring the "Pay It Forward" spirit of this award.</p>

  <p style="margin-top: 24px; color: #555; font-size: 0.9em;">Date: {{date}}</p>
</div>`,
    },
  ];

  let seeded = 0;
  for (const template of defaultTemplates) {
    await db.documentTemplate.create({
      data: {
        name: template.name,
        type: template.type,
        htmlContent: template.htmlContent,
        content: JSON.parse(JSON.stringify(template.content)),
      },
    });
    seeded++;
  }

  revalidatePath("/admin/documents");
  return { message: `Successfully seeded ${seeded} default templates.`, seeded };
}
