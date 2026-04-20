"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  essayAdditionalSchema,
  type EssayAdditionalData,
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

export function EssayAdditionalStep({
  applicationId,
  readOnly,
  formRef,
  onSaved,
}: StepProps) {
  const store = useApplicationFormStore();
  const existing = store.formData.essayAdditional;

  const schoolHistory = store.formData.schoolHistory;
  const wasInSchool = schoolHistory?.wasInSchool ?? undefined;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<EssayAdditionalData>({
    resolver: zodResolver(essayAdditionalSchema),
    defaultValues: {
      essay: existing?.essay ?? "",
      gedInterest: existing?.gedInterest ?? false,
      wasInSchool: existing?.wasInSchool ?? wasInSchool,
      gemarahMaterial: existing?.gemarahMaterial ?? "",
      chassidusMaterial: existing?.chassidusMaterial ?? "",
      halachaMaterial: existing?.halachaMaterial ?? "",
      otherFactors: existing?.otherFactors ?? "",
    },
  });

  const gedInterest = watch("gedInterest");

  // Sync wasInSchool from school history step into the form
  React.useEffect(() => {
    if (wasInSchool) {
      setValue("wasInSchool", wasInSchool);
    }
  }, [wasInSchool, setValue]);

  const onSubmit = async (data: EssayAdditionalData) => {
    // Ensure wasInSchool is current from store
    data.wasInSchool = wasInSchool;
    store.setIsSaving(true);
    const result = await updateApplicationStep(applicationId, 9, data);
    store.setIsSaving(false);

    if (result.success) {
      store.setStepData("essayAdditional", data);
      store.markStepComplete(9);
      store.setIsDirty(false);
      reset(data);
      onSaved?.();
    }
  };

  const essayValue = watch("essay") ?? "";

  return (
    <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="step-form space-y-8">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">Essay &amp; Additional Information</h2>
        <p className="text-sm text-muted-foreground">
          This is your opportunity to share your story and aspirations.
        </p>
      </div>

      {Object.keys(errors).length > 0 && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
          <p className="text-sm font-medium text-destructive">
            Please fix {Object.keys(errors).length} required field{Object.keys(errors).length > 1 ? "s" : ""} below (highlighted in red)
          </p>
        </div>
      )}

      {/* Essay */}
      <div className="space-y-3">
        <Label htmlFor="essay" className="text-base">
          Personal Essay <span className="text-destructive">*</span>
        </Label>
        <p className="text-sm text-muted-foreground">
          Please write an essay describing why you want to join our Yeshiva.
          Feel free to include accomplishments. What are your goals, religiously
          and academically?
        </p>
        <Textarea
          id="essay"
          {...register("essay")}
          placeholder="Write your essay here..."
          aria-invalid={!!errors.essay}
          disabled={readOnly}
          className="min-h-48"
        />
        <div className="flex items-center justify-between">
          {errors.essay && (
            <p className="text-xs text-destructive">{errors.essay.message}</p>
          )}
          <p className="text-xs text-muted-foreground ml-auto">
            {essayValue.length} characters
          </p>
        </div>
      </div>

      {/* GED Interest */}
      <div className="border-t pt-6 space-y-3">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={gedInterest}
            onCheckedChange={(checked: boolean) =>
              setValue("gedInterest", checked, { shouldDirty: true })
            }
            disabled={readOnly}
          />
          <Label className="text-base">
            Are you interested in earning a GED?
          </Label>
        </div>
      </div>

      {/* Study Materials */}
      <div className="border-t pt-6 space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Material Studied Last Year
          {wasInSchool === "yes" && <span className="text-destructive"> *</span>}
        </h3>
        {wasInSchool === "yes" && (
          <p className="text-sm text-muted-foreground">
            Since you were enrolled in school, please fill in the material you studied.
          </p>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>
              Gemarah Material
              {wasInSchool === "yes" && <span className="text-destructive"> *</span>}
            </Label>
            <Input
              placeholder="Masechta, perek, etc."
              {...register("gemarahMaterial")}
              aria-invalid={!!errors.gemarahMaterial}
              disabled={readOnly}
            />
            {errors.gemarahMaterial && (
              <p className="text-xs text-destructive">{errors.gemarahMaterial.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>
              Chassidus Material
              {wasInSchool === "yes" && <span className="text-destructive"> *</span>}
            </Label>
            <Input
              placeholder="Maamarim, Hemshechim, etc."
              {...register("chassidusMaterial")}
              aria-invalid={!!errors.chassidusMaterial}
              disabled={readOnly}
            />
            {errors.chassidusMaterial && (
              <p className="text-xs text-destructive">{errors.chassidusMaterial.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>
              Halacha Material
              {wasInSchool === "yes" && <span className="text-destructive"> *</span>}
            </Label>
            <Input
              placeholder="Topics or seforim studied"
              {...register("halachaMaterial")}
              aria-invalid={!!errors.halachaMaterial}
              disabled={readOnly}
            />
            {errors.halachaMaterial && (
              <p className="text-xs text-destructive">{errors.halachaMaterial.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Other Factors */}
      <div className="border-t pt-6 space-y-2">
        <Label>Other Factors</Label>
        <Textarea
          placeholder="Anything else you would like us to know about the applicant?"
          {...register("otherFactors")}
          disabled={readOnly}
        />
      </div>

    </form>
  );
}
