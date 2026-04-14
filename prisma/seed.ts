/**
 * JETS School — Database seed script
 *
 * Run with: npm run db:seed
 *
 * Idempotent — safe to run multiple times. Uses upserts / existence checks
 * so existing data is not duplicated or overwritten destructively.
 */
import "dotenv/config";
import { PrismaClient, type DocumentTemplateType } from "@prisma/client";

const db = new PrismaClient();

// ---------- Document Templates ----------

const DOCUMENT_TEMPLATES: Array<{
  name: string;
  type: DocumentTemplateType;
  htmlContent: string;
  content: {
    fields: Array<{
      name: string;
      label: string;
      type: string;
      required: boolean;
    }>;
  };
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
  <h3 style="color: #7a0012; margin-top: 24px;">Authorization</h3>
  <p>I, the undersigned parent/guardian, authorize JETS School and its staff to seek emergency medical treatment for my child in the event that I cannot be reached.</p>
  <p style="margin-top: 24px; color: #555; font-size: 0.9em;">Date: {{date}}</p>
</div>`,
  },
  {
    name: "Student Handbook Acknowledgment",
    type: "STUDENT_HANDBOOK",
    content: { fields: [] },
    htmlContent: `<div style="font-family: Georgia, serif; max-width: 700px; margin: 0 auto;">
  <h2 style="text-align: center; color: #7a0012; border-bottom: 2px solid #7a0012; padding-bottom: 12px;">JETS School &mdash; Student Handbook Acknowledgment</h2>
  <p style="color: #555; text-align: center; margin-bottom: 24px;">Academic Year {{academicYear}}</p>
  <p><strong>Student Name:</strong> {{studentName}}</p>
  <h3 style="color: #7a0012; margin-top: 24px;">Code of Conduct</h3>
  <ul>
    <li>Students are expected to conduct themselves with respect, integrity, and responsibility at all times.</li>
    <li>All students must adhere to the school dress code as outlined in the full handbook.</li>
    <li>Mobile phones are prohibited during school hours unless authorized.</li>
    <li>Students must attend all scheduled classes, davening, and school events.</li>
  </ul>
  <h3 style="color: #7a0012; margin-top: 24px;">Acknowledgment</h3>
  <p>By signing below, I acknowledge that I have read, understand, and agree to abide by all rules and policies set forth in the JETS School Student Handbook.</p>
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
  <h3 style="color: #7a0012; margin-top: 24px;">Payment Terms</h3>
  <ul>
    <li>Tuition is due in full by August 15th, or according to an approved payment plan.</li>
    <li>Late fee of $50 will be assessed for payments more than 10 days past due.</li>
  </ul>
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
  <p>This agreement confirms the enrollment of the above-named student at JETS School for the {{academicYear}} academic year.</p>
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
  <p>In accepting this scholarship, you commit to maintaining academic excellence, completing community service, and paying it forward when able.</p>
  <p style="margin-top: 24px; color: #555; font-size: 0.9em;">Date: {{date}}</p>
</div>`,
  },
];

// ---------- Donor Letter Templates ----------

const DONOR_LETTER_TEMPLATES = [
  {
    name: "Thank You Letter",
    type: "thank_you",
    subject: "Thank you for your generous gift to JETS School",
    body: `Dear {{donorName}},

On behalf of the entire JETS School community, I want to extend our heartfelt thanks for your generous gift of {{amount}}.

Your support makes it possible for us to provide our students with an exceptional Torah and vocational education. Donors like you are the backbone of our mission and enable us to continue to grow and serve our community.

We are deeply grateful for your partnership.

With warmest regards,
JETS School Administration`,
  },
  {
    name: "Tax-Deductible Receipt",
    type: "receipt",
    subject: "Your JETS School Donation Receipt — {{amount}}",
    body: `Dear {{donorName}},

Thank you for your tax-deductible donation to JETS School.

Donation Details:
- Amount: {{amount}}
- Date: {{donationDate}}
- Method: {{method}}

JETS Synagogue is a 501(c)(3) tax-exempt organization. EIN: 68-0500418.
No goods or services were provided in exchange for this contribution.

Please retain this receipt for your tax records.

Thank you for supporting JETS School.

Sincerely,
JETS School`,
  },
  {
    name: "Annual Giving Summary",
    type: "annual_summary",
    subject: "Your {{year}} Annual Giving Summary — JETS School",
    body: `Dear {{donorName}},

As we begin a new year, we want to take a moment to thank you for your generous support of JETS School during {{year}}.

Your total contributions for the year: {{totalAmount}}

Your gifts have helped us:
- Provide scholarships to students in need
- Maintain and improve our facilities
- Expand our trade and vocational programs
- Support our teachers and staff

JETS Synagogue is a 501(c)(3) tax-exempt organization. EIN: 68-0500418. Please retain this summary for your tax records.

With deepest gratitude,
JETS School`,
  },
];

// ---------- Message Templates ----------

const MESSAGE_TEMPLATES = [
  {
    name: "Application Received",
    subject: "We received your application to JETS School",
    body: `Dear {{parentName}},

We have received your application for {{studentName}} for the {{academicYear}} academic year. Thank you for choosing JETS School.

Your application is now in our queue for review. We will reach out with updates as your application progresses through each stage:
  1. Office Review
  2. Principal Review
  3. Interview
  4. Decision

In the meantime, please make sure your two recommendation requests have been sent and that your application fee has been paid.

If you have any questions, please don't hesitate to reach out.

Warm regards,
JETS School Admissions`,
  },
  {
    name: "Interview Invitation",
    subject: "Interview Invitation — {{studentName}}",
    body: `Dear {{parentName}},

We are pleased to invite {{studentName}} for an interview with our principals as part of the application process.

Please use the link below to schedule a time that works for your family:
{{calendlyLink}}

The interview will take approximately 30-45 minutes and will be conducted either in-person or via video call.

We look forward to meeting you.

Sincerely,
JETS School Admissions`,
  },
  {
    name: "Acceptance Notification",
    subject: "Congratulations! {{studentName}} has been accepted to JETS School",
    body: `Dear {{parentName}},

Congratulations! We are delighted to inform you that {{studentName}} has been accepted to JETS School for the {{academicYear}} academic year.

Your next steps:
  1. Log in to your parent portal
  2. Review and sign the enrollment documents (medical form, handbook acknowledgment, tuition contract, enrollment agreement)
  3. Submit your first tuition payment to secure your place

We are excited to welcome your family to our community.

With great joy,
JETS School Administration`,
  },
];

// ---------- Discount Codes ----------

const DISCOUNT_CODES = [
  {
    code: "EARLY2026",
    description: "Early bird 20% off application fee for 2026-2027",
    percentOff: 20,
    amountOff: null as number | null,
    maxUses: 100,
    expiresAt: new Date("2026-06-01"),
  },
  {
    code: "SIBLING",
    description: "$100 off application fee for sibling applicants",
    percentOff: null as number | null,
    amountOff: 10000, // $100 in cents
    maxUses: null,
    expiresAt: null,
  },
];

// ---------- Main Seed ----------

async function main() {
  console.log("JETS School — Seeding database...\n");

  // 1. SystemSettings
  const existingSettings = await db.systemSettings.findUnique({
    where: { id: "settings" },
  });
  if (!existingSettings) {
    await db.systemSettings.create({
      data: {
        id: "settings",
        currentAcademicYear: "2026-2027",
        applicationFeeAmount: 50000,
        applicationsOpen: true,
        schoolName: "JETS School",
        schoolLegalName: "JETS Synagogue",
        schoolEin: "68-0500418",
        schoolAddress: "Granada Hills, Los Angeles, CA",
        schoolPhone: "(818) 831-3000",
        schoolEmail: "info@jetsschool.org",
      },
    });
    console.log("  SystemSettings: created");
  } else {
    console.log("  SystemSettings: already exists (skipped)");
  }

  // 2. Document Templates
  let seededTemplates = 0;
  for (const template of DOCUMENT_TEMPLATES) {
    const existing = await db.documentTemplate.findFirst({
      where: { name: template.name, type: template.type },
    });
    if (!existing) {
      await db.documentTemplate.create({
        data: {
          name: template.name,
          type: template.type,
          htmlContent: template.htmlContent,
          content: JSON.parse(JSON.stringify(template.content)),
        },
      });
      seededTemplates++;
    }
  }
  console.log(
    `  DocumentTemplates: ${seededTemplates} seeded, ${DOCUMENT_TEMPLATES.length - seededTemplates} already existed`
  );

  // 3. Donor Letter Templates
  let seededDonorTemplates = 0;
  for (const template of DONOR_LETTER_TEMPLATES) {
    const existing = await db.donorLetterTemplate.findFirst({
      where: { name: template.name },
    });
    if (!existing) {
      await db.donorLetterTemplate.create({ data: template });
      seededDonorTemplates++;
    }
  }
  console.log(
    `  DonorLetterTemplates: ${seededDonorTemplates} seeded, ${DONOR_LETTER_TEMPLATES.length - seededDonorTemplates} already existed`
  );

  // 4. Message Templates
  let seededMessageTemplates = 0;
  for (const template of MESSAGE_TEMPLATES) {
    const existing = await db.messageTemplate.findFirst({
      where: { name: template.name },
    });
    if (!existing) {
      await db.messageTemplate.create({ data: template });
      seededMessageTemplates++;
    }
  }
  console.log(
    `  MessageTemplates: ${seededMessageTemplates} seeded, ${MESSAGE_TEMPLATES.length - seededMessageTemplates} already existed`
  );

  // 5. Discount Codes
  let seededCodes = 0;
  for (const code of DISCOUNT_CODES) {
    const existing = await db.discountCode.findUnique({
      where: { code: code.code },
    });
    if (!existing) {
      await db.discountCode.create({ data: code });
      seededCodes++;
    }
  }
  console.log(
    `  DiscountCodes: ${seededCodes} seeded, ${DISCOUNT_CODES.length - seededCodes} already existed`
  );

  console.log("\nSeeding complete.");
}

main()
  .catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
