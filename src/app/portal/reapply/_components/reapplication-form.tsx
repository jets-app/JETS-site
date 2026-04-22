"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  reapplicationSchema,
  type ReapplicationInput,
} from "@/lib/validators/reapplication";
import { createReapplication } from "@/server/actions/reapplication.actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PhoneInput } from "@/components/forms/phone-input";
import { EmailInput } from "@/components/forms/email-input";
import { Loader2, ArrowRight } from "lucide-react";

interface Props {
  openYears: string[];
  defaultYear: string;
}

const MAX_DOB = (() => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 16);
  return d.toISOString().split("T")[0];
})();

export function ReapplicationForm({ openYears, defaultYear }: Props) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ReapplicationInput>({
    resolver: zodResolver(reapplicationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      email: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      zipCode: "",
      country: "United States",
      academicYear: defaultYear,
    },
  });

  async function onSubmit(data: ReapplicationInput) {
    setSubmitError(null);
    const result = await createReapplication(data);
    if (result.error) {
      if (result.existingId) {
        router.push(`/portal/reapply/${result.existingId}/payment`);
        return;
      }
      setSubmitError(result.error);
      return;
    }
    if (result.applicationId) {
      router.push(`/portal/reapply/${result.applicationId}/payment`);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-card border rounded-2xl p-6 lg:p-8">
      {openYears.length > 1 && (
        <div className="space-y-1.5">
          <Label htmlFor="academicYear">
            School Year <span className="text-destructive">*</span>
          </Label>
          <select
            id="academicYear"
            {...register("academicYear")}
            className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm"
          >
            {openYears.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="firstName">
            Student&apos;s First Name <span className="text-destructive">*</span>
          </Label>
          <Input id="firstName" {...register("firstName")} aria-invalid={!!errors.firstName} />
          {errors.firstName && (
            <p className="text-xs text-destructive">{errors.firstName.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lastName">
            Student&apos;s Last Name <span className="text-destructive">*</span>
          </Label>
          <Input id="lastName" {...register("lastName")} aria-invalid={!!errors.lastName} />
          {errors.lastName && (
            <p className="text-xs text-destructive">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="dateOfBirth">
          Student&apos;s Date of Birth <span className="text-destructive">*</span>
        </Label>
        <Input
          id="dateOfBirth"
          type="date"
          max={MAX_DOB}
          {...register("dateOfBirth")}
          aria-invalid={!!errors.dateOfBirth}
        />
        {errors.dateOfBirth && (
          <p className="text-xs text-destructive">{errors.dateOfBirth.message}</p>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">
            Student&apos;s Email <span className="text-destructive">*</span>
          </Label>
          <EmailInput id="email" {...register("email")} aria-invalid={!!errors.email} />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">
            Student&apos;s Phone <span className="text-destructive">*</span>
          </Label>
          <PhoneInput id="phone" {...register("phone")} aria-invalid={!!errors.phone} />
          {errors.phone && (
            <p className="text-xs text-destructive">{errors.phone.message}</p>
          )}
        </div>
      </div>

      <div className="pt-2 border-t space-y-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          Home Address
        </p>
        <div className="space-y-1.5">
          <Label htmlFor="addressLine1">
            Street Address <span className="text-destructive">*</span>
          </Label>
          <Input id="addressLine1" {...register("addressLine1")} aria-invalid={!!errors.addressLine1} />
          {errors.addressLine1 && (
            <p className="text-xs text-destructive">{errors.addressLine1.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="addressLine2">Address Line 2 (optional)</Label>
          <Input id="addressLine2" {...register("addressLine2")} />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="city">
              City <span className="text-destructive">*</span>
            </Label>
            <Input id="city" {...register("city")} aria-invalid={!!errors.city} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="state">
              State <span className="text-destructive">*</span>
            </Label>
            <Input id="state" {...register("state")} aria-invalid={!!errors.state} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="zipCode">
              ZIP <span className="text-destructive">*</span>
            </Label>
            <Input id="zipCode" {...register("zipCode")} aria-invalid={!!errors.zipCode} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="country">
              Country <span className="text-destructive">*</span>
            </Label>
            <Input id="country" {...register("country")} aria-invalid={!!errors.country} />
          </div>
        </div>
      </div>

      {submitError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-sm text-destructive">{submitError}</p>
        </div>
      )}

      <Button type="submit" disabled={isSubmitting} size="lg" className="w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            Continue to payment
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  );
}
