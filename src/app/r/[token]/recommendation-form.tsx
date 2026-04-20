"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitRecommendation } from "@/server/actions/recommendation.actions";
import {
  ratingCategories,
  overallRecommendationOptions,
  type RecommendationResponse,
} from "@/lib/validators/recommendation";

interface RecommendationFormClientProps {
  token: string;
  refereeName: string;
  refereeEmail: string;
  studentName: string;
  parentName: string;
}

type RatingWithComments = {
  rating: string;
  comments: string;
};

export function RecommendationFormClient({
  token,
  refereeName,
  refereeEmail,
  studentName,
  parentName,
}: RecommendationFormClientProps) {
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Section 1: Recommender Info
  const [recommenderName, setRecommenderName] = useState(refereeName || "");
  const [recommenderEmail, setRecommenderEmail] = useState(refereeEmail || "");
  const [recommenderPhone, setRecommenderPhone] = useState("");
  const [knownDuration, setKnownDuration] = useState("");

  // Section 2: Ratings
  const [ratings, setRatings] = useState<Record<string, RatingWithComments>>(
    () => {
      const initial: Record<string, RatingWithComments> = {};
      for (const cat of ratingCategories) {
        initial[cat.key] = { rating: "", comments: "" };
      }
      return initial;
    }
  );

  // Section 3: Student Questions
  const [strengthsAndWeaknesses, setStrengthsAndWeaknesses] = useState("");
  const [specialNeeds, setSpecialNeeds] = useState("");
  const [socialSkills, setSocialSkills] = useState("");
  const [academicSkills, setAcademicSkills] = useState("");
  const [disciplineIssues, setDisciplineIssues] = useState("");
  const [additionalComments, setAdditionalComments] = useState("");

  // Section 4: Overall Recommendation
  const [overallRecommendation, setOverallRecommendation] = useState("");

  function setRatingValue(key: string, rating: string) {
    setRatings((prev) => ({
      ...prev,
      [key]: { ...prev[key], rating },
    }));
  }

  function setRatingComments(key: string, comments: string) {
    setRatings((prev) => ({
      ...prev,
      [key]: { ...prev[key], comments },
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const responses: RecommendationResponse = {
      recommenderName,
      recommenderEmail,
      recommenderPhone,
      knownDuration,
      desireForAcademicGrowth: ratings.desireForAcademicGrowth as RecommendationResponse["desireForAcademicGrowth"],
      considerationForOthers: ratings.considerationForOthers as RecommendationResponse["considerationForOthers"],
      commitmentToReligiousDecorum: ratings.commitmentToReligiousDecorum as RecommendationResponse["commitmentToReligiousDecorum"],
      responsivenessToConstructiveCriticism: ratings.responsivenessToConstructiveCriticism as RecommendationResponse["responsivenessToConstructiveCriticism"],
      levelOfResponsibility: ratings.levelOfResponsibility as RecommendationResponse["levelOfResponsibility"],
      strengthsAndWeaknesses,
      specialNeeds,
      socialSkills,
      academicSkills,
      disciplineIssues,
      additionalComments,
      overallRecommendation: overallRecommendation as RecommendationResponse["overallRecommendation"],
    };

    startTransition(async () => {
      const result = await submitRecommendation(token, responses);

      if (result.error) {
        setError(result.error);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center py-16 text-center animate-fade-in">
        <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold">Thank You!</h2>
        <p className="mt-3 max-w-md text-muted-foreground">
          Your recommendation for {studentName} has been submitted successfully.
          The admissions team at JETS School appreciates your time and thoughtful
          feedback.
        </p>
        <p className="mt-6 text-sm text-muted-foreground">
          You may now close this page.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Intro */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-[#A30018]">
          Confidential Recommendation Form
        </h2>
        <p className="mt-2 text-sm text-gray-600 leading-relaxed">
          Dear {refereeName}, you have been listed as a reference for{" "}
          <strong className="text-gray-900">{studentName}</strong>&apos;s
          application to JETS School. This recommendation was requested by{" "}
          <strong className="text-gray-900">{parentName}</strong>.
        </p>
        <div className="mt-4 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
          <p className="text-xs text-amber-800">
            Your recommendation is confidential and will only be reviewed by the
            JETS admissions team.
          </p>
        </div>
      </div>

      {/* Global Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ============ Section 1: Recommender Info ============ */}
      <div className="rounded-xl border bg-white p-6 shadow-sm space-y-5">
        <h3 className="text-lg font-semibold text-gray-900">
          Section 1: Your Information
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="recommenderName">
              Your Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="recommenderName"
              value={recommenderName}
              onChange={(e) => setRecommenderName(e.target.value)}
              placeholder="Full name"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="recommenderEmail">
              Your Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="recommenderEmail"
              type="email"
              value={recommenderEmail}
              onChange={(e) => setRecommenderEmail(e.target.value)}
              placeholder="email@example.com"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="recommenderPhone">
            Your Phone Number <span className="text-red-500">*</span>
          </Label>
          <Input
            id="recommenderPhone"
            type="tel"
            value={recommenderPhone}
            onChange={(e) => setRecommenderPhone(e.target.value)}
            placeholder="(555) 123-4567"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="knownDuration">
            How long and in what capacity have you known the applicant?{" "}
            <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="knownDuration"
            value={knownDuration}
            onChange={(e) => setKnownDuration(e.target.value)}
            placeholder="e.g., I have known the applicant for 3 years as his teacher at..."
            rows={3}
            required
          />
        </div>
      </div>

      {/* ============ Section 2: Student Assessment Scale ============ */}
      <div className="rounded-xl border bg-white p-6 shadow-sm space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Section 2: Student Assessment
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Please rate the applicant on a scale of 1&ndash;5 (1 = lowest, 5 = highest)
          </p>
        </div>

        {ratingCategories.map((category, idx) => (
          <div key={category.key} className="space-y-3">
            <p className="text-sm font-medium text-gray-900">
              {idx + 1}. {category.label}
            </p>

            {/* Rating scale row */}
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="text-xs text-gray-400 w-12 text-right shrink-0">
                Low
              </span>
              <div className="flex items-center gap-3 sm:gap-4">
                {["1", "2", "3", "4", "5"].map((val) => {
                  const isSelected = ratings[category.key]?.rating === val;
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setRatingValue(category.key, val)}
                      className={`flex size-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all ${
                        isSelected
                          ? "border-[#A30018] bg-[#A30018] text-white shadow-sm"
                          : "border-gray-300 bg-white text-gray-600 hover:border-[#A30018]/50 hover:text-[#A30018]"
                      }`}
                      aria-label={`Rate ${category.label} ${val} out of 5`}
                    >
                      {val}
                    </button>
                  );
                })}
              </div>
              <span className="text-xs text-gray-400 w-12 shrink-0">High</span>
            </div>

            {/* Optional comments */}
            <Textarea
              value={ratings[category.key]?.comments || ""}
              onChange={(e) => setRatingComments(category.key, e.target.value)}
              placeholder="Comments (optional)"
              rows={2}
              className="text-sm"
            />

            {idx < ratingCategories.length - 1 && (
              <hr className="border-gray-100" />
            )}
          </div>
        ))}
      </div>

      {/* ============ Section 3: Student Questions ============ */}
      <div className="rounded-xl border bg-white p-6 shadow-sm space-y-5">
        <h3 className="text-lg font-semibold text-gray-900">
          Section 3: About the Student
        </h3>

        <div className="space-y-1.5">
          <Label htmlFor="strengthsAndWeaknesses">
            1. Your observations of the student&apos;s strengths and weaknesses{" "}
            <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="strengthsAndWeaknesses"
            value={strengthsAndWeaknesses}
            onChange={(e) => setStrengthsAndWeaknesses(e.target.value)}
            rows={4}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="specialNeeds">
            2. Does this student have any special physical or emotional needs?{" "}
            <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="specialNeeds"
            value={specialNeeds}
            onChange={(e) => setSpecialNeeds(e.target.value)}
            rows={3}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="socialSkills">
            3. Your observations of the student&apos;s social skills{" "}
            <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="socialSkills"
            value={socialSkills}
            onChange={(e) => setSocialSkills(e.target.value)}
            rows={3}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="academicSkills">
            4. Your observations of the student&apos;s academic skills{" "}
            <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="academicSkills"
            value={academicSkills}
            onChange={(e) => setAcademicSkills(e.target.value)}
            rows={3}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="disciplineIssues">
            5. Has the applicant had any discipline issues in the last 3 years,
            including fighting, misbehavior, being suspended or expelled?{" "}
            <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="disciplineIssues"
            value={disciplineIssues}
            onChange={(e) => setDisciplineIssues(e.target.value)}
            rows={3}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="additionalComments">
            6. Additional comments (optional)
          </Label>
          <Textarea
            id="additionalComments"
            value={additionalComments}
            onChange={(e) => setAdditionalComments(e.target.value)}
            placeholder="Any additional information you would like to share with the admissions team"
            rows={3}
          />
        </div>
      </div>

      {/* ============ Section 4: Overall Recommendation ============ */}
      <div className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Section 4: Overall Recommendation
        </h3>
        <p className="text-sm text-gray-500">
          Please select one of the following. <span className="text-red-500">*</span>
        </p>

        <div className="space-y-3">
          {overallRecommendationOptions.map((option) => {
            const isSelected = overallRecommendation === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => setOverallRecommendation(option)}
                className={`w-full text-left rounded-lg border-2 px-4 py-3 text-sm transition-all ${
                  isSelected
                    ? "border-[#A30018] bg-[#A30018]/5 text-[#A30018] font-medium"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                }`}
              >
                <span className="flex items-center gap-3">
                  <span
                    className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 ${
                      isSelected
                        ? "border-[#A30018] bg-[#A30018]"
                        : "border-gray-300 bg-white"
                    }`}
                  >
                    {isSelected && (
                      <span className="size-2 rounded-full bg-white" />
                    )}
                  </span>
                  {option}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end pt-2 pb-8">
        <Button
          type="submit"
          size="lg"
          disabled={isPending}
          className="bg-[#A30018] hover:bg-[#8a0014] text-white px-8"
        >
          {isPending ? "Submitting..." : "Submit Recommendation"}
        </Button>
      </div>
    </form>
  );
}
