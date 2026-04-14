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
import { useEffect } from "react";
import React from "react";

interface StepProps {
  applicationId: string;
  readOnly?: boolean;
  formRef?: React.RefObject<HTMLFormElement | null>;
  onSaved?: () => void;
}

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
    <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">Student Information</h2>
        <p className="text-sm text-muted-foreground">
          Please provide the applicant&apos;s personal details.
        </p>
      </div>

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
          <Label htmlFor="preferredName">Preferred Name</Label>
          <Input
            id="preferredName"
            placeholder="Nickname or preferred name"
            {...register("preferredName")}
            disabled={readOnly}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">
            Date of Birth <span className="text-destructive">*</span>
          </Label>
          <Input
            id="dateOfBirth"
            type="date"
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
          <Label htmlFor="phone">Cell Phone</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="(555) 123-4567"
            {...register("phone")}
            disabled={readOnly}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
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
          <Input
            id="familyPhone"
            type="tel"
            placeholder="(555) 123-4567"
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
