import { z } from "zod";

// ==================== Step 1: Student Info ====================
export const studentInfoSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  middleName: z.string().optional(),
  preferredName: z.string().min(1, "Preferred name / nickname is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required").refine((val) => {
    if (!val) return false;
    const dob = new Date(val);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear() -
      (today.getMonth() < dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate()) ? 1 : 0);
    return age >= 16;
  }, "Applicant must be at least 16 years old"),
  phone: z.string().min(1, "Cell phone is required"),
  email: z.string().email("Please enter a valid email").min(1, "Email is required"),
  addressLine1: z.string().min(1, "Street address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State/Province is required"),
  zipCode: z.string().min(1, "ZIP/Postal code is required"),
  country: z.string().min(1, "Country is required"),
  familyPhone: z.string().optional(),
});

export type StudentInfoData = z.infer<typeof studentInfoSchema>;

// ==================== Step 2: Hebrew Name ====================
export const hebrewNameSchema = z.object({
  applicantHebrewName: z.string().min(1, "Applicant's Hebrew name is required"),
  fatherHebrewName: z.string().min(1, "Father's Hebrew name is required"),
  motherHebrewName: z.string().min(1, "Mother's Hebrew name is required"),
});

export type HebrewNameData = z.infer<typeof hebrewNameSchema>;

// ==================== Step 3: Parents Info ====================
const MARITAL_STATUS_OPTIONS = ["Married", "Divorced", "Separated", "Widowed", "Single"] as const;

const parentInfoSchema = z.object({
  salutation: z.string().optional(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().min(1, "Email is required").email("Please enter a valid email"),
  addressLine1: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  maritalStatus: z.string().min(1, "Marital status is required"),
  occupation: z.string().min(1, "Occupation is required"),
});

export { MARITAL_STATUS_OPTIONS };

const guardianSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Please enter a valid email").optional().or(z.literal("")),
  relationship: z.string().optional(),
  addressLine1: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
});

const emergencyContactSchema = z.object({
  name: z.string().min(1, "Emergency contact name is required"),
  phone: z.string().min(1, "Emergency contact phone is required"),
  relationship: z.string().min(1, "Relationship is required"),
});

const parentsInfoBase = z.object({
  father: parentInfoSchema,
  mother: parentInfoSchema,
  hasGuardian: z.boolean().optional(),
  guardian: guardianSchema.optional(),
  emergencyContact: emergencyContactSchema,
});

export const parentsInfoSchema = parentsInfoBase.superRefine((data, ctx) => {
  if (data.hasGuardian) {
    if (!data.guardian?.firstName || data.guardian.firstName.trim() === "") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Guardian first name is required", path: ["guardian", "firstName"] });
    }
    if (!data.guardian?.lastName || data.guardian.lastName.trim() === "") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Guardian last name is required", path: ["guardian", "lastName"] });
    }
  }
});

export type ParentsInfoData = z.infer<typeof parentsInfoSchema>;

// ==================== Step 4: Family Info ====================
const siblingSchema = z.object({
  name: z.string().min(1, "Sibling name is required"),
  age: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
});

const grandparentsSchema = z.object({
  names: z.string().optional(),
  email: z.string().optional(),
});

export const familyInfoSchema = z.object({
  closeToSiblings: z.boolean().optional(),
  siblings: z.array(siblingSchema).optional(),
  grandparentsFather: grandparentsSchema.optional(),
  grandparentsMother: grandparentsSchema.optional(),
});

export type FamilyInfoData = z.infer<typeof familyInfoSchema>;

// ==================== Step 5: School History ====================
const contactInfoSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
});

const relatableContactSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  role: z.string().optional(),
});

const schoolHistoryBaseSchema = z.object({
  wasInSchool: z.enum(["yes", "no"], { message: "Please indicate if you were enrolled in school" }),
  notInSchoolExplanation: z.string().optional(),
  lastSchoolName: z.string().optional(),
  principal: contactInfoSchema.optional(),
  teacher: contactInfoSchema.optional(),
  previousSchools: z.string().optional(),
  relatableContacts: z.array(relatableContactSchema).optional(),
});

export const schoolHistorySchema = schoolHistoryBaseSchema.superRefine((data, ctx) => {
  if (data.wasInSchool === "yes") {
    if (!data.lastSchoolName || data.lastSchoolName.trim() === "") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Last school name is required", path: ["lastSchoolName"] });
    }
    if (!data.principal?.name || data.principal.name.trim() === "") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Principal name is required", path: ["principal", "name"] });
    }
    if (!data.teacher?.name || data.teacher.name.trim() === "") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Teacher/Rebbi name is required", path: ["teacher", "name"] });
    }
    if (!data.previousSchools || data.previousSchools.trim() === "") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Previous schools are required", path: ["previousSchools"] });
    }
  }
  if (data.wasInSchool === "no") {
    if (!data.notInSchoolExplanation || data.notInSchoolExplanation.trim() === "") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please explain what you were doing during this time", path: ["notInSchoolExplanation"] });
    }
  }
});

export type SchoolHistoryData = z.infer<typeof schoolHistorySchema>;

// ==================== Step 6: Parent Questions ====================
export const parentQuestionsSchema = z.object({
  timeElapsed: z.boolean(),
  timeElapsedDetails: z.string().optional(),
  lastTwoSummers: z.string().min(1, "Please describe the applicant's last two summers"),
  learningStrengths: z.string().min(1, "Learning strengths & limitations is required"),
  socialStrengths: z.string().min(1, "Social strengths & limitations is required"),
  midosTovos: z.string().min(1, "Midos Tovos is required"),
  specialLearningNeeds: z.boolean(),
  specialLearningNeedsDetails: z.string().optional(),
  physicalEmotionalNeeds: z.boolean(),
  physicalEmotionalNeedsDetails: z.string().optional(),
  counselingHistory: z.boolean(),
  counselingHistoryDetails: z.string().optional(),
  maturityAssessment: z.object({
    handlesFrustration: z.string().min(1, "This field is required"),
    dailyResponsibilities: z.string().min(1, "This field is required"),
    authorityInteraction: z.string().min(1, "This field is required"),
    independenceReadiness: z.string().min(1, "This field is required"),
  }),
});

export type ParentQuestionsData = z.infer<typeof parentQuestionsSchema>;

// ==================== Step 7: Applicant Assessment ====================
const ratingValues = ["Poor", "Needs Development", "Average", "Above Average", "Excellent"] as const;

const assessmentItemSchema = z.object({
  rating: z.string().min(1, "Please select a rating"),
  comments: z.string().optional(),
});

export const applicantAssessmentSchema = z.object({
  yirasShamayim: assessmentItemSchema,
  honestyEthics: assessmentItemSchema,
  workHabits: assessmentItemSchema,
  socialInteractions: assessmentItemSchema,
  angerIssues: assessmentItemSchema,
  maturityLevel: assessmentItemSchema,
});

export type ApplicantAssessmentData = z.infer<typeof applicantAssessmentSchema>;
export { ratingValues };

// ==================== Step 8: Studies & Trades ====================
const tradeInterestValues = ["Very Interested", "Interested", "Somewhat Interested", "Not Interested"] as const;

export const studiesTradesSchema = z.object({
  academics: z.object({
    englishReading: z.string().optional(),
    englishWriting: z.string().optional(),
    math: z.string().optional(),
    hebrewReading: z.string().optional(),
    hebrewWriting: z.string().optional(),
    hebrewComprehension: z.string().optional(),
    gemarah: z.string().optional(),
    chassidus: z.string().optional(),
  }),
  trades: z.object({
    accounting: z.string().optional(),
    business: z.string().optional(),
    computers: z.string().optional(),
    construction: z.string().optional(),
    photoshop: z.string().optional(),
    electrical: z.string().optional(),
    realEstate: z.string().optional(),
    finance: z.string().optional(),
    marketing: z.string().optional(),
    webDevelopment: z.string().optional(),
    emt: z.string().optional(),
    otherTrades: z.string().optional(),
  }).refine(
    (trades) => {
      const { otherTrades, ...tradeSelections } = trades;
      return Object.values(tradeSelections).some((v) => v && v.trim() !== "") || (otherTrades && otherTrades.trim() !== "");
    },
    { message: "Please select at least one trade interest" }
  ),
  extracurricular: z.object({
    culinary: z.string().optional(),
    musicCoaching: z.string().optional(),
    martialArts: z.string().optional(),
    gym: z.string().optional(),
    sports: z.string().optional(),
  }),
});

export type StudiesTradesData = z.infer<typeof studiesTradesSchema>;
export { tradeInterestValues };

// ==================== Step 9: Essay & Additional ====================
export const essayAdditionalSchema = z.object({
  essay: z.string().min(50, "Please write at least a few sentences for your essay"),
  gedInterest: z.boolean().optional(),
  wasInSchool: z.enum(["yes", "no"]).optional(),
  gemarahMaterial: z.string().optional(),
  chassidusMaterial: z.string().optional(),
  halachaMaterial: z.string().optional(),
  otherFactors: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.wasInSchool === "yes") {
    if (!data.gemarahMaterial || data.gemarahMaterial.trim() === "") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Gemarah material is required if you were in school", path: ["gemarahMaterial"] });
    }
    if (!data.chassidusMaterial || data.chassidusMaterial.trim() === "") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Chassidus material is required if you were in school", path: ["chassidusMaterial"] });
    }
    if (!data.halachaMaterial || data.halachaMaterial.trim() === "") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Halacha material is required if you were in school", path: ["halachaMaterial"] });
    }
  }
});

export type EssayAdditionalData = z.infer<typeof essayAdditionalSchema>;

// ==================== Step 10: Review & Submit ====================
const recommendationRefSchema = z.object({
  name: z.string().min(1, "Reference name is required"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
  relationship: z.string().min(1, "Relationship is required"),
});

export const reviewSubmitSchema = z.object({
  photoFile: z.string().optional(),
  recommendations: z.array(recommendationRefSchema).min(2, "Two recommendations are required"),
});

export type ReviewSubmitData = z.infer<typeof reviewSubmitSchema>;

// ==================== Combined type for all steps ====================
export type ApplicationFormData = {
  studentInfo?: StudentInfoData;
  hebrewNames?: HebrewNameData;
  parentsInfo?: ParentsInfoData;
  familyInfo?: FamilyInfoData;
  schoolHistory?: SchoolHistoryData;
  parentQuestions?: ParentQuestionsData;
  applicantAssessment?: ApplicantAssessmentData;
  studiesTrades?: StudiesTradesData;
  essayAdditional?: EssayAdditionalData;
  reviewSubmit?: ReviewSubmitData;
};

export const STEP_LABELS = [
  "Student Info",
  "Hebrew Name",
  "Parents Info",
  "Family Info",
  "School History",
  "Parent Questions",
  "Assessment",
  "Studies & Trades",
  "Essay",
  "Review & Submit",
] as const;
