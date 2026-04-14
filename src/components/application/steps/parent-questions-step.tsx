"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  parentQuestionsSchema,
  type ParentQuestionsData,
} from "@/lib/validators/application";
import { useApplicationFormStore } from "@/stores/application-form.store";
import { updateApplicationStep } from "@/server/actions/application.actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import React from "react";

interface StepProps {
  applicationId: string;
  readOnly?: boolean;
  formRef?: React.RefObject<HTMLFormElement | null>;
  onSaved?: () => void;
}

export function ParentQuestionsStep({
  applicationId,
  readOnly,
  formRef,
  onSaved,
}: StepProps) {
  const store = useApplicationFormStore();
  const existing = store.formData.parentQuestions as ParentQuestionsData | undefined;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<ParentQuestionsData>({
    resolver: zodResolver(parentQuestionsSchema),
    defaultValues: {
      timeElapsed: existing?.timeElapsed ?? false,
      timeElapsedDetails: existing?.timeElapsedDetails ?? "",
      lastTwoSummers: existing?.lastTwoSummers ?? "",
      learningStrengths: existing?.learningStrengths ?? "",
      socialStrengths: existing?.socialStrengths ?? "",
      midosTovos: existing?.midosTovos ?? "",
      specialLearningNeeds: existing?.specialLearningNeeds ?? false,
      specialLearningNeedsDetails: existing?.specialLearningNeedsDetails ?? "",
      physicalEmotionalNeeds: existing?.physicalEmotionalNeeds ?? false,
      physicalEmotionalNeedsDetails:
        existing?.physicalEmotionalNeedsDetails ?? "",
      counselingHistory: existing?.counselingHistory ?? false,
      counselingHistoryDetails: existing?.counselingHistoryDetails ?? "",
      maturityAssessment: existing?.maturityAssessment ?? "",
    },
  });

  const timeElapsed = watch("timeElapsed");
  const specialLearningNeeds = watch("specialLearningNeeds");
  const physicalEmotionalNeeds = watch("physicalEmotionalNeeds");
  const counselingHistory = watch("counselingHistory");

  const onSubmit = async (data: ParentQuestionsData) => {
    store.setIsSaving(true);
    const result = await updateApplicationStep(applicationId, 6, data);
    store.setIsSaving(false);

    if (result.success) {
      store.setStepData("parentQuestions", data);
      store.markStepComplete(6);
      store.setIsDirty(false);
      reset(data);
      onSaved?.();
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">Parent Questions</h2>
        <p className="text-sm text-muted-foreground">
          Help us understand your child&apos;s background and needs better.
        </p>
      </div>

      {/* Time Elapsed */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={timeElapsed}
            onCheckedChange={(checked: boolean) =>
              setValue("timeElapsed", checked, { shouldDirty: true })
            }
            disabled={readOnly}
          />
          <Label className="text-base">
            Has time elapsed since the applicant was last in school?
          </Label>
        </div>
        {timeElapsed && (
          <div className="pl-7 animate-slide-up">
            <Textarea
              placeholder="Please explain the gap and what the applicant has been doing..."
              {...register("timeElapsedDetails")}
              disabled={readOnly}
            />
          </div>
        )}
      </div>

      {/* Last Two Summers */}
      <div className="space-y-2">
        <Label>What did the applicant do the last two summers?</Label>
        <Textarea
          placeholder="Camps, programs, work, travel, etc."
          {...register("lastTwoSummers")}
          disabled={readOnly}
        />
      </div>

      {/* Learning Strengths */}
      <div className="space-y-2">
        <Label>Learning Strengths &amp; Limitations</Label>
        <Textarea
          placeholder="Describe the applicant's academic strengths and any limitations..."
          {...register("learningStrengths")}
          disabled={readOnly}
        />
      </div>

      {/* Social Strengths */}
      <div className="space-y-2">
        <Label>Social Strengths &amp; Limitations</Label>
        <Textarea
          placeholder="Describe the applicant's social skills, friendships, and any challenges..."
          {...register("socialStrengths")}
          disabled={readOnly}
        />
      </div>

      {/* Midos Tovos */}
      <div className="space-y-2">
        <Label>Midos Tovos (Good Character Traits)</Label>
        <Textarea
          placeholder="What positive character traits does the applicant exhibit?"
          {...register("midosTovos")}
          disabled={readOnly}
        />
      </div>

      {/* Special Learning Needs */}
      <div className="border-t pt-6 space-y-3">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={specialLearningNeeds}
            onCheckedChange={(checked: boolean) =>
              setValue("specialLearningNeeds", checked, { shouldDirty: true })
            }
            disabled={readOnly}
          />
          <Label className="text-base">
            Does the applicant have any special learning needs?
          </Label>
        </div>
        {specialLearningNeeds && (
          <div className="pl-7 animate-slide-up">
            <Textarea
              placeholder="Please elaborate on the learning needs, diagnoses, IEP/504 plans, etc."
              {...register("specialLearningNeedsDetails")}
              disabled={readOnly}
            />
          </div>
        )}
      </div>

      {/* Physical / Emotional Needs */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={physicalEmotionalNeeds}
            onCheckedChange={(checked: boolean) =>
              setValue("physicalEmotionalNeeds", checked, { shouldDirty: true })
            }
            disabled={readOnly}
          />
          <Label className="text-base">
            Does the applicant have physical or emotional needs we should know about?
          </Label>
        </div>
        {physicalEmotionalNeeds && (
          <div className="pl-7 animate-slide-up">
            <Textarea
              placeholder="Please elaborate on the physical or emotional needs..."
              {...register("physicalEmotionalNeedsDetails")}
              disabled={readOnly}
            />
          </div>
        )}
      </div>

      {/* Counseling */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={counselingHistory}
            onCheckedChange={(checked: boolean) =>
              setValue("counselingHistory", checked, { shouldDirty: true })
            }
            disabled={readOnly}
          />
          <Label className="text-base">
            Has the applicant received counseling or therapy?
          </Label>
        </div>
        {counselingHistory && (
          <div className="pl-7 animate-slide-up">
            <Textarea
              placeholder="Please describe the type and reason for counseling..."
              {...register("counselingHistoryDetails")}
              disabled={readOnly}
            />
          </div>
        )}
      </div>

      {/* Maturity Assessment */}
      <div className="border-t pt-6 space-y-2">
        <Label>Maturity Assessment (for younger applicants)</Label>
        <Textarea
          placeholder="How would you assess the applicant's maturity level for their age?"
          {...register("maturityAssessment")}
          disabled={readOnly}
        />
      </div>

    </form>
  );
}
