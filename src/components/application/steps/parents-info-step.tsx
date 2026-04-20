"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  parentsInfoSchema,
  type ParentsInfoData,
} from "@/lib/validators/application";
import { useApplicationFormStore } from "@/stores/application-form.store";
import { updateApplicationStep } from "@/server/actions/application.actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import React from "react";

interface StepProps {
  applicationId: string;
  readOnly?: boolean;
  formRef?: React.RefObject<HTMLFormElement | null>;
  onSaved?: () => void;
}

const FATHER_SALUTATIONS = ["Mr.", "Rabbi", "Dr."];
const MOTHER_SALUTATIONS = ["Ms.", "Mrs.", "Dr."];

function ParentSection({
  title,
  prefix,
  register,
  errors,
  readOnly,
  salutations,
}: {
  title: string;
  prefix: "father" | "mother";
  register: ReturnType<typeof useForm<ParentsInfoData>>["register"];
  errors: Record<string, { message?: string }>;
  readOnly?: boolean;
  salutations: string[];
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
        {title}
      </h3>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Salutation</Label>
          <select
            {...register(`${prefix}.salutation`)}
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            disabled={readOnly}
          >
            <option value="">Select...</option>
            {salutations.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label>
            First Name <span className="text-destructive">*</span>
          </Label>
          <Input
            {...register(`${prefix}.firstName`)}
            aria-invalid={!!errors[`${prefix}.firstName`]}
            disabled={readOnly}
          />
          {errors[`${prefix}.firstName`] && (
            <p className="text-xs text-destructive">
              {errors[`${prefix}.firstName`].message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>
            Last Name <span className="text-destructive">*</span>
          </Label>
          <Input
            {...register(`${prefix}.lastName`)}
            aria-invalid={!!errors[`${prefix}.lastName`]}
            disabled={readOnly}
          />
          {errors[`${prefix}.lastName`] && (
            <p className="text-xs text-destructive">
              {errors[`${prefix}.lastName`].message}
            </p>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Phone <span className="text-destructive">*</span></Label>
          <Input
            type="tel"
            {...register(`${prefix}.phone`)}
            placeholder="(555) 123-4567"
            aria-invalid={!!errors[`${prefix}.phone`]}
            disabled={readOnly}
          />
          {errors[`${prefix}.phone`] && (
            <p className="text-xs text-destructive">
              {errors[`${prefix}.phone`].message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Email <span className="text-destructive">*</span></Label>
          <Input
            type="email"
            {...register(`${prefix}.email`)}
            placeholder="parent@example.com"
            aria-invalid={!!errors[`${prefix}.email`]}
            disabled={readOnly}
          />
          {errors[`${prefix}.email`] && (
            <p className="text-xs text-destructive">
              {errors[`${prefix}.email`].message}
            </p>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label>Street Address</Label>
          <Input {...register(`${prefix}.addressLine1`)} disabled={readOnly} />
        </div>
        <div className="space-y-2">
          <Label>City</Label>
          <Input {...register(`${prefix}.city`)} disabled={readOnly} />
        </div>
        <div className="space-y-2">
          <Label>State</Label>
          <Input {...register(`${prefix}.state`)} disabled={readOnly} />
        </div>
        <div className="space-y-2">
          <Label>ZIP Code</Label>
          <Input {...register(`${prefix}.zipCode`)} disabled={readOnly} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Marital Status <span className="text-destructive">*</span></Label>
          <select
            {...register(`${prefix}.maritalStatus`)}
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            disabled={readOnly}
          >
            <option value="">Select...</option>
            <option value="Married">Married</option>
            <option value="Divorced">Divorced</option>
            <option value="Separated">Separated</option>
            <option value="Widowed">Widowed</option>
            <option value="Single">Single</option>
          </select>
          {errors[`${prefix}.maritalStatus`] && (
            <p className="text-xs text-destructive">
              {errors[`${prefix}.maritalStatus`].message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Occupation <span className="text-destructive">*</span></Label>
          <Input
            {...register(`${prefix}.occupation`)}
            aria-invalid={!!errors[`${prefix}.occupation`]}
            disabled={readOnly}
          />
          {errors[`${prefix}.occupation`] && (
            <p className="text-xs text-destructive">
              {errors[`${prefix}.occupation`].message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function ParentsInfoStep({
  applicationId,
  readOnly,
  formRef,
  onSaved,
}: StepProps) {
  const store = useApplicationFormStore();
  const existing = store.formData.parentsInfo;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<ParentsInfoData>({
    resolver: zodResolver(parentsInfoSchema),
    defaultValues: {
      father: {
        salutation: "",
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        addressLine1: "",
        city: "",
        state: "",
        zipCode: "",
        maritalStatus: "",
        occupation: "",
        ...existing?.father,
      },
      mother: {
        salutation: "",
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        addressLine1: "",
        city: "",
        state: "",
        zipCode: "",
        maritalStatus: "",
        occupation: "",
        ...existing?.mother,
      },
      hasGuardian: existing?.hasGuardian ?? false,
      guardian: existing?.guardian ?? {
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        relationship: "",
        addressLine1: "",
        city: "",
        state: "",
        zipCode: "",
      },
      emergencyContact: {
        name: "",
        phone: "",
        relationship: "",
        ...existing?.emergencyContact,
      },
    },
  });

  const hasGuardian = watch("hasGuardian");

  const flatErrors: Record<string, { message?: string }> = {};
  if (errors.father) {
    for (const [key, val] of Object.entries(errors.father)) {
      flatErrors[`father.${key}`] = val as { message?: string };
    }
  }
  if (errors.mother) {
    for (const [key, val] of Object.entries(errors.mother)) {
      flatErrors[`mother.${key}`] = val as { message?: string };
    }
  }

  const onSubmit = async (data: ParentsInfoData) => {
    store.setIsSaving(true);
    const result = await updateApplicationStep(applicationId, 3, data);
    store.setIsSaving(false);

    if (result.success) {
      store.setStepData("parentsInfo", data);
      store.markStepComplete(3);
      store.setIsDirty(false);
      reset(data);
      onSaved?.();
    }
  };

  const errorCount = Object.keys(errors).length > 0
    ? Object.keys(flatErrors).length
    : 0;

  return (
    <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="step-form space-y-8">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">Parents / Guardian Information</h2>
        <p className="text-sm text-muted-foreground">
          Please provide information for both parents and an emergency contact.
        </p>
      </div>

      {errorCount > 0 && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
          <p className="text-sm font-medium text-destructive">
            Please fix {errorCount} required field{errorCount > 1 ? "s" : ""} below (highlighted in red)
          </p>
        </div>
      )}

      <ParentSection
        title="Father"
        prefix="father"
        register={register}
        errors={flatErrors}
        readOnly={readOnly}
        salutations={FATHER_SALUTATIONS}
      />

      <div className="border-t pt-6">
        <ParentSection
          title="Mother"
          prefix="mother"
          register={register}
          errors={flatErrors}
          readOnly={readOnly}
          salutations={MOTHER_SALUTATIONS}
        />
      </div>

      {/* Guardian */}
      <div className="border-t pt-6 space-y-4">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={hasGuardian}
            onCheckedChange={(checked: boolean) =>
              setValue("hasGuardian", checked, { shouldDirty: true })
            }
            disabled={readOnly}
          />
          <Label className="text-base">
            Does the applicant live with a guardian?
          </Label>
        </div>

        {hasGuardian && (
          <div className="pl-7 space-y-4 animate-slide-up">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Guardian Information
            </h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>First Name <span className="text-destructive">*</span></Label>
                <Input
                  {...register("guardian.firstName")}
                  disabled={readOnly}
                />
              </div>
              <div className="space-y-2">
                <Label>Last Name <span className="text-destructive">*</span></Label>
                <Input
                  {...register("guardian.lastName")}
                  disabled={readOnly}
                />
              </div>
              <div className="space-y-2">
                <Label>Relationship</Label>
                <Input
                  {...register("guardian.relationship")}
                  disabled={readOnly}
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  type="tel"
                  {...register("guardian.phone")}
                  disabled={readOnly}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  {...register("guardian.email")}
                  disabled={readOnly}
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Street Address</Label>
                <Input
                  {...register("guardian.addressLine1")}
                  disabled={readOnly}
                />
              </div>
              <div className="space-y-2">
                <Label>City</Label>
                <Input
                  {...register("guardian.city")}
                  disabled={readOnly}
                />
              </div>
              <div className="space-y-2">
                <Label>State</Label>
                <Input
                  {...register("guardian.state")}
                  disabled={readOnly}
                />
              </div>
              <div className="space-y-2">
                <Label>ZIP Code</Label>
                <Input
                  {...register("guardian.zipCode")}
                  disabled={readOnly}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Emergency Contact */}
      <div className="border-t pt-6 space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Emergency Contact
        </h3>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              {...register("emergencyContact.name")}
              aria-invalid={!!errors.emergencyContact?.name}
              disabled={readOnly}
            />
            {errors.emergencyContact?.name && (
              <p className="text-xs text-destructive">
                {errors.emergencyContact.name.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label>
              Phone <span className="text-destructive">*</span>
            </Label>
            <Input
              type="tel"
              {...register("emergencyContact.phone")}
              aria-invalid={!!errors.emergencyContact?.phone}
              disabled={readOnly}
            />
            {errors.emergencyContact?.phone && (
              <p className="text-xs text-destructive">
                {errors.emergencyContact.phone.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label>
              Relationship <span className="text-destructive">*</span>
            </Label>
            <Input
              {...register("emergencyContact.relationship")}
              aria-invalid={!!errors.emergencyContact?.relationship}
              disabled={readOnly}
            />
            {errors.emergencyContact?.relationship && (
              <p className="text-xs text-destructive">
                {errors.emergencyContact.relationship.message}
              </p>
            )}
          </div>
        </div>
      </div>

    </form>
  );
}
