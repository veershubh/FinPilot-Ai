"use client";

import React from "react";
import { motion } from "framer-motion";

// Simple placeholder left panel showing AI avatar and step indicator
export function OnboardingLeftPanel({ currentStep, data }: { currentStep: number; data: any }) {
  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-6">
      {/* AI avatar placeholder */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-32 h-32 bg-[#111827] rounded-full flex items-center justify-center border border-[#1F2937]"
      >
        <span className="text-2xl text-[#10B981]">🤖</span>
      </motion.div>
      {/* Simple step progress visualization */}
      <div className="text-white text-sm">Step {currentStep} of 5</div>
      {/* Optionally show a preview of collected data */}
      <div className="mt-4 text-[#94A3B8] text-xs max-w-xs">
        {data.fullName && <div>Name: {data.fullName}</div>}
        {data.monthlyIncome && <div>Income: {data.monthlyIncome}</div>}
        {data.financialGoals?.length > 0 && <div>Goals: {data.financialGoals.join(", ")}</div>}
      </div>
    </div>
  );
}
