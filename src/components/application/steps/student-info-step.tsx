"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  studentInfoSchema,
  type StudentInfoData,
} from "@/lib/validators/application";
import { useApplicationFormStore } from "@/stores/application-form.store";
import { updateApplicationStep } from "@/server/actions/application.actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/forms/phone-input";
import { EmailInput } from "@/components/forms/email-input";
import { useEffect } from "react";
import React from "react";

interface StepProps {
  applicationId: string;
  readOnly?: boolean;
  formRef?: React.RefObject<HTMLFormElement | null>;
  onSaved?: () => void;
}

const MAX_DOB = (() => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 16);
  return d.toISOString().split("T")[0];
})();

export function StudentInfoStep({ applicationId, readOnly, formRef, onSaved }: StepProps) {
  const store = useApplicationFormStore();
  const existing = store.formData.studentInfo;

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<StudentInfoData>({
    resolver: zodResolver(studentInfoSchema),
    defaultValues: {
      firstName: existing?.firstName ?? "",
      lastName: existing?.lastName ?? "",
      middleName: existing?.middleName ?? "",
      preferredName: existing?.preferredName ?? "",
      dateOfBirth: existing?.dateOfBirth ?? "",
      phone: existing?.phone ?? "",
      email: existing?.email ?? "",
      addressLine1: existing?.addressLine1 ?? "",
      addressLine2: existing?.addressLine2 ?? "",
      city: existing?.city ?? "",
      state: existing?.state ?? "",
      zipCode: existing?.zipCode ?? "",
      country: existing?.country ?? "United States",
      familyPhone: existing?.familyPhone ?? "",
    },
  });

  const onSubmit = async (data: StudentInfoData) => {
    store.setIsSaving(true);
    const result = await updateApplicationStep(applicationId, 1, data);
    store.setIsSaving(false);

    if (result.success) {
      store.setStepData("studentInfo", data);
      store.markStepComplete(1);
      store.setIsDirty(false);
      reset(data);
      onSaved?.();
    }
  };

  // Auto-save on unmount if dirty
  useEffect(() => {
    return () => {
      // The form is uncontrolled so we can't auto-save easily here.
      // The user should click Save or Next.
    };
  }, []);

  return (
    <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="step-form space-y-8">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">Student Information</h2>
        <p className="text-sm text-muted-foreground">
          Please provide the applicant&apos;s personal details.
        </p>
      </div>

      {Object.keys(errors).length > 0 && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
          <p className="text-sm font-medium text-destructive">
            Please fix {Object.keys(errors).length} required field{Object.keys(errors).length > 1 ? "s" : ""} below (highlighted in red)
          </p>
        </div>
      )}

      {/* Name Fields */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">
            First Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="firstName"
            {...register("firstName")}
            aria-invalid={!!errors.firstName}
            disabled={readOnly}
          />
          {errors.firstName && (
            <p className="text-xs text-destructive">{errors.firstName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="middleName">Middle Name</Label>
          <Input id="middleName" {...register("middleName")} disabled={readOnly} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">
            Last Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="lastName"
            {...register("lastName")}
            aria-invalid={!!errors.lastName}
            disabled={readOnly}
          />
          {errors.lastName && (
            <p className="text-xs text-destructive">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="preferredName">Preferred Name / Nickname <span className="text-destructive">*</span></Label>
          <Input
            id="preferredName"
            placeholder="Nickname or preferred name"
            {...register("preferredName")}
            aria-invalid={!!errors.preferredName}
            disabled={readOnly}
          />
          {errors.preferredName && (
            <p className="text-xs text-destructive">{errors.preferredName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">
            Date of Birth <span className="text-destructive">*</span>
          </Label>
          <Input
            id="dateOfBirth"
            type="date"
            max={MAX_DOB}
            {...register("dateOfBirth")}
            aria-invalid={!!errors.dateOfBirth}
            disabled={readOnly}
          />
          {errors.dateOfBirth && (
            <p className="text-xs text-destructive">
              {errors.dateOfBirth.message}
            </p>
          )}
        </div>
      </div>

      {/* Contact */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Cell Phone <span className="text-destructive">*</span></Label>
          <PhoneInput
            id="phone"
            {...register("phone")}
            aria-invalid={!!errors.phone}
            disabled={readOnly}
          />
          {errors.phone && (
            <p className="text-xs text-destructive">{errors.phone.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
          <EmailInput
            id="email"
            placeholder="student@example.com"
            {...register("email")}
            aria-invalid={!!errors.email}
            disabled={readOnly}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="familyPhone">Family Phone</Label>
          <PhoneInput
            id="familyPhone"
            {...register("familyPhone")}
            disabled={readOnly}
          />
        </div>
      </div>

      {/* Address */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Address
        </h3>

        <div className="space-y-2">
          <Label htmlFor="addressLine1">
            Street Address <span className="text-destructive">*</span>
          </Label>
          <Input
            id="addressLine1"
            placeholder="123 Main Street"
            {...register("addressLine1")}
            aria-invalid={!!errors.addressLine1}
            disabled={readOnly}
          />
          {errors.addressLine1 && (
            <p className="text-xs text-destructive">
              {errors.addressLine1.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="addressLine2">Address Line 2</Label>
          <Input
            id="addressLine2"
            placeholder="Apt, Suite, Unit, etc."
            {...register("addressLine2")}
            disabled={readOnly}
          />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">
              City <span className="text-destructive">*</span>
            </Label>
            <Input
              id="city"
              {...register("city")}
              aria-invalid={!!errors.city}
              disabled={readOnly}
            />
            {errors.city && (
              <p className="text-xs text-destructive">{errors.city.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">
              State / Province <span className="text-destructive">*</span>
            </Label>
            <Input
              id="state"
              {...register("state")}
              aria-invalid={!!errors.state}
              disabled={readOnly}
            />
            {errors.state && (
              <p className="text-xs text-destructive">{errors.state.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="zipCode">
              ZIP / Postal Code <span className="text-destructive">*</span>
            </Label>
            <Input
              id="zipCode"
              {...register("zipCode")}
              aria-invalid={!!errors.zipCode}
              disabled={readOnly}
            />
            {errors.zipCode && (
              <p className="text-xs text-destructive">
                {errors.zipCode.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">
              Country <span className="text-destructive">*</span>
            </Label>
            <Input
              id="country"
              {...register("country")}
              aria-invalid={!!errors.country}
              disabled={readOnly}
            />
            {errors.country && (
              <p className="text-xs text-destructive">
                {errors.country.message}
              </p>
            )}
          </div>
        </div>
      </div>

    </form>
  );
}
