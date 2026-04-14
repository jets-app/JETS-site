"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { submitRecommendation } from "@/server/actions/recommendation.actions";
import {
  ratingScale,
  capacityOptions,
  overallRecommendationOptions,
  ratingCategories,
  type RecommendationResponse,
} from "@/lib/validators/recommendation";

interface RecommendationFormClientProps {
  token: string;
  refereeName: string;
  refereeEmail: string;
  studentName: string;
  parentName: string;
}

export function RecommendationFormClient({
  token,
  refereeName,
  studentName,
  parentName,
}: RecommendationFormClientProps) {
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Form state
  const [knownDuration, setKnownDuration] = useState("");
  const [capacity, setCapacity] = useState("");
  const [ratings, setRatings] = useState<Record<string, string>>({});
  const [greatestStrengths, setGreatestStrengths] = useState("");
  const [areasOfConcern, setAreasOfConcern] = useState("");
  const [overallRecommendation, setOverallRecommendation] = useState("");
  const [additionalComments, setAdditionalComments] = useState("");
  const [signature, setSignature] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const responses: RecommendationResponse = {
      knownDuration,
      capacity: capacity as RecommendationResponse["capacity"],
      characterIntegrity: ratings.characterIntegrity as RecommendationResponse["characterIntegrity"],
      workEthic: ratings.workEthic as RecommendationResponse["workEthic"],
      socialSkills: ratings.socialSkills as RecommendationResponse["socialSkills"],
      emotionalMaturity: ratings.emotionalMaturity as RecommendationResponse["emotionalMaturity"],
      respectForAuthority: ratings.respectForAuthority as RecommendationResponse["respectForAuthority"],
      religiousCommitment: ratings.religiousCommitment as RecommendationResponse["religiousCommitment"],
      greatestStrengths,
      areasOfConcern,
      overallRecommendation: overallRecommendation as RecommendationResponse["overallRecommendation"],
      additionalComments,
      signature,
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
        <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-success/10 text-success">
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Intro Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Confidential Recommendation Form</CardTitle>
          <CardDescription className="mt-1 text-base leading-relaxed">
            Dear {refereeName}, you have been listed as a reference for{" "}
            <strong className="text-foreground">{studentName}</strong>&apos;s
            application to JETS School. This recommendation was requested by{" "}
            <strong className="text-foreground">{parentName}</strong>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Your responses are confidential and will not be shared with the
            applicant or their family. Please answer all questions honestly and
            thoroughly. This form should take approximately 5&ndash;10 minutes to
            complete.
          </p>
        </CardContent>
      </Card>

      {/* Global Error */}
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Section 1: Background */}
      <Card>
        <CardHeader>
          <CardTitle>Your Relationship with the Applicant</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="knownDuration">
              How long have you known the applicant?
            </Label>
            <Input
              id="knownDuration"
              placeholder="e.g., 3 years"
              value={knownDuration}
              onChange={(e) => setKnownDuration(e.target.value)}
              required
            />
            {fieldErrors.knownDuration && (
              <p className="text-xs text-destructive">{fieldErrors.knownDuration}</p>
            )}
          </div>

          <div className="space-y-3">
            <Label>In what capacity do you know the applicant?</Label>
            <RadioGroup
              value={capacity}
              onValueChange={(val) => setCapacity(val as string)}
            >
              {capacityOptions.map((option) => (
                <div key={option} className="flex items-center gap-2.5">
                  <RadioGroupItem value={option} />
                  <Label className="font-normal cursor-pointer">{option}</Label>
                </div>
              ))}
            </RadioGroup>
            {fieldErrors.capacity && (
              <p className="text-xs text-destructive">{fieldErrors.capacity}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Ratings */}
      <Card>
        <CardHeader>
          <CardTitle>Applicant Assessment</CardTitle>
          <CardDescription>
            Please rate the applicant in each of the following areas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {ratingCategories.map((category) => (
            <div key={category.key} className="space-y-3">
              <Label className="text-sm font-medium">{category.label}</Label>
              <RadioGroup
                value={ratings[category.key] || ""}
                onValueChange={(val) =>
                  setRatings((prev) => ({
                    ...prev,
                    [category.key]: val as string,
                  }))
                }
                className="flex flex-wrap gap-x-4 gap-y-2"
              >
                {ratingScale.map((rating) => (
                  <div key={rating} className="flex items-center gap-1.5">
                    <RadioGroupItem value={rating} />
                    <Label className="font-normal text-xs sm:text-sm cursor-pointer whitespace-nowrap">
                      {rating}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              {fieldErrors[category.key] && (
                <p className="text-xs text-destructive">
                  {fieldErrors[category.key]}
                </p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Section 3: Written Responses */}
      <Card>
        <CardHeader>
          <CardTitle>Written Responses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="greatestStrengths">
              Describe the applicant&apos;s greatest strengths
            </Label>
            <Textarea
              id="greatestStrengths"
              placeholder="What qualities, skills, or characteristics stand out about this applicant?"
              value={greatestStrengths}
              onChange={(e) => setGreatestStrengths(e.target.value)}
              rows={4}
              required
            />
            {fieldErrors.greatestStrengths && (
              <p className="text-xs text-destructive">
                {fieldErrors.greatestStrengths}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="areasOfConcern">
              Are there any areas of concern?
            </Label>
            <Textarea
              id="areasOfConcern"
              placeholder="Optional — share any concerns you may have about the applicant"
              value={areasOfConcern}
              onChange={(e) => setAreasOfConcern(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Section 4: Overall Recommendation */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Recommendation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-3">
            <Label>
              Would you recommend this applicant for JETS School?
            </Label>
            <RadioGroup
              value={overallRecommendation}
              onValueChange={(val) =>
                setOverallRecommendation(val as string)
              }
            >
              {overallRecommendationOptions.map((option) => (
                <div key={option} className="flex items-center gap-2.5">
                  <RadioGroupItem value={option} />
                  <Label className="font-normal cursor-pointer">{option}</Label>
                </div>
              ))}
            </RadioGroup>
            {fieldErrors.overallRecommendation && (
              <p className="text-xs text-destructive">
                {fieldErrors.overallRecommendation}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="additionalComments">
              Additional comments (optional)
            </Label>
            <Textarea
              id="additionalComments"
              placeholder="Any additional information you would like to share with the admissions team"
              value={additionalComments}
              onChange={(e) => setAdditionalComments(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Section 5: Signature */}
      <Card>
        <CardHeader>
          <CardTitle>Signature</CardTitle>
          <CardDescription>
            By typing your name below, you certify that the information provided
            is accurate and reflects your honest assessment of the applicant.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label htmlFor="signature">Type your full name as signature</Label>
          <Input
            id="signature"
            placeholder="Your full name"
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            className="font-serif italic text-base"
            required
          />
          {fieldErrors.signature && (
            <p className="text-xs text-destructive">{fieldErrors.signature}</p>
          )}
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex justify-end pt-2 pb-8">
        <Button type="submit" size="lg" disabled={isPending}>
          {isPending ? "Submitting..." : "Submit Recommendation"}
        </Button>
      </div>
    </form>
  );
}
