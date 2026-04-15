/**
 * JETS School — Demo data seed script
 *
 * Run with: npm run db:demo
 *
 * Idempotent — safe to run multiple times. Looks up existing records by
 * unique keys (email, referenceNumber, invoiceNumber, name+year) and skips
 * or updates rather than duplicating.
 *
 * Seeds realistic demo data so the admin dashboard looks populated:
 *   - 10 parent users + 10 applications at every pipeline stage
 *   - Recommendations, payments, invoices, notes, messages
 *   - 15 alumni, 25 donors with varied donations
 */
import "dotenv/config";
import { PrismaClient, type ApplicationStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

// ---------- Constants ----------

const ACADEMIC_YEAR = "2026-2027";
const DEMO_PASSWORD = "Demo123!";
const ADMIN_EMAIL = "memem@jetsschool.org";

// ---------- Helpers ----------

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function daysFromNow(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

function pick<T>(arr: readonly T[], i: number): T {
  return arr[i % arr.length]!;
}

// ---------- Parents & Applications ----------

type ParentSpec = {
  name: string;
  email: string;
  phone: string;
};

const PARENTS: ParentSpec[] = [
  { name: "Shira Cohen", email: "shira.cohen@demo.jets", phone: "(818) 555-0101" },
  { name: "David Levy", email: "david.levy@demo.jets", phone: "(818) 555-0102" },
  { name: "Sarah Goldberg", email: "sarah.goldberg@demo.jets", phone: "(818) 555-0103" },
  { name: "Rebecca Friedman", email: "rebecca.friedman@demo.jets", phone: "(818) 555-0104" },
  { name: "Moshe Rosenberg", email: "moshe.rosenberg@demo.jets", phone: "(818) 555-0105" },
  { name: "Yael Shapiro", email: "yael.shapiro@demo.jets", phone: "(818) 555-0106" },
  { name: "Aaron Katz", email: "aaron.katz@demo.jets", phone: "(818) 555-0107" },
  { name: "Miriam Weiss", email: "miriam.weiss@demo.jets", phone: "(818) 555-0108" },
  { name: "Benjamin Stern", email: "ben.stern@demo.jets", phone: "(818) 555-0109" },
  { name: "Leah Horowitz", email: "leah.horowitz@demo.jets", phone: "(818) 555-0110" },
];

type AppSpec = {
  refSuffix: string;
  status: ApplicationStatus;
  currentStep: number;
  completionPct: number;
  applicationFeePaid: boolean;
  submittedDaysAgo?: number;
  interviewDaysFromNow?: number;
  student: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    email: string;
    phone: string;
    addressLine1: string;
    city: string;
    state: string;
    zipCode: string;
  };
  hebrewNames: { studentHebrew: string; fatherHebrew: string; motherHebrew: string };
  fatherInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    occupation: string;
    employer: string;
  };
  motherInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    occupation: string;
    employer: string;
  };
  schoolHistory: Array<{ school: string; years: string; city: string }>;
  essay: string;
};

const APP_SPECS: AppSpec[] = [
  // 1. Shira Cohen — DRAFT 30%
  {
    refSuffix: "0001",
    status: "DRAFT",
    currentStep: 2,
    completionPct: 30,
    applicationFeePaid: false,
    student: {
      firstName: "Yosef",
      lastName: "Cohen",
      dateOfBirth: "2011-03-14",
      email: "yosef.cohen@demo.jets",
      phone: "(818) 555-1101",
      addressLine1: "16820 Rinaldi St",
      city: "Granada Hills",
      state: "CA",
      zipCode: "91344",
    },
    hebrewNames: { studentHebrew: "יוסף", fatherHebrew: "אברהם", motherHebrew: "שירה" },
    fatherInfo: {
      firstName: "Avraham",
      lastName: "Cohen",
      email: "a.cohen@demo.jets",
      phone: "(818) 555-1201",
      occupation: "Software Engineer",
      employer: "Tech Solutions Inc.",
    },
    motherInfo: {
      firstName: "Shira",
      lastName: "Cohen",
      email: "shira.cohen@demo.jets",
      phone: "(818) 555-0101",
      occupation: "Teacher",
      employer: "Granada Hills Elementary",
    },
    schoolHistory: [{ school: "Valley Torah Academy", years: "2017-2025", city: "Los Angeles, CA" }],
    essay: "Yosef is a curious and dedicated student who loves learning Gemara with his father every Shabbos.",
  },
  // 2. David Levy — DRAFT 70%
  {
    refSuffix: "0002",
    status: "DRAFT",
    currentStep: 5,
    completionPct: 70,
    applicationFeePaid: false,
    student: {
      firstName: "Eitan",
      lastName: "Levy",
      dateOfBirth: "2010-07-22",
      email: "eitan.levy@demo.jets",
      phone: "(818) 555-1102",
      addressLine1: "17255 Devonshire St",
      city: "Northridge",
      state: "CA",
      zipCode: "91325",
    },
    hebrewNames: { studentHebrew: "איתן", fatherHebrew: "דוד", motherHebrew: "רחל" },
    fatherInfo: {
      firstName: "David",
      lastName: "Levy",
      email: "david.levy@demo.jets",
      phone: "(818) 555-0102",
      occupation: "Accountant",
      employer: "Levy & Associates CPA",
    },
    motherInfo: {
      firstName: "Rachel",
      lastName: "Levy",
      email: "rachel.levy@demo.jets",
      phone: "(818) 555-1202",
      occupation: "Dental Hygienist",
      employer: "Smile Care Dentistry",
    },
    schoolHistory: [{ school: "Yeshiva Gedolah", years: "2016-2025", city: "Los Angeles, CA" }],
    essay: "Eitan thrives in hands-on learning environments and shows strong leadership among his peers.",
  },
  // 3. Sarah Goldberg — SUBMITTED
  {
    refSuffix: "0003",
    status: "SUBMITTED",
    currentStep: 8,
    completionPct: 100,
    applicationFeePaid: true,
    submittedDaysAgo: 14,
    student: {
      firstName: "Ariel",
      lastName: "Goldberg",
      dateOfBirth: "2011-01-09",
      email: "ariel.goldberg@demo.jets",
      phone: "(818) 555-1103",
      addressLine1: "10750 Balboa Blvd",
      city: "Granada Hills",
      state: "CA",
      zipCode: "91344",
    },
    hebrewNames: { studentHebrew: "אריאל", fatherHebrew: "יצחק", motherHebrew: "שרה" },
    fatherInfo: {
      firstName: "Yitzchak",
      lastName: "Goldberg",
      email: "y.goldberg@demo.jets",
      phone: "(818) 555-1203",
      occupation: "Attorney",
      employer: "Goldberg Law Group",
    },
    motherInfo: {
      firstName: "Sarah",
      lastName: "Goldberg",
      email: "sarah.goldberg@demo.jets",
      phone: "(818) 555-0103",
      occupation: "Pediatric Nurse",
      employer: "Children's Hospital LA",
    },
    schoolHistory: [{ school: "Emek Hebrew Academy", years: "2016-2025", city: "Sherman Oaks, CA" }],
    essay: "Ariel is passionate about both Torah study and building with his hands. He dreams of opening his own construction business one day.",
  },
  // 4. Rebecca Friedman — SUBMITTED
  {
    refSuffix: "0004",
    status: "SUBMITTED",
    currentStep: 8,
    completionPct: 100,
    applicationFeePaid: true,
    submittedDaysAgo: 10,
    student: {
      firstName: "Shmuel",
      lastName: "Friedman",
      dateOfBirth: "2010-11-30",
      email: "shmuel.friedman@demo.jets",
      phone: "(818) 555-1104",
      addressLine1: "18525 Chatsworth St",
      city: "Granada Hills",
      state: "CA",
      zipCode: "91344",
    },
    hebrewNames: { studentHebrew: "שמואל", fatherHebrew: "משה", motherHebrew: "רבקה" },
    fatherInfo: {
      firstName: "Moshe",
      lastName: "Friedman",
      email: "m.friedman@demo.jets",
      phone: "(818) 555-1204",
      occupation: "General Contractor",
      employer: "Friedman Construction",
    },
    motherInfo: {
      firstName: "Rebecca",
      lastName: "Friedman",
      email: "rebecca.friedman@demo.jets",
      phone: "(818) 555-0104",
      occupation: "Homemaker",
      employer: "",
    },
    schoolHistory: [{ school: "Cheder Menachem", years: "2016-2025", city: "Los Angeles, CA" }],
    essay: "Shmuel loves working with tools and has been helping his father on jobsites since he was eight.",
  },
  // 5. Moshe Rosenberg — OFFICE_REVIEW
  {
    refSuffix: "0005",
    status: "OFFICE_REVIEW",
    currentStep: 8,
    completionPct: 100,
    applicationFeePaid: true,
    submittedDaysAgo: 21,
    student: {
      firstName: "Dovid",
      lastName: "Rosenberg",
      dateOfBirth: "2010-05-18",
      email: "dovid.rosenberg@demo.jets",
      phone: "(818) 555-1105",
      addressLine1: "11242 Zelzah Ave",
      city: "Granada Hills",
      state: "CA",
      zipCode: "91344",
    },
    hebrewNames: { studentHebrew: "דוד", fatherHebrew: "משה", motherHebrew: "חנה" },
    fatherInfo: {
      firstName: "Moshe",
      lastName: "Rosenberg",
      email: "moshe.rosenberg@demo.jets",
      phone: "(818) 555-0105",
      occupation: "Electrician",
      employer: "Rosenberg Electric",
    },
    motherInfo: {
      firstName: "Chana",
      lastName: "Rosenberg",
      email: "c.rosenberg@demo.jets",
      phone: "(818) 555-1205",
      occupation: "Speech Therapist",
      employer: "Valley Speech Center",
    },
    schoolHistory: [{ school: "Toras Emes Academy", years: "2016-2025", city: "Los Angeles, CA" }],
    essay: "Dovid is mechanically inclined and has already built a working model train set from scratch.",
  },
  // 6. Yael Shapiro — PRINCIPAL_REVIEW
  {
    refSuffix: "0006",
    status: "PRINCIPAL_REVIEW",
    currentStep: 8,
    completionPct: 100,
    applicationFeePaid: true,
    submittedDaysAgo: 28,
    student: {
      firstName: "Yehuda",
      lastName: "Shapiro",
      dateOfBirth: "2010-09-03",
      email: "yehuda.shapiro@demo.jets",
      phone: "(818) 555-1106",
      addressLine1: "17043 San Fernando Mission Blvd",
      city: "Granada Hills",
      state: "CA",
      zipCode: "91344",
    },
    hebrewNames: { studentHebrew: "יהודה", fatherHebrew: "אליהו", motherHebrew: "יעל" },
    fatherInfo: {
      firstName: "Eliyahu",
      lastName: "Shapiro",
      email: "e.shapiro@demo.jets",
      phone: "(818) 555-1206",
      occupation: "Rabbi",
      employer: "Congregation Beth Israel",
    },
    motherInfo: {
      firstName: "Yael",
      lastName: "Shapiro",
      email: "yael.shapiro@demo.jets",
      phone: "(818) 555-0106",
      occupation: "Occupational Therapist",
      employer: "Valley Pediatric OT",
    },
    schoolHistory: [{ school: "Mesivta Birkas Yitzchok", years: "2016-2025", city: "Los Angeles, CA" }],
    essay: "Yehuda is deeply committed to his learning and also has a real talent for carpentry work.",
  },
  // 7. Aaron Katz — INTERVIEW_SCHEDULED
  {
    refSuffix: "0007",
    status: "INTERVIEW_SCHEDULED",
    currentStep: 8,
    completionPct: 100,
    applicationFeePaid: true,
    submittedDaysAgo: 35,
    interviewDaysFromNow: 5,
    student: {
      firstName: "Menachem",
      lastName: "Katz",
      dateOfBirth: "2010-12-25",
      email: "menachem.katz@demo.jets",
      phone: "(818) 555-1107",
      addressLine1: "10536 Sepulveda Blvd",
      city: "Mission Hills",
      state: "CA",
      zipCode: "91345",
    },
    hebrewNames: { studentHebrew: "מנחם", fatherHebrew: "אהרון", motherHebrew: "דבורה" },
    fatherInfo: {
      firstName: "Aaron",
      lastName: "Katz",
      email: "aaron.katz@demo.jets",
      phone: "(818) 555-0107",
      occupation: "Plumber",
      employer: "Katz Plumbing Services",
    },
    motherInfo: {
      firstName: "Devorah",
      lastName: "Katz",
      email: "d.katz@demo.jets",
      phone: "(818) 555-1207",
      occupation: "Social Worker",
      employer: "Jewish Family Service",
    },
    schoolHistory: [{ school: "Yeshiva Aharon Yaakov", years: "2016-2025", city: "Los Angeles, CA" }],
    essay: "Menachem is eager to learn a trade while continuing his Torah studies. He has tremendous drive.",
  },
  // 8. Miriam Weiss — ACCEPTED (fee paid)
  {
    refSuffix: "0008",
    status: "ACCEPTED",
    currentStep: 8,
    completionPct: 100,
    applicationFeePaid: true,
    submittedDaysAgo: 45,
    student: {
      firstName: "Binyamin",
      lastName: "Weiss",
      dateOfBirth: "2010-04-08",
      email: "binyamin.weiss@demo.jets",
      phone: "(818) 555-1108",
      addressLine1: "15840 Ventura Blvd",
      city: "Encino",
      state: "CA",
      zipCode: "91436",
    },
    hebrewNames: { studentHebrew: "בנימין", fatherHebrew: "נפתלי", motherHebrew: "מרים" },
    fatherInfo: {
      firstName: "Naftali",
      lastName: "Weiss",
      email: "n.weiss@demo.jets",
      phone: "(818) 555-1208",
      occupation: "Diamond Dealer",
      employer: "Weiss Diamonds",
    },
    motherInfo: {
      firstName: "Miriam",
      lastName: "Weiss",
      email: "miriam.weiss@demo.jets",
      phone: "(818) 555-0108",
      occupation: "Physical Therapist",
      employer: "Encino PT Clinic",
    },
    schoolHistory: [{ school: "Harkham Hillel Hebrew Academy", years: "2016-2025", city: "Beverly Hills, CA" }],
    essay: "Binyamin has excelled in every subject and is ready for the challenges of yeshiva and a trade program.",
  },
  // 9. Benjamin Stern — DOCUMENTS_PENDING
  {
    refSuffix: "0009",
    status: "DOCUMENTS_PENDING",
    currentStep: 8,
    completionPct: 100,
    applicationFeePaid: true,
    submittedDaysAgo: 60,
    student: {
      firstName: "Yaakov",
      lastName: "Stern",
      dateOfBirth: "2010-08-16",
      email: "yaakov.stern@demo.jets",
      phone: "(818) 555-1109",
      addressLine1: "18344 Devonshire St",
      city: "Northridge",
      state: "CA",
      zipCode: "91325",
    },
    hebrewNames: { studentHebrew: "יעקב", fatherHebrew: "בנימין", motherHebrew: "אסתר" },
    fatherInfo: {
      firstName: "Benjamin",
      lastName: "Stern",
      email: "ben.stern@demo.jets",
      phone: "(818) 555-0109",
      occupation: "Physician",
      employer: "Kaiser Permanente",
    },
    motherInfo: {
      firstName: "Esther",
      lastName: "Stern",
      email: "e.stern@demo.jets",
      phone: "(818) 555-1209",
      occupation: "Pharmacist",
      employer: "CVS Pharmacy",
    },
    schoolHistory: [{ school: "Shalhevet High School", years: "2016-2025", city: "Los Angeles, CA" }],
    essay: "Yaakov is academically gifted and has a deep love for learning both Torah and secular subjects.",
  },
  // 10. Leah Horowitz — ENROLLED
  {
    refSuffix: "0010",
    status: "ENROLLED",
    currentStep: 8,
    completionPct: 100,
    applicationFeePaid: true,
    submittedDaysAgo: 90,
    student: {
      firstName: "Shimon",
      lastName: "Horowitz",
      dateOfBirth: "2010-02-11",
      email: "shimon.horowitz@demo.jets",
      phone: "(818) 555-1110",
      addressLine1: "16633 Rinaldi St",
      city: "Granada Hills",
      state: "CA",
      zipCode: "91344",
    },
    hebrewNames: { studentHebrew: "שמעון", fatherHebrew: "צבי", motherHebrew: "לאה" },
    fatherInfo: {
      firstName: "Zvi",
      lastName: "Horowitz",
      email: "z.horowitz@demo.jets",
      phone: "(818) 555-1210",
      occupation: "Real Estate Broker",
      employer: "Horowitz Realty",
    },
    motherInfo: {
      firstName: "Leah",
      lastName: "Horowitz",
      email: "leah.horowitz@demo.jets",
      phone: "(818) 555-0110",
      occupation: "Dietitian",
      employer: "Providence Health",
    },
    schoolHistory: [{ school: "Yeshiva Rav Isacsohn", years: "2016-2025", city: "Los Angeles, CA" }],
    essay: "Shimon is enthusiastic, hardworking, and eager to begin his journey at JETS. Our family is thrilled.",
  },
];

// ---------- Recommendations ----------

const REFEREES: Array<{ name: string; email: string; relation: string; phone: string }> = [
  { name: "Rabbi Yosef Sacks", email: "rabbi.sacks@demo.jets", relation: "Former Rebbe", phone: "(818) 555-2001" },
  { name: "Mrs. Chaya Bernstein", email: "c.bernstein@demo.jets", relation: "Teacher", phone: "(818) 555-2002" },
  { name: "Rabbi Chaim Greenbaum", email: "r.greenbaum@demo.jets", relation: "Mentor", phone: "(818) 555-2003" },
  { name: "Mr. Yehoshua Klein", email: "y.klein@demo.jets", relation: "Principal", phone: "(818) 555-2004" },
  { name: "Rabbi Dovid Abramson", email: "r.abramson@demo.jets", relation: "Rav", phone: "(818) 555-2005" },
  { name: "Mrs. Rina Feldman", email: "r.feldman@demo.jets", relation: "Teacher", phone: "(818) 555-2006" },
];

const REC_RESPONSES = [
  {
    academicAbility: "Excellent",
    middos: "Outstanding — always respectful and kind",
    workEthic: "Strong — completes assignments diligently",
    recommendation: "I enthusiastically recommend this student for JETS. He is a wonderful young man with great potential.",
  },
  {
    academicAbility: "Very Good",
    middos: "Exemplary — a true mensch",
    workEthic: "Exceptional",
    recommendation: "Without reservation, I recommend this student. He will be an asset to any yeshiva.",
  },
];

// ---------- Alumni ----------

const ALUMNI_DATA: Array<{
  firstName: string;
  lastName: string;
  graduationYear: number;
  programCompleted: string;
  email: string;
  phone: string;
  address: string;
  notes?: string;
}> = [
  { firstName: "Aryeh", lastName: "Feldman", graduationYear: 2020, programCompleted: "Torah & Plumbing", email: "aryeh.feldman@demo.jets", phone: "(818) 555-3001", address: "Granada Hills, CA", notes: "Runs his own plumbing business." },
  { firstName: "Chaim", lastName: "Bernstein", graduationYear: 2020, programCompleted: "Torah & Electrical", email: "chaim.b@demo.jets", phone: "(818) 555-3002", address: "Los Angeles, CA" },
  { firstName: "Dovid", lastName: "Kaplan", graduationYear: 2020, programCompleted: "Torah & HVAC", email: "dovid.k@demo.jets", phone: "(818) 555-3003", address: "North Hollywood, CA" },
  { firstName: "Elazar", lastName: "Schwartz", graduationYear: 2021, programCompleted: "Torah & Carpentry", email: "e.schwartz@demo.jets", phone: "(818) 555-3004", address: "Van Nuys, CA", notes: "Works for a custom cabinetry firm." },
  { firstName: "Gavriel", lastName: "Rothstein", graduationYear: 2021, programCompleted: "Torah & Plumbing", email: "g.rothstein@demo.jets", phone: "(818) 555-3005", address: "Granada Hills, CA" },
  { firstName: "Yitzy", lastName: "Lieberman", graduationYear: 2021, programCompleted: "Torah & Electrical", email: "y.lieberman@demo.jets", phone: "(818) 555-3006", address: "Los Angeles, CA" },
  { firstName: "Meir", lastName: "Greenblatt", graduationYear: 2022, programCompleted: "Torah & Auto Mechanic", email: "meir.g@demo.jets", phone: "(818) 555-3007", address: "Northridge, CA", notes: "Certified ASE mechanic." },
  { firstName: "Nachman", lastName: "Hirsch", graduationYear: 2022, programCompleted: "Torah & HVAC", email: "n.hirsch@demo.jets", phone: "(818) 555-3008", address: "Encino, CA" },
  { firstName: "Pinchas", lastName: "Zimmerman", graduationYear: 2022, programCompleted: "Torah & Carpentry", email: "p.zimmerman@demo.jets", phone: "(818) 555-3009", address: "Los Angeles, CA" },
  { firstName: "Reuven", lastName: "Adler", graduationYear: 2023, programCompleted: "Torah & Electrical", email: "r.adler@demo.jets", phone: "(818) 555-3010", address: "Granada Hills, CA" },
  { firstName: "Shlomo", lastName: "Berkowitz", graduationYear: 2023, programCompleted: "Torah & Plumbing", email: "s.berkowitz@demo.jets", phone: "(818) 555-3011", address: "Pico-Robertson, LA, CA", notes: "Master plumber, employs two former classmates." },
  { firstName: "Tuvia", lastName: "Mandel", graduationYear: 2023, programCompleted: "Torah & Welding", email: "t.mandel@demo.jets", phone: "(818) 555-3012", address: "Los Angeles, CA" },
  { firstName: "Uri", lastName: "Finkelstein", graduationYear: 2024, programCompleted: "Torah & Carpentry", email: "u.finkelstein@demo.jets", phone: "(818) 555-3013", address: "Valley Village, CA" },
  { firstName: "Yonah", lastName: "Goldfarb", graduationYear: 2024, programCompleted: "Torah & HVAC", email: "y.goldfarb@demo.jets", phone: "(818) 555-3014", address: "Granada Hills, CA" },
  { firstName: "Zev", lastName: "Halpern", graduationYear: 2024, programCompleted: "Torah & Electrical", email: "z.halpern@demo.jets", phone: "(818) 555-3015", address: "Los Angeles, CA", notes: "Enrolled in continuing ed for master electrician." },
];

// ---------- Donors ----------

type DonorSpec = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  zipCode: string;
  tags: string[];
  donations: Array<{
    amount: number; // cents
    frequency: "ONE_TIME" | "MONTHLY" | "QUARTERLY" | "ANNUALLY";
    method: string;
    campaign: string;
    purpose?: string;
    daysAgo: number;
  }>;
};

const CAMPAIGNS = ["Annual Dinner 2026", "Building Fund", "Scholarship Fund", "General Support"];
const METHODS = ["credit_card", "check", "bank_transfer", "cash"];

const DONORS: DonorSpec[] = [
  {
    firstName: "Jacob", lastName: "Goldberg", email: "jgoldberg.donor@demo.jets", phone: "(818) 555-4001",
    city: "Beverly Hills", state: "CA", zipCode: "90210", tags: ["major_donor", "board"],
    donations: [
      { amount: 1000000, frequency: "ANNUALLY", method: "bank_transfer", campaign: "Building Fund", daysAgo: 30 },
      { amount: 500000, frequency: "ONE_TIME", method: "check", campaign: "Annual Dinner 2026", daysAgo: 120 },
    ],
  },
  {
    firstName: "Rachel", lastName: "Silverman", email: "rsilverman@demo.jets", phone: "(818) 555-4002",
    city: "Encino", state: "CA", zipCode: "91436", tags: ["recurring"],
    donations: [
      { amount: 50000, frequency: "MONTHLY", method: "credit_card", campaign: "General Support", daysAgo: 15 },
      { amount: 50000, frequency: "MONTHLY", method: "credit_card", campaign: "General Support", daysAgo: 45 },
      { amount: 50000, frequency: "MONTHLY", method: "credit_card", campaign: "General Support", daysAgo: 75 },
    ],
  },
  {
    firstName: "Goldberg", lastName: "Foundation", email: "grants@goldbergfdn.demo", phone: "(310) 555-4003",
    city: "Los Angeles", state: "CA", zipCode: "90048", tags: ["foundation", "major_donor"],
    donations: [
      { amount: 2500000, frequency: "ANNUALLY", method: "bank_transfer", campaign: "Scholarship Fund", purpose: "Annual scholarship grant", daysAgo: 60 },
    ],
  },
  {
    firstName: "Samuel", lastName: "Rothstein", email: "srothstein@demo.jets", phone: "(818) 555-4004",
    city: "Sherman Oaks", state: "CA", zipCode: "91403", tags: ["alumni_parent"],
    donations: [
      { amount: 100000, frequency: "ONE_TIME", method: "credit_card", campaign: "Annual Dinner 2026", daysAgo: 90 },
      { amount: 25000, frequency: "ONE_TIME", method: "credit_card", campaign: "General Support", daysAgo: 200 },
    ],
  },
  {
    firstName: "Hannah", lastName: "Bloom", email: "hbloom@demo.jets", phone: "(818) 555-4005",
    city: "Northridge", state: "CA", zipCode: "91325", tags: ["recurring"],
    donations: [
      { amount: 10000, frequency: "MONTHLY", method: "credit_card", campaign: "General Support", daysAgo: 10 },
      { amount: 10000, frequency: "MONTHLY", method: "credit_card", campaign: "General Support", daysAgo: 40 },
    ],
  },
  {
    firstName: "The Weinberg", lastName: "Family Trust", email: "trust@weinberg.demo", phone: "(310) 555-4006",
    city: "Pacific Palisades", state: "CA", zipCode: "90272", tags: ["trust", "major_donor"],
    donations: [
      { amount: 1500000, frequency: "ANNUALLY", method: "check", campaign: "Building Fund", daysAgo: 100 },
    ],
  },
  {
    firstName: "Michael", lastName: "Abramowitz", email: "mabramowitz@demo.jets", phone: "(818) 555-4007",
    city: "Granada Hills", state: "CA", zipCode: "91344", tags: [],
    donations: [
      { amount: 50000, frequency: "ONE_TIME", method: "credit_card", campaign: "Annual Dinner 2026", daysAgo: 14 },
    ],
  },
  {
    firstName: "Deborah", lastName: "Lieberman", email: "dlieberman@demo.jets", phone: "(818) 555-4008",
    city: "Tarzana", state: "CA", zipCode: "91356", tags: ["alumni_parent", "recurring"],
    donations: [
      { amount: 25000, frequency: "MONTHLY", method: "bank_transfer", campaign: "Scholarship Fund", daysAgo: 5 },
      { amount: 25000, frequency: "MONTHLY", method: "bank_transfer", campaign: "Scholarship Fund", daysAgo: 35 },
      { amount: 25000, frequency: "MONTHLY", method: "bank_transfer", campaign: "Scholarship Fund", daysAgo: 65 },
      { amount: 25000, frequency: "MONTHLY", method: "bank_transfer", campaign: "Scholarship Fund", daysAgo: 95 },
    ],
  },
  {
    firstName: "Isaac", lastName: "Moskowitz", email: "imoskowitz@demo.jets", phone: "(818) 555-4009",
    city: "Woodland Hills", state: "CA", zipCode: "91364", tags: ["major_donor"],
    donations: [
      { amount: 500000, frequency: "ANNUALLY", method: "check", campaign: "Building Fund", daysAgo: 180 },
      { amount: 100000, frequency: "ONE_TIME", method: "credit_card", campaign: "Annual Dinner 2026", daysAgo: 45 },
    ],
  },
  {
    firstName: "Tamar", lastName: "Gold", email: "tgold@demo.jets", phone: "(818) 555-4010",
    city: "Calabasas", state: "CA", zipCode: "91302", tags: [],
    donations: [
      { amount: 18000, frequency: "ONE_TIME", method: "credit_card", campaign: "General Support", daysAgo: 22 },
      { amount: 18000, frequency: "ONE_TIME", method: "credit_card", campaign: "Scholarship Fund", daysAgo: 150 },
    ],
  },
  {
    firstName: "Ephraim", lastName: "Sussman", email: "esussman@demo.jets", phone: "(818) 555-4011",
    city: "Los Angeles", state: "CA", zipCode: "90035", tags: ["board"],
    donations: [
      { amount: 250000, frequency: "ANNUALLY", method: "bank_transfer", campaign: "Scholarship Fund", daysAgo: 70 },
      { amount: 100000, frequency: "ONE_TIME", method: "credit_card", campaign: "Annual Dinner 2026", daysAgo: 15 },
    ],
  },
  {
    firstName: "Eliezer", lastName: "Pollack", email: "epollack@demo.jets", phone: "(818) 555-4012",
    city: "Valley Village", state: "CA", zipCode: "91607", tags: [],
    donations: [
      { amount: 36000, frequency: "ONE_TIME", method: "check", campaign: "Building Fund", daysAgo: 55 },
    ],
  },
  {
    firstName: "The Kaminetsky", lastName: "Foundation", email: "info@kaminetskyfdn.demo", phone: "(212) 555-4013",
    city: "New York", state: "NY", zipCode: "10023", tags: ["foundation", "major_donor"],
    donations: [
      { amount: 1000000, frequency: "ANNUALLY", method: "bank_transfer", campaign: "Scholarship Fund", purpose: "Named scholarship", daysAgo: 110 },
    ],
  },
  {
    firstName: "Yehuda", lastName: "Friedman", email: "yfriedman.donor@demo.jets", phone: "(818) 555-4014",
    city: "Encino", state: "CA", zipCode: "91436", tags: ["recurring"],
    donations: [
      { amount: 10000, frequency: "MONTHLY", method: "credit_card", campaign: "General Support", daysAgo: 8 },
      { amount: 10000, frequency: "MONTHLY", method: "credit_card", campaign: "General Support", daysAgo: 38 },
    ],
  },
  {
    firstName: "Shoshana", lastName: "Berman", email: "sberman@demo.jets", phone: "(818) 555-4015",
    city: "Granada Hills", state: "CA", zipCode: "91344", tags: [],
    donations: [
      { amount: 18000, frequency: "ONE_TIME", method: "credit_card", campaign: "Annual Dinner 2026", daysAgo: 16 },
    ],
  },
  {
    firstName: "Nathan", lastName: "Spivak", email: "nspivak@demo.jets", phone: "(818) 555-4016",
    city: "Studio City", state: "CA", zipCode: "91604", tags: [],
    donations: [
      { amount: 10000, frequency: "ONE_TIME", method: "credit_card", campaign: "General Support", daysAgo: 99 },
    ],
  },
  {
    firstName: "Chanie", lastName: "Markowitz", email: "cmarkowitz@demo.jets", phone: "(818) 555-4017",
    city: "North Hollywood", state: "CA", zipCode: "91607", tags: ["recurring"],
    donations: [
      { amount: 5000, frequency: "MONTHLY", method: "credit_card", campaign: "General Support", daysAgo: 3 },
      { amount: 5000, frequency: "MONTHLY", method: "credit_card", campaign: "General Support", daysAgo: 33 },
      { amount: 5000, frequency: "MONTHLY", method: "credit_card", campaign: "General Support", daysAgo: 63 },
    ],
  },
  {
    firstName: "Asher", lastName: "Finkel", email: "afinkel@demo.jets", phone: "(818) 555-4018",
    city: "Van Nuys", state: "CA", zipCode: "91401", tags: [],
    donations: [
      { amount: 50000, frequency: "ONE_TIME", method: "check", campaign: "Building Fund", daysAgo: 75 },
      { amount: 25000, frequency: "ONE_TIME", method: "credit_card", campaign: "Annual Dinner 2026", daysAgo: 130 },
    ],
  },
  {
    firstName: "Simcha", lastName: "Glickman", email: "sglickman@demo.jets", phone: "(818) 555-4019",
    city: "Los Angeles", state: "CA", zipCode: "90035", tags: ["board"],
    donations: [
      { amount: 180000, frequency: "ANNUALLY", method: "bank_transfer", campaign: "Scholarship Fund", daysAgo: 50 },
    ],
  },
  {
    firstName: "Rivka", lastName: "Tannenbaum", email: "rtannenbaum@demo.jets", phone: "(818) 555-4020",
    city: "Granada Hills", state: "CA", zipCode: "91344", tags: [],
    donations: [
      { amount: 10000, frequency: "ONE_TIME", method: "credit_card", campaign: "Annual Dinner 2026", daysAgo: 20 },
      { amount: 5000, frequency: "ONE_TIME", method: "credit_card", campaign: "General Support", daysAgo: 160 },
    ],
  },
  {
    firstName: "Meir", lastName: "Zilberberg", email: "mzilberberg@demo.jets", phone: "(818) 555-4021",
    city: "Beverly Hills", state: "CA", zipCode: "90210", tags: ["major_donor"],
    donations: [
      { amount: 500000, frequency: "ANNUALLY", method: "check", campaign: "Building Fund", daysAgo: 210 },
      { amount: 250000, frequency: "ONE_TIME", method: "bank_transfer", campaign: "Scholarship Fund", daysAgo: 80 },
    ],
  },
  {
    firstName: "Yocheved", lastName: "Rosenthal", email: "yrosenthal@demo.jets", phone: "(818) 555-4022",
    city: "Tarzana", state: "CA", zipCode: "91356", tags: [],
    donations: [
      { amount: 25000, frequency: "ONE_TIME", method: "credit_card", campaign: "Annual Dinner 2026", daysAgo: 12 },
    ],
  },
  {
    firstName: "The Klein", lastName: "Family Foundation", email: "admin@kleinfamily.demo", phone: "(310) 555-4023",
    city: "Los Angeles", state: "CA", zipCode: "90034", tags: ["foundation", "major_donor"],
    donations: [
      { amount: 750000, frequency: "ANNUALLY", method: "bank_transfer", campaign: "Building Fund", daysAgo: 140 },
    ],
  },
  {
    firstName: "Yechezkel", lastName: "Auerbach", email: "yauerbach@demo.jets", phone: "(818) 555-4024",
    city: "Los Angeles", state: "CA", zipCode: "90035", tags: [],
    donations: [
      { amount: 36000, frequency: "QUARTERLY", method: "bank_transfer", campaign: "Scholarship Fund", daysAgo: 25 },
      { amount: 36000, frequency: "QUARTERLY", method: "bank_transfer", campaign: "Scholarship Fund", daysAgo: 115 },
    ],
  },
  {
    firstName: "Gitty", lastName: "Neuman", email: "gneuman@demo.jets", phone: "(818) 555-4025",
    city: "Encino", state: "CA", zipCode: "91436", tags: ["recurring"],
    donations: [
      { amount: 18000, frequency: "MONTHLY", method: "credit_card", campaign: "General Support", daysAgo: 6 },
      { amount: 18000, frequency: "MONTHLY", method: "credit_card", campaign: "General Support", daysAgo: 36 },
      { amount: 18000, frequency: "MONTHLY", method: "credit_card", campaign: "General Support", daysAgo: 66 },
      { amount: 18000, frequency: "MONTHLY", method: "credit_card", campaign: "General Support", daysAgo: 96 },
      { amount: 18000, frequency: "MONTHLY", method: "credit_card", campaign: "General Support", daysAgo: 126 },
    ],
  },
];

// ---------- Main ----------

async function main() {
  console.log("JETS School — Demo seed starting...\n");

  const admin = await db.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (!admin) {
    throw new Error(`Admin user not found (${ADMIN_EMAIL}). Run npm run db:seed first.`);
  }

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  // ---------- 1. Parents ----------
  let parentsCreated = 0;
  const parentByEmail = new Map<string, { id: string; name: string }>();
  for (const p of PARENTS) {
    const existing = await db.user.findUnique({ where: { email: p.email } });
    if (existing) {
      parentByEmail.set(p.email, { id: existing.id, name: existing.name });
      continue;
    }
    const created = await db.user.create({
      data: {
        email: p.email,
        name: p.name,
        passwordHash,
        role: "PARENT",
        status: "ACTIVE",
        phone: p.phone,
        emailVerified: new Date(),
      },
    });
    parentByEmail.set(p.email, { id: created.id, name: created.name });
    parentsCreated++;
  }
  console.log(`  Parents: ${parentsCreated} created, ${PARENTS.length - parentsCreated} existed`);

  // ---------- 2. Applications + Students ----------
  let appsCreated = 0;
  const appByRef = new Map<string, { id: string; parentId: string; studentName: string }>();
  for (let i = 0; i < APP_SPECS.length; i++) {
    const spec = APP_SPECS[i]!;
    const parentSpec = PARENTS[i]!;
    const parent = parentByEmail.get(parentSpec.email)!;
    const referenceNumber = `JETS-2026-${spec.refSuffix}`;
    const existing = await db.application.findUnique({ where: { referenceNumber } });

    if (existing) {
      appByRef.set(referenceNumber, {
        id: existing.id,
        parentId: existing.parentId,
        studentName: `${spec.student.firstName} ${spec.student.lastName}`,
      });
      continue;
    }

    const app = await db.application.create({
      data: {
        referenceNumber,
        status: spec.status,
        academicYear: ACADEMIC_YEAR,
        parentId: parent.id,
        applicationFeePaid: spec.applicationFeePaid,
        applicationFeeAmount: 50000,
        currentStep: spec.currentStep,
        completionPct: spec.completionPct,
        hebrewNames: spec.hebrewNames,
        fatherInfo: spec.fatherInfo,
        motherInfo: spec.motherInfo,
        schoolHistory: spec.schoolHistory,
        emergencyContact: {
          name: `${spec.fatherInfo.firstName} ${spec.fatherInfo.lastName}`,
          phone: spec.fatherInfo.phone,
          relationship: "Father",
        },
        essay: spec.essay,
        submittedAt: spec.submittedDaysAgo != null ? daysAgo(spec.submittedDaysAgo) : null,
        interviewDate: spec.interviewDaysFromNow != null ? daysFromNow(spec.interviewDaysFromNow) : null,
        interviewStatus: spec.status === "INTERVIEW_SCHEDULED" ? "SCHEDULED" : "PENDING",
        student: {
          create: {
            firstName: spec.student.firstName,
            lastName: spec.student.lastName,
            dateOfBirth: new Date(spec.student.dateOfBirth),
            email: spec.student.email,
            phone: spec.student.phone,
            addressLine1: spec.student.addressLine1,
            city: spec.student.city,
            state: spec.student.state,
            zipCode: spec.student.zipCode,
            country: "United States",
          },
        },
      },
    });
    appByRef.set(referenceNumber, {
      id: app.id,
      parentId: parent.id,
      studentName: `${spec.student.firstName} ${spec.student.lastName}`,
    });
    appsCreated++;
  }
  console.log(`  Applications: ${appsCreated} created, ${APP_SPECS.length - appsCreated} existed`);

  // ---------- 3. Recommendations ----------
  const submittedStatuses: ApplicationStatus[] = [
    "SUBMITTED", "OFFICE_REVIEW", "PRINCIPAL_REVIEW",
    "INTERVIEW_SCHEDULED", "ACCEPTED", "DOCUMENTS_PENDING", "ENROLLED",
  ];
  let recsCreated = 0;
  for (let i = 0; i < APP_SPECS.length; i++) {
    const spec = APP_SPECS[i]!;
    if (!submittedStatuses.includes(spec.status)) continue;
    const app = appByRef.get(`JETS-2026-${spec.refSuffix}`)!;
    const existing = await db.recommendation.findMany({ where: { applicationId: app.id } });
    if (existing.length >= 2) continue;

    const ref1 = pick(REFEREES, i);
    const ref2 = pick(REFEREES, i + 3);
    const isLate = ["ACCEPTED", "DOCUMENTS_PENDING", "ENROLLED", "INTERVIEW_SCHEDULED"].includes(spec.status);
    const submittedDaysAgoForRec = (spec.submittedDaysAgo ?? 10) - 2;

    await db.recommendation.create({
      data: {
        applicationId: app.id,
        refereeName: ref1.name,
        refereeEmail: ref1.email,
        refereePhone: ref1.phone,
        refereeRelation: ref1.relation,
        status: isLate ? "COMPLETED" : "SENT",
        responses: isLate ? REC_RESPONSES[0] : undefined,
        submittedAt: isLate ? daysAgo(Math.max(1, submittedDaysAgoForRec)) : null,
        viewedAt: daysAgo(Math.max(1, submittedDaysAgoForRec + 1)),
        expiresAt: daysFromNow(30),
      },
    });
    await db.recommendation.create({
      data: {
        applicationId: app.id,
        refereeName: ref2.name,
        refereeEmail: ref2.email,
        refereePhone: ref2.phone,
        refereeRelation: ref2.relation,
        status: isLate ? "COMPLETED" : "VIEWED",
        responses: isLate ? REC_RESPONSES[1] : undefined,
        submittedAt: isLate ? daysAgo(Math.max(1, submittedDaysAgoForRec - 1)) : null,
        viewedAt: daysAgo(Math.max(1, submittedDaysAgoForRec + 2)),
        expiresAt: daysFromNow(30),
      },
    });
    recsCreated += 2;
  }
  console.log(`  Recommendations: ${recsCreated} created`);

  // ---------- 4. Payments (application fees + tuition for enrolled) ----------
  let paymentsCreated = 0;
  for (const spec of APP_SPECS) {
    if (!spec.applicationFeePaid) continue;
    const app = appByRef.get(`JETS-2026-${spec.refSuffix}`)!;
    const existing = await db.payment.findFirst({
      where: { applicationId: app.id, type: "APPLICATION_FEE" },
    });
    if (!existing) {
      await db.payment.create({
        data: {
          applicationId: app.id,
          type: "APPLICATION_FEE",
          status: "SUCCEEDED",
          amount: 50000,
          currency: "usd",
          description: `Application fee — ${app.studentName}`,
          paidAt: daysAgo(spec.submittedDaysAgo ?? 10),
        },
      });
      paymentsCreated++;
    }
  }
  // Tuition for ENROLLED
  const enrolledSpec = APP_SPECS.find((s) => s.status === "ENROLLED")!;
  const enrolledApp = appByRef.get(`JETS-2026-${enrolledSpec.refSuffix}`)!;
  const tuitionMonths = 3;
  for (let m = 0; m < tuitionMonths; m++) {
    const description = `Tuition payment — month ${m + 1}`;
    const exists = await db.payment.findFirst({
      where: { applicationId: enrolledApp.id, type: "TUITION", description },
    });
    if (!exists) {
      await db.payment.create({
        data: {
          applicationId: enrolledApp.id,
          type: "TUITION",
          status: "SUCCEEDED",
          amount: 150000, // $1,500
          currency: "usd",
          description,
          paidAt: daysAgo(30 * (tuitionMonths - m)),
        },
      });
      paymentsCreated++;
    }
  }
  console.log(`  Payments: ${paymentsCreated} created`);

  // ---------- 5. Invoices (10 monthly for enrolled) ----------
  let invoicesCreated = 0;
  for (let m = 1; m <= 10; m++) {
    const invoiceNumber = `INV-2026-${String(m).padStart(4, "0")}`;
    const existing = await db.invoice.findUnique({ where: { invoiceNumber } });
    if (existing) continue;

    // Distribute: first 3 paid, months 4 overdue, months 5-10 pending
    let status: string;
    let amountPaid = 0;
    let paidAt: Date | null = null;
    let dueDate: Date;

    if (m <= 3) {
      status = "paid";
      amountPaid = 150000;
      paidAt = daysAgo(30 * (4 - m));
      dueDate = daysAgo(30 * (4 - m) + 5);
    } else if (m === 4) {
      status = "overdue";
      dueDate = daysAgo(10);
    } else {
      status = "pending";
      dueDate = daysFromNow(30 * (m - 4));
    }

    await db.invoice.create({
      data: {
        invoiceNumber,
        applicationId: enrolledApp.id,
        parentId: enrolledApp.parentId,
        lineItems: [
          {
            description: `Monthly tuition — ${ACADEMIC_YEAR} (month ${m})`,
            quantity: 1,
            unitAmount: 150000,
            amount: 150000,
          },
        ],
        subtotal: 150000,
        tax: 0,
        total: 150000,
        amountPaid,
        status,
        dueDate,
        paidAt,
      },
    });
    invoicesCreated++;
  }

  // Create extra past-due invoices for the enrolled parent (demo)
  for (let extra = 1; extra <= 2; extra++) {
    const invoiceNumber = `INV-2026-9${String(extra).padStart(3, "0")}`;
    const existingExtra = await db.invoice.findUnique({ where: { invoiceNumber } });
    if (existingExtra) continue;
    await db.invoice.create({
      data: {
        invoiceNumber,
        applicationId: enrolledApp.id,
        parentId: enrolledApp.parentId,
        lineItems: [
          {
            description: `Past-due tuition (demo) — month ${extra}`,
            quantity: 1,
            unitAmount: 150000,
            amount: 150000,
          },
        ],
        subtotal: 150000,
        tax: 0,
        total: 150000,
        amountPaid: 0,
        status: "overdue",
        dueDate: daysAgo(30 + extra * 15),
      },
    });
    invoicesCreated++;
  }
  console.log(`  Invoices: ${invoicesCreated} created`);

  // ---------- 5b. Payment Methods + Auto-Pay (enrolled parent) ----------
  const enrolledParentId = enrolledApp.parentId;
  const existingMethods = await db.paymentMethod.count({
    where: { userId: enrolledParentId },
  });
  if (existingMethods === 0) {
    const card = await db.paymentMethod.create({
      data: {
        userId: enrolledParentId,
        type: "CREDIT_CARD",
        last4: "4242",
        brand: "Visa",
        expiryMonth: 12,
        expiryYear: 2028,
        isDefault: false,
      },
    });
    const bank = await db.paymentMethod.create({
      data: {
        userId: enrolledParentId,
        type: "BANK_ACCOUNT",
        last4: "6789",
        bankName: "Chase",
        accountNickname: "Chase Checking",
        isDefault: true,
      },
    });
    await db.autoPaySettings.upsert({
      where: { userId: enrolledParentId },
      create: {
        userId: enrolledParentId,
        enabled: true,
        paymentMethodId: bank.id,
      },
      update: {
        enabled: true,
        paymentMethodId: bank.id,
      },
    });
    console.log(`  Payment methods: 2 added (card ${card.last4}, bank ${bank.last4}); auto-pay ON`);
  }

  // ---------- 6. Alumni ----------
  let alumniCreated = 0;
  for (const a of ALUMNI_DATA) {
    const existing = await db.alumni.findFirst({
      where: { firstName: a.firstName, lastName: a.lastName, graduationYear: a.graduationYear },
    });
    if (existing) continue;
    await db.alumni.create({
      data: {
        firstName: a.firstName,
        lastName: a.lastName,
        email: a.email,
        phone: a.phone,
        address: a.address,
        graduationYear: a.graduationYear,
        programCompleted: a.programCompleted,
        notes: a.notes,
      },
    });
    alumniCreated++;
  }
  console.log(`  Alumni: ${alumniCreated} created`);

  // ---------- 7. Donors + Donations ----------
  let donorsCreated = 0;
  let donationsCreated = 0;
  for (const d of DONORS) {
    let donor = d.email
      ? await db.donor.findFirst({ where: { email: d.email } })
      : await db.donor.findFirst({ where: { firstName: d.firstName, lastName: d.lastName } });

    if (!donor) {
      donor = await db.donor.create({
        data: {
          firstName: d.firstName,
          lastName: d.lastName,
          email: d.email,
          phone: d.phone,
          city: d.city,
          state: d.state,
          zipCode: d.zipCode,
          country: "United States",
          tags: d.tags,
        },
      });
      donorsCreated++;
    }

    const existingDonations = await db.donation.findMany({ where: { donorId: donor.id } });
    if (existingDonations.length > 0) continue;

    for (const don of d.donations) {
      await db.donation.create({
        data: {
          donorId: donor.id,
          amount: don.amount,
          currency: "usd",
          frequency: don.frequency,
          method: don.method,
          campaign: don.campaign,
          purpose: don.purpose,
          donatedAt: daysAgo(don.daysAgo),
          receiptSent: don.daysAgo > 7,
        },
      });
      donationsCreated++;
    }
  }
  console.log(`  Donors: ${donorsCreated} created, Donations: ${donationsCreated} created`);

  // ---------- 8. Messages ----------
  let messagesCreated = 0;
  const messageSamples: Array<{ parentEmail: string; subject: string; body: string; fromAdmin: boolean; isRead: boolean; daysAgo: number }> = [
    {
      parentEmail: PARENTS[2]!.email,
      subject: "We received your application",
      body: "Dear Sarah, we have received your application for Ariel. We will be in touch with updates shortly. — JETS Admissions",
      fromAdmin: true,
      isRead: true,
      daysAgo: 14,
    },
    {
      parentEmail: PARENTS[5]!.email,
      subject: "Principal review underway",
      body: "Dear Yael, your application for Yehuda is currently in Principal review. Expect to hear about interview scheduling soon.",
      fromAdmin: true,
      isRead: true,
      daysAgo: 7,
    },
    {
      parentEmail: PARENTS[6]!.email,
      subject: "Interview scheduled",
      body: "Dear Aaron, your interview for Menachem is scheduled for next week. Please arrive 10 minutes early.",
      fromAdmin: true,
      isRead: false,
      daysAgo: 2,
    },
    {
      parentEmail: PARENTS[7]!.email,
      subject: "Congratulations — Binyamin accepted!",
      body: "Dear Miriam, we are thrilled to offer Binyamin a place at JETS School. Enrollment documents to follow.",
      fromAdmin: true,
      isRead: true,
      daysAgo: 20,
    },
    {
      parentEmail: PARENTS[9]!.email,
      subject: "Welcome to JETS!",
      body: "Dear Leah, welcome to the JETS family. We are so excited for Shimon to begin next year.",
      fromAdmin: true,
      isRead: true,
      daysAgo: 60,
    },
    {
      parentEmail: PARENTS[2]!.email,
      subject: "Question about recommendations",
      body: "Hi, I wanted to check if both of Ariel's recommendations have been received. Thank you!",
      fromAdmin: false,
      isRead: true,
      daysAgo: 12,
    },
  ];

  for (const m of messageSamples) {
    const parent = parentByEmail.get(m.parentEmail);
    if (!parent) continue;
    const existing = await db.message.findFirst({
      where: {
        subject: m.subject,
        senderId: m.fromAdmin ? admin.id : parent.id,
        receiverId: m.fromAdmin ? parent.id : admin.id,
      },
    });
    if (existing) continue;
    await db.message.create({
      data: {
        senderId: m.fromAdmin ? admin.id : parent.id,
        receiverId: m.fromAdmin ? parent.id : admin.id,
        subject: m.subject,
        body: m.body,
        isRead: m.isRead,
        emailSent: m.fromAdmin,
        createdAt: daysAgo(m.daysAgo),
      },
    });
    messagesCreated++;
  }
  console.log(`  Messages: ${messagesCreated} created`);

  // ---------- 9. Application Notes ----------
  let notesCreated = 0;
  const reviewedStatuses: ApplicationStatus[] = [
    "OFFICE_REVIEW", "PRINCIPAL_REVIEW", "INTERVIEW_SCHEDULED",
    "ACCEPTED", "DOCUMENTS_PENDING", "ENROLLED",
  ];
  const noteTemplates = [
    "Application looks strong. All required materials are in order.",
    "Recommendations are glowing. Student seems like a great fit for our program.",
    "Family is well-connected in the community. Parents are highly supportive of the program.",
    "Student interviewed well. Demonstrated maturity and clear interest in vocational track.",
    "Discussed financial aid options with parent — scholarship application forthcoming.",
  ];
  for (const spec of APP_SPECS) {
    if (!reviewedStatuses.includes(spec.status)) continue;
    const app = appByRef.get(`JETS-2026-${spec.refSuffix}`)!;
    const existing = await db.applicationNote.findMany({ where: { applicationId: app.id } });
    if (existing.length > 0) continue;

    const count = spec.status === "ENROLLED" ? 3 : 2;
    for (let n = 0; n < count; n++) {
      await db.applicationNote.create({
        data: {
          applicationId: app.id,
          authorId: admin.id,
          content: pick(noteTemplates, n + APP_SPECS.indexOf(spec)),
          isInternal: true,
          createdAt: daysAgo(Math.max(1, (spec.submittedDaysAgo ?? 10) - n * 3)),
        },
      });
      notesCreated++;
    }
  }
  console.log(`  Application notes: ${notesCreated} created`);

  console.log("\nDemo seed complete.\n");
  console.log(`Demo parent login password: ${DEMO_PASSWORD}`);
  console.log("Sample emails: shira.cohen@demo.jets, leah.horowitz@demo.jets, etc.");
}

main()
  .catch((err) => {
    console.error("Demo seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
