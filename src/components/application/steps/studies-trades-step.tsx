"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  studiesTradesSchema,
  ratingValues,
  tradeInterestValues,
  type StudiesTradesData,
} from "@/lib/validators/application";
import { useApplicationFormStore } from "@/stores/application-form.store";
import { updateApplicationStep } from "@/server/actions/application.actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React from "react";
import { cn } from "@/lib/utils";

interface StepProps {
  applicationId: string;
  readOnly?: boolean;
  formRef?: React.RefObject<HTMLFormElement | null>;
  onSaved?: () => void;
}

const ACADEMIC_FIELDS = [
  { key: "englishReading" as const, label: "English Reading" },
  { key: "englishWriting" as const, label: "English Writing" },
  { key: "math" as const, label: "Math" },
  { key: "hebrewReading" as const, label: "Hebrew Reading" },
  { key: "hebrewWriting" as const, label: "Hebrew Writing" },
  { key: "hebrewComprehension" as const, label: "Hebrew Comprehension" },
  { key: "gemarah" as const, label: "Gemarah" },
  { key: "chassidus" as const, label: "Chassidus" },
];

const TRADE_FIELDS = [
  { key: "accounting" as const, label: "Accounting" },
  { key: "business" as const, label: "Business" },
  { key: "computers" as const, label: "Computers" },
  { key: "construction" as const, label: "Construction" },
  { key: "photoshop" as const, label: "Photoshop / Graphic Design" },
  { key: "electrical" as const, label: "Electrical" },
  { key: "realEstate" as const, label: "Real Estate" },
  { key: "finance" as const, label: "Finance" },
  { key: "marketing" as const, label: "Marketing" },
  { key: "webDevelopment" as const, label: "Web Development" },
  { key: "emt" as const, label: "EMT / First Responder" },
];

const EXTRACURRICULAR_FIELDS = [
  { key: "culinary" as const, label: "Culinary" },
  { key: "musicCoaching" as const, label: "Music / Coaching" },
  { key: "martialArts" as const, label: "Martial Arts" },
  { key: "gym" as const, label: "Gym / Fitness" },
  { key: "sports" as const, label: "Sports" },
];

function RatingSelector({
  value,
  options,
  onChange,
  disabled,
}: {
  value: string | undefined;
  options: readonly string[];
  onChange: (val: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          disabled={disabled}
          onClick={() => onChange(option)}
          className={cn(
            "px-2.5 py-1 rounded-md text-xs font-medium border transition-all",
            value === option
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background hover:bg-muted border-border text-foreground"
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

export function StudiesTradesStep({
  applicationId,
  readOnly,
  formRef,
  onSaved,
}: StepProps) {
  const store = useApplicationFormStore();
  const existing = store.formData.studiesTrades;

  const { register, handleSubmit, watch, setValue, reset } =
    useForm<StudiesTradesData>({
      resolver: zodResolver(studiesTradesSchema),
      defaultValues: {
        academics: {
          englishReading: "",
          englishWriting: "",
          math: "",
          hebrewReading: "",
          hebrewWriting: "",
          hebrewComprehension: "",
          gemarah: "",
          chassidus: "",
          ...existing?.academics,
        },
        trades: {
          accounting: "",
          business: "",
          computers: "",
          construction: "",
          photoshop: "",
          electrical: "",
          realEstate: "",
          finance: "",
          marketing: "",
          webDevelopment: "",
          emt: "",
          otherTrades: "",
          ...existing?.trades,
        },
        extracurricular: {
          culinary: "",
          musicCoaching: "",
          martialArts: "",
          gym: "",
          sports: "",
          ...existing?.extracurricular,
        },
      },
    });

  const onSubmit = async (data: StudiesTradesData) => {
    store.setIsSaving(true);
    const result = await updateApplicationStep(applicationId, 8, data);
    store.setIsSaving(false);

    if (result.success) {
      store.setStepData("studiesTrades", data);
      store.markStepComplete(8);
      store.setIsDirty(false);
      reset(data);
      onSaved?.();
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="step-form space-y-8">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">Studies &amp; Trades</h2>
        <p className="text-sm text-muted-foreground">
          Rate the applicant&apos;s academic abilities and indicate interest in
          trade programs.
        </p>
      </div>

      {/* Academic Self-Assessment */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Academic Self-Assessment
        </h3>

        <div className="space-y-3">
          {ACADEMIC_FIELDS.map((field) => (
            <div
              key={field.key}
              className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 rounded-lg border"
            >
              <span className="text-sm font-medium min-w-40">
                {field.label}
              </span>
              <RatingSelector
                value={watch(`academics.${field.key}`)}
                options={ratingValues}
                onChange={(val) =>
                  setValue(`academics.${field.key}`, val, {
                    shouldDirty: true,
                  })
                }
                disabled={readOnly}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Trade Interests */}
      <div className="border-t pt-6 space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Trade &amp; Career Interests
        </h3>

        <div className="space-y-3">
          {TRADE_FIELDS.map((field) => (
            <div
              key={field.key}
              className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 rounded-lg border"
            >
              <span className="text-sm font-medium min-w-40">
                {field.label}
              </span>
              <RatingSelector
                value={watch(`trades.${field.key}`)}
                options={tradeInterestValues}
                onChange={(val) =>
                  setValue(`trades.${field.key}`, val, {
                    shouldDirty: true,
                  })
                }
                disabled={readOnly}
              />
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <Label>Other Trades of Interest</Label>
          <Input
            placeholder="Any other trades not listed above"
            {...register("trades.otherTrades")}
            disabled={readOnly}
          />
        </div>
      </div>

      {/* Extracurricular */}
      <div className="border-t pt-6 space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Extracurricular Activities
        </h3>

        <div className="space-y-3">
          {EXTRACURRICULAR_FIELDS.map((field) => (
            <div
              key={field.key}
              className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 rounded-lg border"
            >
              <span className="text-sm font-medium min-w-40">
                {field.label}
              </span>
              <RatingSelector
                value={watch(`extracurricular.${field.key}`)}
                options={ratingValues}
                onChange={(val) =>
                  setValue(`extracurricular.${field.key}`, val, {
                    shouldDirty: true,
                  })
                }
                disabled={readOnly}
              />
            </div>
          ))}
        </div>
      </div>

    </form>
  );
}
