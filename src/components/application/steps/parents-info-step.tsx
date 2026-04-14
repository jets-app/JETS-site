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
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Save, Loader2 } from "lucide-react";

interface StepProps {
  applicationId: string;
  readOnly?: boolean;
  onSaved?: () => void;
}

const SALUTATIONS = ["Rabbi", "Mr.", "Dr.", "Rev.", "Cantor", "Hon.", "Prof."];

function ParentSection({
  title,
  prefix,
  register,
  errors,
  readOnly,
}: {
  title: string;
  prefix: "father" | "mother";
  register: ReturnType<typeof useForm<ParentsInfoData>>["register"];
  errors: Record<string, { message?: string }>;
  readOnly?: boolean;
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
            {SALUTATIONS.map((s) => (
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
          <Label>Phone</Label>
          <Input
            type="tel"
            {...register(`${prefix}.phone`)}
            placeholder="(555) 123-4567"
            disabled={readOnly}
          />
        </div>

        <div className="space-y-2">
          <Label>Email</Label>
          <Input
            type="email"
            {...register(`${prefix}.email`)}
            placeholder="parent@example.com"
            disabled={readOnly}
          />
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
          <Label>Marital Status</Label>
          <select
            {...register(`${prefix}.maritalStatus`)}
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            disabled={readOnly}
          >
            <option value="">Select...</option>
            <option value="married">Married</option>
            <option value="divorced">Divorced</option>
            <option value="separated">Separated</option>
            <option value="widowed">Widowed</option>
            <option value="single">Single</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label>Occupation</Label>
          <Input {...register(`${prefix}.occupation`)} disabled={readOnly} />
        </div>
      </div>
    </div>
  );
}

export function ParentsInfoStep({
  applicationId,
  readOnly,
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">Parents / Guardian Information</h2>
        <p className="text-sm text-muted-foreground">
          Please provide information for both parents and an emergency contact.
        </p>
      </div>

      <ParentSection
        title="Father"
        prefix="father"
        register={register}
        errors={flatErrors}
        readOnly={readOnly}
      />

      <div className="border-t pt-6">
        <ParentSection
          title="Mother"
          prefix="mother"
          register={register}
          errors={flatErrors}
          readOnly={readOnly}
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
            <Label>Relationship</Label>
            <Input
              {...register("emergencyContact.relationship")}
              disabled={readOnly}
            />
          </div>
        </div>
      </div>

      {!readOnly && (
        <div className="flex justify-end">
          <Button type="submit" disabled={store.isSaving}>
            {store.isSaving ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-1.5 h-4 w-4" />
            )}
            Save &amp; Continue
          </Button>
        </div>
      )}
    </form>
  );
}
