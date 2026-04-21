"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  familyInfoSchema,
  type FamilyInfoData,
} from "@/lib/validators/application";
import { useApplicationFormStore } from "@/stores/application-form.store";
import { updateApplicationStep } from "@/server/actions/application.actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { PhoneInput } from "@/components/forms/phone-input";
import { EmailInput } from "@/components/forms/email-input";
import { Plus, Trash2 } from "lucide-react";
import React from "react";

interface StepProps {
  applicationId: string;
  readOnly?: boolean;
  formRef?: React.RefObject<HTMLFormElement | null>;
  onSaved?: () => void;
}

export function FamilyInfoStep({ applicationId, readOnly, formRef, onSaved }: StepProps) {
  const store = useApplicationFormStore();
  const existing = store.formData.familyInfo;

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<FamilyInfoData>({
    resolver: zodResolver(familyInfoSchema),
    defaultValues: {
      closeToSiblings: existing?.closeToSiblings ?? false,
      siblings: existing?.siblings ?? [],
      grandparentsFather: existing?.grandparentsFather ?? { names: "", email: "" },
      grandparentsMother: existing?.grandparentsMother ?? { names: "", email: "" },
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "siblings",
  });

  const closeToSiblings = watch("closeToSiblings");

  const onSubmit = async (data: FamilyInfoData) => {
    store.setIsSaving(true);
    const result = await updateApplicationStep(applicationId, 4, data);
    store.setIsSaving(false);

    if (result.success) {
      store.setStepData("familyInfo", data);
      store.markStepComplete(4);
      store.setIsDirty(false);
      reset(data);
      onSaved?.();
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="step-form space-y-8">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">Family Information</h2>
        <p className="text-sm text-muted-foreground">
          Tell us about the applicant&apos;s siblings and grandparents.
        </p>
      </div>

      {Object.keys(errors).length > 0 && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
          <p className="text-sm font-medium text-destructive">
            Please fix {Object.keys(errors).length} required field{Object.keys(errors).length > 1 ? "s" : ""} below (highlighted in red)
          </p>
        </div>
      )}

      {/* Siblings */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={closeToSiblings}
            onCheckedChange={(checked: boolean) =>
              setValue("closeToSiblings", checked, { shouldDirty: true })
            }
            disabled={readOnly}
          />
          <Label className="text-base">
            Is the applicant close to older siblings?
          </Label>
        </div>

        {closeToSiblings && (
          <div className="pl-7 space-y-4 animate-slide-up">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid sm:grid-cols-5 gap-3 items-end p-4 rounded-lg bg-muted/50"
              >
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    {...register(`siblings.${index}.name`)}
                    disabled={readOnly}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Age</Label>
                  <Input
                    {...register(`siblings.${index}.age`)}
                    disabled={readOnly}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <PhoneInput
                    {...register(`siblings.${index}.phone`)}
                    disabled={readOnly}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <EmailInput
                    {...register(`siblings.${index}.email`)}
                    disabled={readOnly}
                  />
                </div>
                {!readOnly && (
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
                  append({ name: "", age: "", phone: "", email: "" })
                }
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Add Sibling
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Grandparents */}
      <div className="border-t pt-6 space-y-6">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Grandparents <span className="text-destructive">*</span>
        </h3>

        <GrandparentsSection
          side="father"
          label="Father's Side"
          register={register}
          watch={watch}
          setValue={setValue}
          errors={errors}
          readOnly={readOnly}
        />

        <GrandparentsSection
          side="mother"
          label="Mother's Side"
          register={register}
          watch={watch}
          setValue={setValue}
          errors={errors}
          readOnly={readOnly}
        />
      </div>

    </form>
  );
}

function GrandparentsSection({
  side,
  label,
  register,
  watch,
  setValue,
  errors,
  readOnly,
}: {
  side: "father" | "mother";
  label: string;
  register: ReturnType<typeof useForm<FamilyInfoData>>["register"];
  watch: ReturnType<typeof useForm<FamilyInfoData>>["watch"];
  setValue: ReturnType<typeof useForm<FamilyInfoData>>["setValue"];
  errors: ReturnType<typeof useForm<FamilyInfoData>>["formState"]["errors"];
  readOnly?: boolean;
}) {
  const key = side === "father" ? "grandparentsFather" : "grandparentsMother";
  const deceased = watch(`${key}.deceased`) ?? false;
  const nameError = errors[key]?.names;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">{label}</h4>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <Checkbox
            checked={deceased}
            onCheckedChange={(checked: boolean) =>
              setValue(`${key}.deceased`, checked, { shouldDirty: true })
            }
            disabled={readOnly}
          />
          <span className="text-muted-foreground">Both deceased</span>
        </label>
      </div>

      {!deceased && (
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>
              Names <span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="Grandfather & Grandmother names"
              {...register(`${key}.names`)}
              aria-invalid={!!nameError}
              disabled={readOnly}
            />
            {nameError && (
              <p className="text-xs text-destructive">
                {nameError.message as string}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <EmailInput
              {...register(`${key}.email`)}
              disabled={readOnly}
            />
          </div>
        </div>
      )}

      {deceased && (
        <p className="text-xs text-muted-foreground italic pl-1">
          Marked as deceased — no further info needed.
        </p>
      )}
    </div>
  );
}
