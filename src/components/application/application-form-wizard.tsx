"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import { useApplicationFormStore } from "@/stores/application-form.store";
import {
  STEP_LABELS,
  type ParentsInfoData,
  type FamilyInfoData,
  type SchoolHistoryData,
  type ParentQuestionsData,
  type ApplicantAssessmentData,
  type StudiesTradesData,
} from "@/lib/validators/application";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Step components
import { StudentInfoStep } from "./steps/student-info-step";
import { HebrewNameStep } from "./steps/hebrew-name-step";
import { ParentsInfoStep } from "./steps/parents-info-step";
import { FamilyInfoStep } from "./steps/family-info-step";
import { SchoolHistoryStep } from "./steps/school-history-step";
import { ParentQuestionsStep } from "./steps/parent-questions-step";
import { ApplicantAssessmentStep } from "./steps/applicant-assessment-step";
import { StudiesTradesStep } from "./steps/studies-trades-step";
import { EssayAdditionalStep } from "./steps/essay-additional-step";
import { ReviewSubmitStep } from "./steps/review-submit-step";

interface ApplicationData {
  id: string;
  referenceNumber: string;
  status: string;
  academicYear: string;
  currentStep: number;
  completionPct: number;
  applicationFeePaid: boolean;
  applicationFeeAmount: number;
  discountCode: string | null;
  discountAmount: number;
  essay: string | null;
  student: Record<string, unknown> | null;
  hebrewNames: Record<string, string> | null;
  fatherInfo: Record<string, string> | null;
  motherInfo: Record<string, string> | null;
  guardianInfo: Record<string, string> | null;
  emergencyContact: Record<string, string> | null;
  siblings: unknown[] | null;
  grandparents: Record<string, unknown> | null;
  schoolHistory: Record<string, unknown> | null;
  parentQuestions: Record<string, unknown> | null;
  applicantAssessment: Record<string, unknown> | null;
  studiesInfo: Record<string, unknown> | null;
  tradePreferences: Record<string, unknown> | null;
  extracurricular: Record<string, unknown> | null;
  additionalQuestions: Record<string, unknown> | null;
  recommendations: Array<{
    id: string;
    name: string;
    email: string;
    phone: string | null;
    relationship: string;
    status: string;
  }>;
  payments: Array<{
    id: string;
    type: string;
    status: string;
    amount: number;
  }>;
}

export function ApplicationFormWizard({
  application,
}: {
  application: ApplicationData;
}) {
  const store = useApplicationFormStore();
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);

  // Hydrate store from server data on mount
  useEffect(() => {
    const completedSteps: number[] = [];

    if (application.student) completedSteps.push(1);
    if (application.hebrewNames) completedSteps.push(2);
    if (application.fatherInfo || application.motherInfo) completedSteps.push(3);
    if (application.grandparents || application.siblings) completedSteps.push(4);
    if (application.schoolHistory) completedSteps.push(5);
    if (application.parentQuestions) completedSteps.push(6);
    if (application.applicantAssessment) completedSteps.push(7);
    if (application.studiesInfo || application.tradePreferences)
      completedSteps.push(8);
    if (application.essay) completedSteps.push(9);
    if (
      application.recommendations.length >= 2 &&
      application.applicationFeePaid
    )
      completedSteps.push(10);

    store.hydrateFromApplication({
      id: application.id,
      currentStep: application.currentStep,
      formData: {
        studentInfo: application.student
          ? {
              firstName: (application.student.firstName as string) ?? "",
              lastName: (application.student.lastName as string) ?? "",
              middleName: (application.student.middleName as string) ?? "",
              preferredName: (application.student.preferredName as string) ?? "",
              dateOfBirth: (application.student.dateOfBirth as string) ?? "",
              phone: (application.student.phone as string) ?? "",
              email: (application.student.email as string) ?? "",
              addressLine1: (application.student.addressLine1 as string) ?? "",
              addressLine2: (application.student.addressLine2 as string) ?? "",
              city: (application.student.city as string) ?? "",
              state: (application.student.state as string) ?? "",
              zipCode: (application.student.zipCode as string) ?? "",
              country:
                (application.student.country as string) ?? "United States",
              familyPhone: "",
            }
          : undefined,
        hebrewNames: application.hebrewNames
          ? {
              applicantHebrewName:
                application.hebrewNames.applicantHebrewName ?? "",
              fatherHebrewName:
                application.hebrewNames.fatherHebrewName ?? "",
              motherHebrewName:
                application.hebrewNames.motherHebrewName ?? "",
            }
          : undefined,
        parentsInfo:
          application.fatherInfo || application.motherInfo
            ? ({
                father: application.fatherInfo ?? {
                  firstName: "",
                  lastName: "",
                },
                mother: application.motherInfo ?? {
                  firstName: "",
                  lastName: "",
                },
                hasGuardian: !!application.guardianInfo,
                guardian: application.guardianInfo ?? undefined,
                emergencyContact:
                  application.emergencyContact ?? { name: "", phone: "" },
              } as ParentsInfoData)
            : undefined,
        familyInfo: application.grandparents
          ? ({
              closeToSiblings:
                (application.grandparents as Record<string, unknown>)
                  .closeToSiblings ?? false,
              siblings: application.siblings ?? undefined,
              grandparentsFather: (
                application.grandparents as Record<string, unknown>
              ).grandparentsFather,
              grandparentsMother: (
                application.grandparents as Record<string, unknown>
              ).grandparentsMother,
            } as FamilyInfoData)
          : undefined,
        schoolHistory: application.schoolHistory
          ? (application.schoolHistory as SchoolHistoryData)
          : undefined,
        parentQuestions: application.parentQuestions
          ? (application.parentQuestions as ParentQuestionsData)
          : undefined,
        applicantAssessment: application.applicantAssessment
          ? (application.applicantAssessment as ApplicantAssessmentData)
          : undefined,
        studiesTrades:
          application.studiesInfo || application.tradePreferences
            ? ({
                academics: application.studiesInfo ?? {},
                trades: application.tradePreferences ?? {},
                extracurricular: application.extracurricular ?? {},
              } as StudiesTradesData)
            : undefined,
        essayAdditional: application.essay
          ? {
              essay: application.essay,
              gedInterest:
                (
                  application.additionalQuestions as {
                    gedInterest?: boolean;
                  }
                )?.gedInterest ?? false,
              gemarahMaterial:
                (
                  application.additionalQuestions as {
                    gemarahMaterial?: string;
                  }
                )?.gemarahMaterial ?? "",
              chassidusMaterial:
                (
                  application.additionalQuestions as {
                    chassidusMaterial?: string;
                  }
                )?.chassidusMaterial ?? "",
              halachaMaterial:
                (
                  application.additionalQuestions as {
                    halachaMaterial?: string;
                  }
                )?.halachaMaterial ?? "",
              otherFactors:
                (
                  application.additionalQuestions as {
                    otherFactors?: string;
                  }
                )?.otherFactors ?? "",
            }
          : undefined,
      },
      completedSteps,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [application.id]);

  const showSaveNotification = useCallback((msg: string) => {
    setSaveMessage(msg);
    setTimeout(() => setSaveMessage(null), 3000);
  }, []);

  // "Next" triggers the current step's form submit, which saves and then advances
  const handleNext = useCallback(() => {
    if (formRef.current) {
      formRef.current.requestSubmit();
    }
  }, []);

  const isSubmitted = application.status !== "DRAFT";
  const currentStep = store.currentStep;

  const renderStep = () => {
    const stepProps = {
      applicationId: application.id,
      readOnly: isSubmitted,
      formRef,
      onSaved: () => {
        showSaveNotification("Progress saved");
        // Advance to next step after save
        if (currentStep < 10) {
          store.goToNextStep();
          // Scroll to top so user sees the new step
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      },
    };

    switch (currentStep) {
      case 1:
        return <StudentInfoStep {...stepProps} />;
      case 2:
        return <HebrewNameStep {...stepProps} />;
      case 3:
        return <ParentsInfoStep {...stepProps} />;
      case 4:
        return <FamilyInfoStep {...stepProps} />;
      case 5:
        return <SchoolHistoryStep {...stepProps} />;
      case 6:
        return <ParentQuestionsStep {...stepProps} />;
      case 7:
        return <ApplicantAssessmentStep {...stepProps} />;
      case 8:
        return <StudiesTradesStep {...stepProps} />;
      case 9:
        return <EssayAdditionalStep {...stepProps} />;
      case 10:
        return (
          <ReviewSubmitStep
            {...stepProps}
            application={application}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {isSubmitted ? "Application" : "Application Form"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {application.referenceNumber} &middot; {application.academicYear}
              {isSubmitted && (
                <span className="ml-2 inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                  <Check className="h-3 w-3" />
                  Submitted
                </span>
              )}
            </p>
          </div>
          {saveMessage && (
            <div className="flex items-center gap-1.5 text-sm text-emerald-600 animate-fade-in">
              <Check className="h-4 w-4" />
              {saveMessage}
            </div>
          )}
        </div>
      </div>

      {/* Progress Steps */}
      <div className="rounded-xl border bg-card p-4 sm:p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">
            Step {currentStep} of 10
          </span>
          <span className="text-sm text-muted-foreground">
            {Math.round((currentStep / 10) * 100)}%
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-muted rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / 10) * 100}%` }}
          />
        </div>

        {/* Step labels */}
        <div className="hidden sm:grid grid-cols-10 gap-1">
          {STEP_LABELS.map((label, idx) => {
            const stepNum = idx + 1;
            const isActive = stepNum === currentStep;
            const isComplete = store.completedSteps.has(stepNum);

            return (
              <button
                key={label}
                type="button"
                onClick={() => store.setCurrentStep(stepNum)}
                className={cn(
                  "flex flex-col items-center gap-1 py-2 px-1 rounded-lg transition-all text-center",
                  isActive && "bg-primary/10",
                  !isActive && "hover:bg-muted"
                )}
              >
                <div
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all",
                    isActive &&
                      "bg-primary text-primary-foreground",
                    isComplete &&
                      !isActive &&
                      "bg-emerald-500 text-white",
                    !isActive &&
                      !isComplete &&
                      "bg-muted text-muted-foreground"
                  )}
                >
                  {isComplete && !isActive ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    stepNum
                  )}
                </div>
                <span
                  className={cn(
                    "text-[10px] leading-tight",
                    isActive
                      ? "text-primary font-medium"
                      : "text-muted-foreground"
                  )}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Mobile step indicator */}
        <div className="sm:hidden">
          <p className="text-sm font-medium text-primary">
            {STEP_LABELS[currentStep - 1]}
          </p>
        </div>
      </div>

      {/* Step Content */}
      <div className="rounded-xl border bg-card p-4 sm:p-6 lg:p-8 animate-slide-up">
        {renderStep()}
      </div>

      {/* Navigation — single Next button that saves + advances */}
      {!isSubmitted && (
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="outline"
            onClick={() => store.goToPrevStep()}
            disabled={currentStep === 1 || store.isSaving}
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back
          </Button>

          <div className="flex items-center gap-3">
            {store.isSaving && (
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Saving...
              </span>
            )}
            {currentStep < 10 && (
              <Button
                onClick={handleNext}
                disabled={store.isSaving}
                className="shadow-md shadow-primary/20"
              >
                {store.isSaving ? (
                  <>
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
