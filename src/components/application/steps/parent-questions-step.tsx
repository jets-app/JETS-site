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
      maturityAssessment: existing?.maturityAssessment ?? {
        handlesFrustration: "",
        dailyResponsibilities: "",
        authorityInteraction: "",
        independenceReadiness: "",
      },
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
    <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="step-form space-y-8">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">Parent Questions</h2>
        <p className="text-sm text-muted-foreground">
          Help us understand your child&apos;s background and needs better.
        </p>
      </div>

      {Object.keys(errors).length > 0 && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
          <p className="text-sm font-medium text-destructive">
            Please fix {Object.keys(errors).length} required field{Object.keys(errors).length > 1 ? "s" : ""} below (highlighted in red)
          </p>
        </div>
      )}

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
        <Label>What did the applicant do the last two summers? <span className="text-destructive">*</span></Label>
        <Textarea
          placeholder="Camps, programs, work, travel, etc."
          {...register("lastTwoSummers")}
          aria-invalid={!!errors.lastTwoSummers}
          disabled={readOnly}
        />
        {errors.lastTwoSummers && (
          <p className="text-xs text-destructive">{errors.lastTwoSummers.message}</p>
        )}
      </div>

      {/* Learning Strengths */}
      <div className="space-y-2">
        <Label>Learning Strengths &amp; Limitations <span className="text-destructive">*</span></Label>
        <Textarea
          placeholder="Describe the applicant's academic strengths and any limitations..."
          {...register("learningStrengths")}
          aria-invalid={!!errors.learningStrengths}
          disabled={readOnly}
        />
        {errors.learningStrengths && (
          <p className="text-xs text-destructive">{errors.learningStrengths.message}</p>
        )}
      </div>

      {/* Social Strengths */}
      <div className="space-y-2">
        <Label>Social Strengths &amp; Limitations <span className="text-destructive">*</span></Label>
        <Textarea
          placeholder="Describe the applicant's social skills, friendships, and any challenges..."
          {...register("socialStrengths")}
          aria-invalid={!!errors.socialStrengths}
          disabled={readOnly}
        />
        {errors.socialStrengths && (
          <p className="text-xs text-destructive">{errors.socialStrengths.message}</p>
        )}
      </div>

      {/* Midos Tovos */}
      <div className="space-y-2">
        <Label>Midos Tovos (Good Character Traits) <span className="text-destructive">*</span></Label>
        <Textarea
          placeholder="What positive character traits does the applicant exhibit?"
          {...register("midosTovos")}
          aria-invalid={!!errors.midosTovos}
          disabled={readOnly}
        />
        {errors.midosTovos && (
          <p className="text-xs text-destructive">{errors.midosTovos.message}</p>
        )}
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
      <div className="border-t pt-6 space-y-6">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Maturity Assessment
        </h3>

        <div className="space-y-2">
          <Label>
            How does your son handle frustration or setbacks? <span className="text-destructive">*</span>
          </Label>
          <p className="text-xs text-muted-foreground">
            For example, when things don&apos;t go his way, how does he typically respond?
          </p>
          <Textarea
            placeholder="Describe how he handles frustration..."
            {...register("maturityAssessment.handlesFrustration")}
            aria-invalid={!!errors.maturityAssessment?.handlesFrustration}
            disabled={readOnly}
          />
          {errors.maturityAssessment?.handlesFrustration && (
            <p className="text-xs text-destructive">{errors.maturityAssessment.handlesFrustration.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>
            How does your son manage his daily responsibilities without being reminded? <span className="text-destructive">*</span>
          </Label>
          <p className="text-xs text-muted-foreground">
            Consider things like waking up on time, keeping his space clean, completing tasks.
          </p>
          <Textarea
            placeholder="Describe how he manages daily responsibilities..."
            {...register("maturityAssessment.dailyResponsibilities")}
            aria-invalid={!!errors.maturityAssessment?.dailyResponsibilities}
            disabled={readOnly}
          />
          {errors.maturityAssessment?.dailyResponsibilities && (
            <p className="text-xs text-destructive">{errors.maturityAssessment.dailyResponsibilities.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>
            How does your son interact with authority figures such as teachers or rabbeim? <span className="text-destructive">*</span>
          </Label>
          <p className="text-xs text-muted-foreground">
            Is he respectful, does he push back, does he ask questions appropriately?
          </p>
          <Textarea
            placeholder="Describe how he interacts with authority figures..."
            {...register("maturityAssessment.authorityInteraction")}
            aria-invalid={!!errors.maturityAssessment?.authorityInteraction}
            disabled={readOnly}
          />
          {errors.maturityAssessment?.authorityInteraction && (
            <p className="text-xs text-destructive">{errors.maturityAssessment.authorityInteraction.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>
            How would you describe your son&apos;s readiness to live independently in a yeshiva environment? <span className="text-destructive">*</span>
          </Label>
          <p className="text-xs text-muted-foreground">
            Consider factors like being away from home, managing his own schedule, and social dynamics.
          </p>
          <Textarea
            placeholder="Describe his readiness for independent living..."
            {...register("maturityAssessment.independenceReadiness")}
            aria-invalid={!!errors.maturityAssessment?.independenceReadiness}
            disabled={readOnly}
          />
          {errors.maturityAssessment?.independenceReadiness && (
            <p className="text-xs text-destructive">{errors.maturityAssessment.independenceReadiness.message}</p>
          )}
        </div>
      </div>

    </form>
  );
}
