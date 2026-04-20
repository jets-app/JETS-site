import { create } from "zustand";
import type { ApplicationFormData } from "@/lib/validators/application";

interface ApplicationFormState {
  applicationId: string | null;
  currentStep: number;
  formData: ApplicationFormData;
  isDirty: boolean;
  isSaving: boolean;
  lastSavedAt: Date | null;
  completedSteps: Set<number>;

  // Actions
  setApplicationId: (id: string) => void;
  setCurrentStep: (step: number) => void;
  setStepData: <K extends keyof ApplicationFormData>(
    key: K,
    data: ApplicationFormData[K]
  ) => void;
  setIsDirty: (dirty: boolean) => void;
  setIsSaving: (saving: boolean) => void;
  setLastSavedAt: (date: Date) => void;
  markStepComplete: (step: number) => void;
  markStepIncomplete: (step: number) => void;
  goToNextStep: () => void;
  goToPrevStep: () => void;
  reset: () => void;
  hydrateFromApplication: (data: {
    id: string;
    currentStep: number;
    formData: ApplicationFormData;
    completedSteps: number[];
  }) => void;
}

const initialState = {
  applicationId: null as string | null,
  currentStep: 1,
  formData: {} as ApplicationFormData,
  isDirty: false,
  isSaving: false,
  lastSavedAt: null as Date | null,
  completedSteps: new Set<number>(),
};

export const useApplicationFormStore = create<ApplicationFormState>(
  (set, get) => ({
    ...initialState,

    setApplicationId: (id) => set({ applicationId: id }),

    setCurrentStep: (step) =>
      set({ currentStep: Math.max(1, Math.min(9, step)) }),

    setStepData: (key, data) =>
      set((state) => ({
        formData: { ...state.formData, [key]: data },
        isDirty: true,
      })),

    setIsDirty: (dirty) => set({ isDirty: dirty }),
    setIsSaving: (saving) => set({ isSaving: saving }),
    setLastSavedAt: (date) => set({ lastSavedAt: date }),

    markStepComplete: (step) =>
      set((state) => {
        const newSet = new Set(state.completedSteps);
        newSet.add(step);
        return { completedSteps: newSet };
      }),

    markStepIncomplete: (step) =>
      set((state) => {
        const newSet = new Set(state.completedSteps);
        newSet.delete(step);
        return { completedSteps: newSet };
      }),

    goToNextStep: () =>
      set((state) => ({
        currentStep: Math.min(9, state.currentStep + 1),
      })),

    goToPrevStep: () =>
      set((state) => ({
        currentStep: Math.max(1, state.currentStep - 1),
      })),

    reset: () => set({ ...initialState, completedSteps: new Set() }),

    hydrateFromApplication: (data) =>
      set({
        applicationId: data.id,
        currentStep: data.currentStep,
        formData: data.formData,
        completedSteps: new Set(data.completedSteps),
        isDirty: false,
      }),
  })
);
