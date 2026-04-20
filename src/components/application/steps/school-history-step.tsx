"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  schoolHistorySchema,
  type SchoolHistoryData,
} from "@/lib/validators/application";
import { useApplicationFormStore } from "@/stores/application-form.store";
import { updateApplicationStep } from "@/server/actions/application.actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import React from "react";

interface StepProps {
  applicationId: string;
  readOnly?: boolean;
  formRef?: React.RefObject<HTMLFormElement | null>;
  onSaved?: () => void;
}

export function SchoolHistoryStep({
  applicationId,
  readOnly,
  formRef,
  onSaved,
}: StepProps) {
  const store = useApplicationFormStore();
  const existing = store.formData.schoolHistory as SchoolHistoryData | undefined;

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<SchoolHistoryData>({
    resolver: zodResolver(schoolHistorySchema),
    defaultValues: {
      wasInSchool: existing?.wasInSchool ?? undefined,
      notInSchoolExplanation: existing?.notInSchoolExplanation ?? "",
      lastSchoolName: existing?.lastSchoolName ?? "",
      principal: existing?.principal ?? { name: "", phone: "", email: "" },
      teacher: existing?.teacher ?? { name: "", phone: "", email: "" },
      previousSchools: existing?.previousSchools ?? "",
      relatableContacts: existing?.relatableContacts ?? [
        { name: "", phone: "", email: "", role: "" },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "relatableContacts",
  });

  const wasInSchool = watch("wasInSchool");

  const onSubmit = async (data: SchoolHistoryData) => {
    store.setIsSaving(true);
    const result = await updateApplicationStep(applicationId, 5, data);
    store.setIsSaving(false);

    if (result.success) {
      store.setStepData("schoolHistory", data);
      store.markStepComplete(5);
      store.setIsDirty(false);
      reset(data);
      onSaved?.();
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="step-form space-y-8">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">School History</h2>
        <p className="text-sm text-muted-foreground">
          Please provide information about the applicant&apos;s most recent schooling.
        </p>
      </div>

      {/* Were you in school? */}
      <div className="space-y-3">
        <Label className="text-base">
          Were you enrolled in school during the past two years? <span className="text-destructive">*</span>
        </Label>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="yes"
              checked={wasInSchool === "yes"}
              onChange={() => setValue("wasInSchool", "yes", { shouldDirty: true })}
              disabled={readOnly}
              className="accent-primary"
            />
            <span className="text-sm">Yes</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="no"
              checked={wasInSchool === "no"}
              onChange={() => setValue("wasInSchool", "no", { shouldDirty: true })}
              disabled={readOnly}
              className="accent-primary"
            />
            <span className="text-sm">No</span>
          </label>
        </div>
        {errors.wasInSchool && (
          <p className="text-xs text-destructive">{errors.wasInSchool.message}</p>
        )}
      </div>

      {/* If NO — show explanation */}
      {wasInSchool === "no" && (
        <div className="space-y-2 animate-slide-up">
          <Label>
            Please explain what you were doing during this time <span className="text-destructive">*</span>
          </Label>
          <Textarea
            placeholder="Describe what you were doing instead of attending school..."
            {...register("notInSchoolExplanation")}
            aria-invalid={!!errors.notInSchoolExplanation}
            disabled={readOnly}
          />
          {errors.notInSchoolExplanation && (
            <p className="text-xs text-destructive">{errors.notInSchoolExplanation.message}</p>
          )}
        </div>
      )}

      {/* If YES — show school details */}
      {wasInSchool === "yes" && (
        <div className="space-y-8 animate-slide-up">
          {/* Last School */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="lastSchoolName">
                Last School Attended <span className="text-destructive">*</span>
              </Label>
              <Input
                id="lastSchoolName"
                placeholder="Name of school"
                {...register("lastSchoolName")}
                aria-invalid={!!errors.lastSchoolName}
                disabled={readOnly}
              />
              {errors.lastSchoolName && (
                <p className="text-xs text-destructive">{errors.lastSchoolName.message}</p>
              )}
            </div>
          </div>

          {/* Principal */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Principal / Head of School
            </h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Name <span className="text-destructive">*</span></Label>
                <Input
                  {...register("principal.name")}
                  aria-invalid={!!(errors as Record<string, unknown>)?.["principal"]?.["name" as keyof typeof errors.principal]}
                  disabled={readOnly}
                />
                {(errors as Record<string, Record<string, { message?: string }>>)?.principal?.name && (
                  <p className="text-xs text-destructive">
                    {(errors as Record<string, Record<string, { message?: string }>>).principal.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input type="tel" {...register("principal.phone")} disabled={readOnly} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" {...register("principal.email")} disabled={readOnly} />
              </div>
            </div>
          </div>

          {/* Teacher */}
          <div className="border-t pt-6 space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Teacher / Rebbi
            </h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Name <span className="text-destructive">*</span></Label>
                <Input
                  {...register("teacher.name")}
                  disabled={readOnly}
                />
                {(errors as Record<string, Record<string, { message?: string }>>)?.teacher?.name && (
                  <p className="text-xs text-destructive">
                    {(errors as Record<string, Record<string, { message?: string }>>).teacher.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input type="tel" {...register("teacher.phone")} disabled={readOnly} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" {...register("teacher.email")} disabled={readOnly} />
              </div>
            </div>
          </div>

          {/* Previous Schools */}
          <div className="border-t pt-6 space-y-4">
            <div className="space-y-2">
              <Label>
                Previous Schools (Past 2 Years) <span className="text-destructive">*</span>
              </Label>
              <Textarea
                placeholder="List schools attended in the past 2 years, one per line"
                {...register("previousSchools")}
                aria-invalid={!!errors.previousSchools}
                disabled={readOnly}
              />
              {errors.previousSchools && (
                <p className="text-xs text-destructive">{errors.previousSchools.message}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Relatable Contacts — always shown */}
      <div className="border-t pt-6 space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Relatable Contacts
        </h3>
        <p className="text-sm text-muted-foreground">
          Rabbis, teachers, or mashpi&apos;im who know the applicant well.
        </p>

        {fields.map((field, index) => (
          <div
            key={field.id}
            className="grid sm:grid-cols-5 gap-3 items-end p-4 rounded-lg bg-muted/50"
          >
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                {...register(`relatableContacts.${index}.name`)}
                disabled={readOnly}
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Input
                placeholder="Rabbi, Teacher, etc."
                {...register(`relatableContacts.${index}.role`)}
                disabled={readOnly}
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                type="tel"
                {...register(`relatableContacts.${index}.phone`)}
                disabled={readOnly}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                {...register(`relatableContacts.${index}.email`)}
                disabled={readOnly}
              />
            </div>
            {!readOnly && fields.length > 1 && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => remove(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}

        {!readOnly && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              append({ name: "", phone: "", email: "", role: "" })
            }
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add Contact
          </Button>
        )}
      </div>

    </form>
  );
}
