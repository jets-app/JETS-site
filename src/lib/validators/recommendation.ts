import { z } from "zod";

// ==================== Rating Scale (1-5 numeric) ====================

export const ratingValues = ["1", "2", "3", "4", "5"] as const;
export type RatingValue = (typeof ratingValues)[number];

// ==================== Rating Categories ====================

export const ratingCategories = [
  { key: "desireForAcademicGrowth", label: "Desire for academic growth" },
  { key: "considerationForOthers", label: "Consideration for others" },
  { key: "commitmentToReligiousDecorum", label: "Commitment to religious decorum" },
  { key: "responsivenessToConstructiveCriticism", label: "Responsiveness to constructive criticism" },
  { key: "levelOfResponsibility", label: "Level of responsibility" },
] as const;

export type RatingCategoryKey = (typeof ratingCategories)[number]["key"];

// ==================== Overall Recommendation ====================

export const overallRecommendationOptions = [
  "I would highly recommend this applicant to JETS",
  "I would recommend this applicant to JETS",
  "I would recommend this applicant to JETS with reservation",
  "I would not recommend this applicant to JETS",
] as const;

export type OverallRecommendation =
  (typeof overallRecommendationOptions)[number];

// ==================== Legacy exports (keep compatibility) ====================

/** @deprecated Use ratingValues instead */
export const ratingScale = ratingValues;

/** @deprecated No longer used — capacity is now a free-text textarea */
export const capacityOptions = [
  "Teacher",
  "Principal",
  "Rabbi",
  "Mentor",
  "Other",
] as const;

export type Capacity = (typeof capacityOptions)[number];
export type Rating = RatingValue;

// ==================== Schemas ====================

const ratingEnum = z.enum(ratingValues, {
  message: "Please select a rating",
});

const ratingWithCommentsSchema = z.object({
  rating: ratingEnum,
  comments: z.string().optional().default(""),
});

export const recommendationResponseSchema = z.object({
  // Section 1: Recommender Info
  recommenderName: z.string().min(1, "Please enter your name"),
  recommenderEmail: z.string().email("Please enter a valid email"),
  recommenderPhone: z.string().min(1, "Please enter your phone number"),
  knownDuration: z.string().min(1, "Please describe how long and in what capacity you have known the applicant"),

  // Section 2: Ratings (1-5 with optional comments)
  desireForAcademicGrowth: ratingWithCommentsSchema,
  considerationForOthers: ratingWithCommentsSchema,
  commitmentToReligiousDecorum: ratingWithCommentsSchema,
  responsivenessToConstructiveCriticism: ratingWithCommentsSchema,
  levelOfResponsibility: ratingWithCommentsSchema,

  // Section 3: Student Questions
  strengthsAndWeaknesses: z.string().min(10, "Please provide your observations of the student's strengths and weaknesses"),
  specialNeeds: z.string().min(1, "Please answer this question"),
  socialSkills: z.string().min(1, "Please share your observations of the student's social skills"),
  academicSkills: z.string().min(1, "Please share your observations of the student's academic skills"),
  disciplineIssues: z.string().min(1, "Please answer this question"),
  additionalComments: z.string().optional().default(""),

  // Section 4: Overall Recommendation
  overallRecommendation: z.enum(overallRecommendationOptions, {
    message: "Please select your overall recommendation",
  }),
});

export type RecommendationResponse = z.infer<
  typeof recommendationResponseSchema
>;

// ==================== Referee Input (for creating recommendations) ====================

export const refereeInputSchema = z.object({
  name: z.string().min(2, "Referee name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional().default(""),
  relation: z.string().min(1, "Please specify the relationship"),
});

export type RefereeInput = z.infer<typeof refereeInputSchema>;
