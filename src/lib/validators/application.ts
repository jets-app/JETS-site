import { z } from "zod";

// ==================== Step 1: Student Info ====================
export const studentInfoSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  middleName: z.string().optional(),
  preferredName: z.string().optional(),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  phone: z.string().optional(),
  email: z.string().email("Please enter a valid email").optional().or(z.literal("")),
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
  fatherHebrewName: z.string().optional(),
  motherHebrewName: z.string().optional(),
});

export type HebrewNameData = z.infer<typeof hebrewNameSchema>;

// ==================== Step 3: Parents Info ====================
const parentInfoSchema = z.object({
  salutation: z.string().optional(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().optional(),
  email: z.string().email("Please enter a valid email").optional().or(z.literal("")),
  addressLine1: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  maritalStatus: z.string().optional(),
  occupation: z.string().optional(),
});

const guardianSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
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
  relationship: z.string().optional(),
});

export const parentsInfoSchema = z.object({
  father: parentInfoSchema,
  mother: parentInfoSchema,
  hasGuardian: z.boolean().default(false),
  guardian: guardianSchema.optional(),
  emergencyContact: emergencyContactSchema,
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
  closeToSiblings: z.boolean().default(false),
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

export const schoolHistorySchema = z.object({
  lastSchoolName: z.string().optional(),
  principal: contactInfoSchema.optional(),
  teacher: contactInfoSchema.optional(),
  previousSchools: z.string().optional(),
  relatableContacts: z.array(relatableContactSchema).optional(),
});

export type SchoolHistoryData = z.infer<typeof schoolHistorySchema>;

// ==================== Step 6: Parent Questions ====================
export const parentQuestionsSchema = z.object({
  timeElapsed: z.boolean().default(false),
  timeElapsedDetails: z.string().optional(),
  lastTwoSummers: z.string().optional(),
  learningStrengths: z.string().optional(),
  socialStrengths: z.string().optional(),
  midosTovos: z.string().optional(),
  specialLearningNeeds: z.boolean().default(false),
  specialLearningNeedsDetails: z.string().optional(),
  physicalEmotionalNeeds: z.boolean().default(false),
  physicalEmotionalNeedsDetails: z.string().optional(),
  counselingHistory: z.boolean().default(false),
  counselingHistoryDetails: z.string().optional(),
  maturityAssessment: z.string().optional(),
});

export type ParentQuestionsData = z.infer<typeof parentQuestionsSchema>;

// ==================== Step 7: Applicant Assessment ====================
const ratingValues = ["Excellent", "Above Average", "Average", "Needs Development", "Poor"] as const;

const assessmentItemSchema = z.object({
  rating: z.string().optional(),
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
  }),
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
  gedInterest: z.boolean().default(false),
  gemarahMaterial: z.string().optional(),
  chassidusMaterial: z.string().optional(),
  halachaMaterial: z.string().optional(),
  otherFactors: z.string().optional(),
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
