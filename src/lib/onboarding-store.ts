'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface OnboardingState {
  hasCompletedOnboarding: boolean;
  currentStep: number;
}

interface OnboardingActions {
  completeOnboarding: () => void;
  setStep: (n: number) => void;
  resetOnboarding: () => void;
}

export const useOnboardingStore = create<OnboardingState & OnboardingActions>()(
  persist(
    (set) => ({
      hasCompletedOnboarding: false,
      currentStep: 0,

      completeOnboarding: () =>
        set({ hasCompletedOnboarding: true, currentStep: 0 }),

      setStep: (n: number) => set({ currentStep: n }),

      resetOnboarding: () =>
        set({ hasCompletedOnboarding: false, currentStep: 0 }),
    }),
    {
      name: 'math-genius-onboarding',
    }
  )
);
