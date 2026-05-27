"use client";

import React from "react";

interface StepSidebarProps {
  currentStep: number;
}

const steps = [
  { number: 1, label: "Personal Info" },
  { number: 2, label: "Spending Habits" },
  { number: 3, label: "Financial Situation" },
  { number: 4, label: "Goals" },
  { number: 5, label: "Priorities" },
];

export function StepSidebar({ currentStep }: StepSidebarProps) {
  return (
    <nav className="space-y-1">
      {steps.map((step) => {
        const isActive = step.number === currentStep;
        const isCompleted = step.number < currentStep;

        return (
          <div
            key={step.number}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              isActive
                ? "bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20"
                : isCompleted
                ? "text-[#10B981]/60"
                : "text-[#64748B]"
            }`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                isActive
                  ? "bg-[#10B981] text-[#050816]"
                  : isCompleted
                  ? "bg-[#10B981]/20 text-[#10B981]"
                  : "bg-[#1F2937] text-[#64748B]"
              }`}
            >
              {isCompleted ? "✓" : step.number}
            </div>
            <span>{step.label}</span>
          </div>
        );
      })}
    </nav>
  );
}
