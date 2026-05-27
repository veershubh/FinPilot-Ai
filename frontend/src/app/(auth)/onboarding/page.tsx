"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WelcomeStep } from "@/components/onboarding/WelcomeStep";
import { PersonalInfoStep } from "@/components/onboarding/PersonalInfoStep";
import { SpendingHabitsStep } from "@/components/onboarding/SpendingHabitsStep";
import { FinancialSituationStep } from "@/components/onboarding/FinancialSituationStep";
import { FinancialGoalsStep } from "@/components/onboarding/FinancialGoalsStep";
import { FinancialPrioritiesStep } from "@/components/onboarding/FinancialPrioritiesStep";
import { AIProcessingStep } from "@/components/onboarding/AIProcessingStep";
import { SuccessStep } from "@/components/onboarding/SuccessStep";
import { OnboardingLeftPanel } from "@/components/onboarding/OnboardingLeftPanel";
import { StepSidebar } from "@/components/onboarding/StepSidebar";

export interface OnboardingData {
  // Step 1
  fullName: string;
  age: string;
  occupation: string;
  country: string;
  currency: string;
  monthlyIncome: string;
  // Step 2
  spendingCategories: string[];
  // Step 3
  currentSavings: string;
  currentDebt: string;
  monthlyExpenses: string;
  loans: string;
  creditCardUsage: string;
  emergencyFund: string;
  notes: string;
  // Step 4
  financialGoals: string[];
  // Step 5
  priorities: string[];
}

const initialData: OnboardingData = {
  fullName: "", age: "", occupation: "", country: "", currency: "INR", monthlyIncome: "",
  spendingCategories: [],
  currentSavings: "", currentDebt: "", monthlyExpenses: "", loans: "", creditCardUsage: "", emergencyFund: "", notes: "",
  financialGoals: [],
  priorities: [],
};

type StepId = "welcome" | 1 | 2 | 3 | 4 | 5 | "processing" | "success";

export default function OnboardingPage() {
  const [step, setStep] = useState<StepId>("welcome");
  const [data, setData] = useState<OnboardingData>(initialData);

  const updateData = useCallback((partial: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...partial }));
  }, []);

  const next = useCallback(() => {
    setStep((prev) => {
      if (prev === "welcome") return 1;
      if (typeof prev === "number" && prev < 5) return (prev + 1) as StepId;
      if (prev === 5) return "processing";
      if (prev === "processing") return "success";
      return prev;
    });
  }, []);

  const back = useCallback(() => {
    setStep((prev) => {
      if (typeof prev === "number" && prev > 1) return (prev - 1) as StepId;
      if (prev === 1) return "welcome";
      return prev;
    });
  }, []);

  const numericStep = typeof step === "number" ? step : 0;
  const showSplitLayout = typeof step === "number";
  const showSidebar = typeof step === "number";

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Welcome / Processing / Success — full-width centered */}
      {!showSplitLayout && (
        <AnimatePresence mode="wait">
          <motion.div
            key={String(step)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="flex-1 flex"
          >
            {step === "welcome" && <WelcomeStep onContinue={next} />}
            {step === "processing" && <AIProcessingStep onComplete={next} />}
            {step === "success" && <SuccessStep userName={data.fullName} />}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Step 1-5 — split layout */}
      {showSplitLayout && (
        <div className="flex-1 flex">
          {/* Left — AI Preview Panel (hidden on mobile) */}
          <div className="hidden xl:flex w-[320px] shrink-0">
            <OnboardingLeftPanel currentStep={numericStep} data={data} />
          </div>

          {/* Sidebar steps */}
          {showSidebar && (
            <div className="hidden lg:block w-[200px] shrink-0 py-8 px-4">
              <StepSidebar currentStep={numericStep} />
            </div>
          )}

          {/* Main content */}
          <div className="flex-1 flex flex-col overflow-y-auto">
            {/* Progress bar */}
            <div className="sticky top-0 z-10 bg-[#050816]/80 backdrop-blur-xl px-8 py-4 border-b border-[#1F2937]/50">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-white">Step {numericStep} of 5</p>
                <p className="text-xs text-[#10B981] font-medium">{numericStep * 20}% Complete</p>
              </div>
              <div className="h-1.5 rounded-full bg-[#1F2937]">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-[#10B981] to-[#059669]"
                  animate={{ width: `${numericStep * 20}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
              <p className="text-[10px] text-[#64748B] mt-1.5">Estimated time: ~2 minutes</p>
            </div>

            {/* Step content */}
            <div className="flex-1 px-8 py-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={numericStep}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.35 }}
                >
                  {step === 1 && <PersonalInfoStep data={data} updateData={updateData} onNext={next} onBack={back} />}
                  {step === 2 && <SpendingHabitsStep data={data} updateData={updateData} onNext={next} onBack={back} />}
                  {step === 3 && <FinancialSituationStep data={data} updateData={updateData} onNext={next} onBack={back} />}
                  {step === 4 && <FinancialGoalsStep data={data} updateData={updateData} onNext={next} onBack={back} />}
                  {step === 5 && <FinancialPrioritiesStep data={data} updateData={updateData} onNext={next} onBack={back} />}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Right info panel (hidden on small screens) */}
          <div className="hidden 2xl:block w-[300px] shrink-0 p-6 border-l border-[#1F2937]/50">
            <RightInfoPanel step={numericStep} />
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Right Info Panel ─────────────────────────────────────────────────────── */

function RightInfoPanel({ step }: { step: number }) {
  const info: Record<number, { title: string; body: string }> = {
    1: { title: "Why this matters?", body: "FinPilot AI uses your profile to calibrate budget recommendations. Users who complete their full profile see 40% more accurate savings predictions within the first month." },
    2: { title: "Smart Categorization", body: "We use your spending habits to auto-categorize 90% of future transactions and build personalized budget limits." },
    3: { title: "Financial Snapshot", body: "Understanding your current situation helps our AI create a baseline for tracking improvement and identifying risks." },
    4: { title: "Goal-Driven AI", body: "Setting clear goals lets FinPilot AI create actionable savings plans and send smart alerts when you're on or off track." },
    5: { title: "Personalized Engine", body: "Your priorities determine which AI features activate first and how your dashboard is configured." },
  };

  const current = info[step] || info[1];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#1F2937] bg-[#111827] p-5">
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-5 h-5 text-[#10B981]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
          <h3 className="text-sm font-semibold text-white">{current.title}</h3>
        </div>
        <p className="text-xs text-[#94A3B8] leading-relaxed">{current.body}</p>
      </div>

      {/* Live status */}
      <div className="rounded-2xl border border-[#1F2937] bg-[#111827] p-5 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-[#10B981]/5 to-transparent pointer-events-none" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span className="text-xs font-semibold text-[#10B981]">Real-time Analysis Active</span>
          </div>
          <p className="text-[11px] text-[#64748B] leading-relaxed">
            Your data is encrypted using AES-256 and processed locally. Nothing is shared externally.
          </p>
        </div>
      </div>
    </div>
  );
}
