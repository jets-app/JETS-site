"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  applicantAssessmentSchema,
  ratingValues,
  type ApplicantAssessmentData,
} from "@/lib/validators/application";
import { useApplicationFormStore } from "@/stores/application-form.store";
import { updateApplicationStep } from "@/server/actions/application.actions";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import React from "react";
import { cn } from "@/lib/utils";

interface StepProps {
  applicationId: string;
  readOnly?: boolean;
  formRef?: React.RefObject<HTMLFormElement | null>;
  onSaved?: () => void;
}

const ASSESSMENT_FIELDS = [
  { key: "yirasShamayim" as const, label: "Yiras Shamayim (Fear of Heaven)" },
  { key: "honestyEthics" as const, label: "Honesty & Ethics" },
  { key: "workHabits" as const, label: "Work Habits" },
  { key: "socialInteractions" as const, label: "Social Interactions" },
  { key: "angerIssues" as const, label: "Anger Issues / Emotional Regulation" },
  { key: "maturityLevel" as const, label: "Maturity Level" },
];

export function ApplicantAssessmentStep({
  applicationId,
  readOnly,
  formRef,
  onSaved,
}: StepProps) {
  const store = useApplicationFormStore();
  const existing = store.formData.applicantAssessment as
    | ApplicantAssessmentData
    | undefined;

  const defaultItem = { rating: "", comments: "" };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<ApplicantAssessmentData>({
    resolver: zodResolver(applicantAssessmentSchema),
    defaultValues: {
      yirasShamayim: existing?.yirasShamayim ?? { ...defaultItem },
      honestyEthics: existing?.honestyEthics ?? { ...defaultItem },
      workHabits: existing?.workHabits ?? { ...defaultItem },
      socialInteractions: existing?.socialInteractions ?? { ...defaultItem },
      angerIssues: existing?.angerIssues ?? { ...defaultItem },
      maturityLevel: existing?.maturityLevel ?? { ...defaultItem },
    },
  });

  const onSubmit = async (data: ApplicantAssessmentData) => {
    store.setIsSaving(true);
    const result = await updateApplicationStep(applicationId, 7, data);
    store.setIsSaving(false);

    if (result.success) {
      store.setStepData("applicantAssessment", data);
      store.markStepComplete(7);
      store.setIsDirty(false);
      reset(data);
      onSaved?.();
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="step-form space-y-8">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">Applicant Assessment</h2>
        <p className="text-sm text-muted-foreground">
          Please rate the applicant in the following areas. Be honest — this
          helps us provide the right support.
        </p>
      </div>

      {Object.keys(errors).length > 0 && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
          <p className="text-sm font-medium text-destructive">
            Please fix {Object.keys(errors).length} required field{Object.keys(errors).length > 1 ? "s" : ""} below (highlighted in red)
          </p>
        </div>
      )}

      {/* Rating scale header */}
      <div className="rounded-lg border overflow-hidden">
        <div className="hidden sm:grid sm:grid-cols-[1fr_repeat(5,minmax(0,1fr))] items-center gap-0 bg-muted/50 border-b px-4 py-2.5">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category</div>
          {ratingValues.map((rating) => (
            <div key={rating} className="text-xs font-semibold text-muted-foreground text-center uppercase tracking-wider">
              {rating}
            </div>
          ))}
        </div>

        <div className="divide-y">
          {ASSESSMENT_FIELDS.map((field) => {
            const currentRating = watch(`${field.key}.rating`);
            return (
              <div key={field.key} className="p-4 space-y-3">
                <div className="sm:grid sm:grid-cols-[1fr_repeat(5,minmax(0,1fr))] items-center gap-0">
                  <Label className="text-sm font-medium mb-2 sm:mb-0">
                    {field.label} <span className="text-destructive">*</span>
                  </Label>

                  {ratingValues.map((rating) => (
                    <div key={rating} className="hidden sm:flex justify-center">
                      <button
                        type="button"
                        disabled={readOnly}
                        onClick={() =>
                          setValue(`${field.key}.rating`, rating, {
                            shouldDirty: true,
                          })
                        }
                        className={cn(
                          "w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center",
                          currentRating === rating
                            ? "bg-primary border-primary text-white"
                            : "bg-background hover:bg-muted border-border"
                        )}
                      >
                        {currentRating === rating && (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    </div>
                  ))}

                  {/* Mobile: show buttons in a row */}
                  <div className="flex flex-wrap gap-2 sm:hidden mt-2">
                    {ratingValues.map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        disabled={readOnly}
                        onClick={() =>
                          setValue(`${field.key}.rating`, rating, {
                            shouldDirty: true,
                          })
                        }
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                          currentRating === rating
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background hover:bg-muted border-border text-foreground"
                        )}
                      >
                        {rating}
                      </button>
                    ))}
                  </div>
                </div>

                {errors[field.key]?.rating && (
                  <p className="text-xs text-destructive">
                    {errors[field.key]!.rating!.message}
                  </p>
                )}

                <Textarea
                  placeholder="Additional comments (optional)"
                  {...register(`${field.key}.comments`)}
                  disabled={readOnly}
                  className="min-h-12"
                />
              </div>
            );
          })}
        </div>
      </div>

    </form>
  );
}
