import { z } from "zod";

// ==================== Rating Scale ====================

export const ratingScale = [
  "Excellent",
  "Good",
  "Average",
  "Below Average",
  "Poor",
] as const;

export type Rating = (typeof ratingScale)[number];

// ==================== Capacity Options ====================

export const capacityOptions = [
  "Teacher",
  "Principal",
  "Rabbi",
  "Mentor",
  "Other",
] as const;

export type Capacity = (typeof capacityOptions)[number];

// ==================== Overall Recommendation ====================

export const overallRecommendationOptions = [
  "Strongly Recommend",
  "Recommend",
  "Recommend with Reservations",
  "Do Not Recommend",
] as const;

export type OverallRecommendation =
  (typeof overallRecommendationOptions)[number];

// ==================== Rating Categories ====================

export const ratingCategories = [
  { key: "characterIntegrity", label: "Character and integrity" },
  { key: "workEthic", label: "Work ethic and motivation" },
  { key: "socialSkills", label: "Social skills and relationships" },
  { key: "emotionalMaturity", label: "Emotional maturity" },
  { key: "respectForAuthority", label: "Respect for authority" },
  { key: "religiousCommitment", label: "Religious commitment" },
] as const;

export type RatingCategoryKey =
  (typeof ratingCategories)[number]["key"];

// ==================== Schemas ====================

const ratingEnum = z.enum(ratingScale, {
  message: "Please select a rating",
});

export const recommendationResponseSchema = z.object({
  knownDuration: z
    .string()
    .min(1, "Please indicate how long you have known the applicant"),
  capacity: z.enum(capacityOptions, {
    message: "Please select a capacity",
  }),

  // Ratings
  characterIntegrity: ratingEnum,
  workEthic: ratingEnum,
  socialSkills: ratingEnum,
  emotionalMaturity: ratingEnum,
  respectForAuthority: ratingEnum,
  religiousCommitment: ratingEnum,

  // Written responses
  greatestStrengths: z
    .string()
    .min(10, "Please provide at least a brief description of the applicant's strengths"),
  areasOfConcern: z.string().optional().default(""),
  overallRecommendation: z.enum(overallRecommendationOptions, {
    message: "Please select your overall recommendation",
  }),
  additionalComments: z.string().optional().default(""),

  // Signature
  signature: z
    .string()
    .min(2, "Please type your full name as a signature"),
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
