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
    <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">Family Information</h2>
        <p className="text-sm text-muted-foreground">
          Tell us about the applicant&apos;s siblings and grandparents.
        </p>
      </div>

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
                  <Input
                    type="tel"
                    {...register(`siblings.${index}.phone`)}
                    disabled={readOnly}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
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
          Grandparents
        </h3>

        <div className="space-y-4">
          <h4 className="text-sm font-medium">Father&apos;s Side</h4>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Names</Label>
              <Input
                placeholder="Grandfather & Grandmother names"
                {...register("grandparentsFather.names")}
                disabled={readOnly}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                {...register("grandparentsFather.email")}
                disabled={readOnly}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-medium">Mother&apos;s Side</h4>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Names</Label>
              <Input
                placeholder="Grandfather & Grandmother names"
                {...register("grandparentsMother.names")}
                disabled={readOnly}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                {...register("grandparentsMother.email")}
                disabled={readOnly}
              />
            </div>
          </div>
        </div>
      </div>

    </form>
  );
}
