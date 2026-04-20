"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  hebrewNameSchema,
  type HebrewNameData,
} from "@/lib/validators/application";
import { useApplicationFormStore } from "@/stores/application-form.store";
import { updateApplicationStep } from "@/server/actions/application.actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React from "react";

interface StepProps {
  applicationId: string;
  readOnly?: boolean;
  formRef?: React.RefObject<HTMLFormElement | null>;
  onSaved?: () => void;
}

export function HebrewNameStep({ applicationId, readOnly, formRef, onSaved }: StepProps) {
  const store = useApplicationFormStore();
  const existing = store.formData.hebrewNames;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<HebrewNameData>({
    resolver: zodResolver(hebrewNameSchema),
    defaultValues: {
      applicantHebrewName: existing?.applicantHebrewName ?? "",
      fatherHebrewName: existing?.fatherHebrewName ?? "",
      motherHebrewName: existing?.motherHebrewName ?? "",
    },
  });

  const onSubmit = async (data: HebrewNameData) => {
    store.setIsSaving(true);
    const result = await updateApplicationStep(applicationId, 2, data);
    store.setIsSaving(false);

    if (result.success) {
      store.setStepData("hebrewNames", data);
      store.markStepComplete(2);
      store.setIsDirty(false);
      reset(data);
      onSaved?.();
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="step-form space-y-8">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">Hebrew Name</h2>
        <p className="text-sm text-muted-foreground">
          These names are used for Torah reading and official Yeshiva records.
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="applicantHebrewName">
            Applicant&apos;s Full Hebrew Name{" "}
            <span className="text-destructive">*</span>
          </Label>
          <Input
            id="applicantHebrewName"
            placeholder="e.g., Moshe Chaim"
            {...register("applicantHebrewName")}
            aria-invalid={!!errors.applicantHebrewName}
            disabled={readOnly}
            className="text-lg"
          />
          {errors.applicantHebrewName && (
            <p className="text-xs text-destructive">
              {errors.applicantHebrewName.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="fatherHebrewName">Father&apos;s Hebrew Name</Label>
          <Input
            id="fatherHebrewName"
            placeholder="e.g., Avraham Yitzchak"
            {...register("fatherHebrewName")}
            disabled={readOnly}
          />
          <p className="text-xs text-muted-foreground">
            Used for aliyos and Torah reading.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="motherHebrewName">Mother&apos;s Hebrew Name</Label>
          <Input
            id="motherHebrewName"
            placeholder="e.g., Sarah Rivka"
            {...register("motherHebrewName")}
            disabled={readOnly}
          />
          <p className="text-xs text-muted-foreground">
            Used for mi sheberach and tefillos.
          </p>
        </div>
      </div>

    </form>
  );
}
