"use client";

import React, { useState, useTransition } from "react";
import { useApplicationFormStore } from "@/stores/application-form.store";
import {
  addRecommendation,
  removeRecommendation,
  submitApplication,
  applyDiscountCode,
} from "@/server/actions/application.actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Check,
  X,
  Loader2,
  Upload,
  Trash2,
  Plus,
  Send,
  AlertCircle,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { STEP_LABELS } from "@/lib/validators/application";

interface StepProps {
  applicationId: string;
  readOnly?: boolean;
  formRef?: React.RefObject<HTMLFormElement | null>;
  onSaved?: () => void;
  application: {
    id: string;
    applicationFeePaid: boolean;
    applicationFeeAmount: number;
    discountCode: string | null;
    discountAmount: number;
    student: Record<string, unknown> | null;
    essay: string | null;
    recommendations: Array<{
      id: string;
      name: string;
      email: string;
      phone: string | null;
      relationship: string;
      status: string;
    }>;
  };
}

export function ReviewSubmitStep({
  applicationId,
  readOnly,
  formRef,
  onSaved,
  application,
}: StepProps) {
  const store = useApplicationFormStore();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Recommendation form state
  const [refName, setRefName] = useState("");
  const [refEmail, setRefEmail] = useState("");
  const [refPhone, setRefPhone] = useState("");
  const [refRelationship, setRefRelationship] = useState("");

  // Discount code
  const [discountInput, setDiscountInput] = useState("");
  const [discountError, setDiscountError] = useState<string | null>(null);

  // Photo
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const formData = store.formData;

  // Requirements check
  const allStepsComplete = Array.from({ length: 9 }, (_, i) => i + 1).every(
    (step) => store.completedSteps.has(step)
  );
  const hasPhoto = !!photoFile || !!(application.student as Record<string, unknown> | null)?.photoUrl;
  const hasRecommendations = application.recommendations.length >= 2;
  const feePaid = application.applicationFeePaid;

  const canSubmit =
    allStepsComplete && hasRecommendations && feePaid && !readOnly;

  const handleAddRecommendation = () => {
    if (!refName || !refEmail || !refRelationship) {
      setError("Please fill in name, email, and relationship for the reference.");
      return;
    }

    startTransition(async () => {
      setError(null);
      const result = await addRecommendation(applicationId, {
        name: refName,
        email: refEmail,
        phone: refPhone,
        relationship: refRelationship,
      });

      if (result.error) {
        setError(result.error);
      } else {
        setRefName("");
        setRefEmail("");
        setRefPhone("");
        setRefRelationship("");
      }
    });
  };

  const handleRemoveRecommendation = (recId: string) => {
    startTransition(async () => {
      setError(null);
      const result = await removeRecommendation(applicationId, recId);
      if (result.error) setError(result.error);
    });
  };

  const handleApplyDiscount = () => {
    if (!discountInput.trim()) return;
    startTransition(async () => {
      setDiscountError(null);
      const result = await applyDiscountCode(applicationId, discountInput);
      if (result.error) {
        setDiscountError(result.error);
      } else {
        setDiscountInput("");
      }
    });
  };

  const handleSubmit = () => {
    startTransition(async () => {
      setError(null);
      const result = await submitApplication(applicationId);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccessMessage(
          "Your application has been submitted successfully! You will receive a confirmation email."
        );
      }
    });
  };

  if (successMessage) {
    return (
      <div className="text-center py-12 space-y-4 animate-scale-in">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
          <Check className="h-8 w-8 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold">Application Submitted!</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          {successMessage}
        </p>
      </div>
    );
  }

  const feeAmount = application.applicationFeeAmount - application.discountAmount;

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">Review &amp; Submit</h2>
        <p className="text-sm text-muted-foreground">
          Review your application, upload a photo, add references, and submit.
        </p>
      </div>

      {/* Submission Requirements */}
      <div className="rounded-lg border p-4 space-y-3">
        <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Submission Requirements
        </h3>
        <div className="space-y-2">
          <RequirementRow
            label="All steps complete (1-9)"
            met={allStepsComplete}
          />
          <RequirementRow label="Photo uploaded" met={hasPhoto} />
          <RequirementRow
            label="Two recommendation references added"
            met={hasRecommendations}
          />
          <RequirementRow
            label={`Application fee paid ($${(feeAmount / 100).toFixed(2)})`}
            met={feePaid}
          />
        </div>
      </div>

      {/* Photo Upload */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Applicant Photo
        </h3>
        {!readOnly ? (
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-border hover:border-primary/50 hover:bg-muted/50 cursor-pointer transition-all">
              <Upload className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {photoFile ? photoFile.name : "Choose a photo"}
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
              />
            </label>
            {photoFile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPhotoFile(null)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {(application.student as Record<string, unknown> | null)?.photoUrl
              ? "Photo uploaded"
              : "No photo uploaded"}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          A recent passport-style photo. Upload integration will be completed
          with UploadThing.
        </p>
      </div>

      {/* Recommendations */}
      <div className="border-t pt-6 space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Recommendation References ({application.recommendations.length}/2)
        </h3>

        {application.recommendations.map((rec) => (
          <div
            key={rec.id}
            className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
          >
            <div>
              <p className="text-sm font-medium">{rec.name}</p>
              <p className="text-xs text-muted-foreground">
                {rec.email} &middot; {rec.relationship}
              </p>
              <span
                className={cn(
                  "inline-block mt-1 text-xs px-2 py-0.5 rounded-full",
                  rec.status === "COMPLETED"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700"
                )}
              >
                {rec.status === "COMPLETED" ? "Completed" : "Pending"}
              </span>
            </div>
            {!readOnly && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveRecommendation(rec.id)}
                disabled={isPending}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>
        ))}

        {!readOnly && application.recommendations.length < 2 && (
          <div className="space-y-3 p-4 rounded-lg border border-dashed">
            <p className="text-sm font-medium">Add a Reference</p>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={refName}
                  onChange={(e) => setRefName(e.target.value)}
                  placeholder="Full name"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="email"
                  value={refEmail}
                  onChange={(e) => setRefEmail(e.target.value)}
                  placeholder="email@example.com"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Phone</Label>
                <Input
                  type="tel"
                  value={refPhone}
                  onChange={(e) => setRefPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">
                  Relationship <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={refRelationship}
                  onChange={(e) => setRefRelationship(e.target.value)}
                  placeholder="Rabbi, Teacher, etc."
                />
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddRecommendation}
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Plus className="mr-1.5 h-3.5 w-3.5" />
              )}
              Add Reference
            </Button>
          </div>
        )}
      </div>

      {/* Discount Code */}
      {!readOnly && !feePaid && (
        <div className="border-t pt-6 space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Discount Code
          </h3>
          {application.discountCode ? (
            <p className="text-sm text-emerald-600">
              Discount applied: {application.discountCode} (-$
              {(application.discountAmount / 100).toFixed(2)})
            </p>
          ) : (
            <div className="flex gap-2">
              <Input
                value={discountInput}
                onChange={(e) => setDiscountInput(e.target.value.toUpperCase())}
                placeholder="Enter discount code"
                className="max-w-xs"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleApplyDiscount}
                disabled={isPending || !discountInput.trim()}
              >
                Apply
              </Button>
            </div>
          )}
          {discountError && (
            <p className="text-xs text-destructive">{discountError}</p>
          )}
        </div>
      )}

      {/* Application Fee */}
      {!readOnly && !feePaid && (
        <div className="border-t pt-6 space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Application Fee
          </h3>
          <div className="p-4 rounded-lg bg-muted/50 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">
                ${(feeAmount / 100).toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground">
                Payment via Stripe (integration coming soon)
              </p>
            </div>
            <Button variant="outline" size="sm" disabled>
              <DollarSign className="mr-1.5 h-3.5 w-3.5" />
              Pay Now
            </Button>
          </div>
        </div>
      )}

      {/* Review Summary */}
      <div className="border-t pt-6 space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Application Summary
        </h3>

        <div className="space-y-3">
          {/* Step 1: Student Info */}
          <SummarySection
            step={1}
            title="Student Information"
            complete={store.completedSteps.has(1)}
            onNavigate={() => store.setCurrentStep(1)}
          >
            {formData.studentInfo && (
              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
                <SummaryField
                  label="Name"
                  value={`${formData.studentInfo.firstName} ${formData.studentInfo.lastName}`}
                />
                <SummaryField
                  label="DOB"
                  value={formData.studentInfo.dateOfBirth}
                />
                <SummaryField
                  label="Phone"
                  value={formData.studentInfo.phone}
                />
                <SummaryField
                  label="Email"
                  value={formData.studentInfo.email}
                />
                <SummaryField
                  label="City"
                  value={formData.studentInfo.city}
                />
                <SummaryField
                  label="Country"
                  value={formData.studentInfo.country}
                />
              </div>
            )}
          </SummarySection>

          {/* Step 2: Hebrew Names */}
          <SummarySection
            step={2}
            title="Hebrew Name"
            complete={store.completedSteps.has(2)}
            onNavigate={() => store.setCurrentStep(2)}
          >
            {formData.hebrewNames && (
              <div className="text-sm space-y-1">
                <SummaryField
                  label="Hebrew Name"
                  value={formData.hebrewNames.applicantHebrewName}
                />
                <SummaryField
                  label="Father's Hebrew Name"
                  value={formData.hebrewNames.fatherHebrewName}
                />
                <SummaryField
                  label="Mother's Hebrew Name"
                  value={formData.hebrewNames.motherHebrewName}
                />
              </div>
            )}
          </SummarySection>

          {/* Steps 3-9 summary */}
          {[
            { step: 3, title: "Parents Info" },
            { step: 4, title: "Family Info" },
            { step: 5, title: "School History" },
            { step: 6, title: "Parent Questions" },
            { step: 7, title: "Assessment" },
            { step: 8, title: "Studies & Trades" },
            { step: 9, title: "Essay" },
          ].map(({ step, title }) => (
            <SummarySection
              key={step}
              step={step}
              title={title}
              complete={store.completedSteps.has(step)}
              onNavigate={() => store.setCurrentStep(step)}
            >
              {store.completedSteps.has(step) ? (
                <p className="text-sm text-muted-foreground">
                  Section completed
                </p>
              ) : (
                <p className="text-sm text-amber-600">Not yet completed</p>
              )}
            </SummarySection>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {/* Submit */}
      {!readOnly && (
        <div className="border-t pt-6 flex justify-end">
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={!canSubmit || isPending}
          >
            {isPending ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-1.5 h-4 w-4" />
            )}
            Submit Application
          </Button>
        </div>
      )}

      {!canSubmit && !readOnly && (
        <p className="text-xs text-muted-foreground text-center">
          Please complete all requirements above before submitting.
        </p>
      )}
    </div>
  );
}

function RequirementRow({
  label,
  met,
}: {
  label: string;
  met: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "w-5 h-5 rounded-full flex items-center justify-center",
          met
            ? "bg-emerald-100 text-emerald-600"
            : "bg-muted text-muted-foreground"
        )}
      >
        {met ? (
          <Check className="h-3 w-3" />
        ) : (
          <X className="h-3 w-3" />
        )}
      </div>
      <span
        className={cn(
          "text-sm",
          met ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {label}
      </span>
    </div>
  );
}

function SummarySection({
  step,
  title,
  complete,
  onNavigate,
  children,
}: {
  step: number;
  title: string;
  complete: boolean;
  onNavigate: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="p-4 rounded-lg border">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "w-5 h-5 rounded-full flex items-center justify-center text-xs",
              complete
                ? "bg-emerald-100 text-emerald-600"
                : "bg-muted text-muted-foreground"
            )}
          >
            {complete ? <Check className="h-3 w-3" /> : step}
          </div>
          <h4 className="text-sm font-medium">{title}</h4>
        </div>
        <Button variant="ghost" size="sm" onClick={onNavigate}>
          Edit
        </Button>
      </div>
      {children}
    </div>
  );
}

function SummaryField({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
  if (!value) return null;
  return (
    <div>
      <span className="text-muted-foreground">{label}:</span>{" "}
      <span className="font-medium">{value}</span>
    </div>
  );
}
