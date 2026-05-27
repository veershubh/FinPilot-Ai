"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck, Plane, Laptop, Car, Home, GraduationCap,
  Umbrella, Sparkles, ArrowRight, ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { OnboardingData } from "@/app/(auth)/onboarding/page";

interface Props {
  data: OnboardingData;
  updateData: (d: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const goals = [
  { id: "emergency", label: "Emergency Fund", icon: ShieldCheck, color: "#10B981" },
  { id: "travel", label: "Travel", icon: Plane, color: "#3B82F6" },
  { id: "laptop", label: "Laptop", icon: Laptop, color: "#9333EA" },
  { id: "car", label: "Car", icon: Car, color: "#F59E0B" },
  { id: "house", label: "House", icon: Home, color: "#EF4444" },
  { id: "education", label: "Education", icon: GraduationCap, color: "#EC4899" },
  { id: "retirement", label: "Retirement", icon: Umbrella, color: "#06B6D4" },
  { id: "custom", label: "Custom Goal", icon: Sparkles, color: "#10B981" },
];

export function FinancialGoalsStep({ data, updateData, onNext, onBack }: Props) {
  const toggle = (id: string) => {
    const current = data.financialGoals;
    if (current.includes(id)) {
      updateData({ financialGoals: current.filter((g) => g !== id) });
    } else {
      updateData({ financialGoals: [...current, id] });
    }
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-3xl font-bold text-white mb-2">Financial Goals</h2>
      <p className="text-sm text-[#94A3B8] mb-8">
        What are you saving for? Select your goals and we&apos;ll create personalized savings plans.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {goals.map((goal, i) => {
          const Icon = goal.icon;
          const selected = data.financialGoals.includes(goal.id);
          return (
            <motion.button
              key={goal.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => toggle(goal.id)}
              className={`
                flex flex-col items-center gap-3 p-5 rounded-2xl border transition-all duration-200 cursor-pointer group
                ${selected
                  ? "border-[#10B981]/40 bg-[#10B981]/5"
                  : "border-[#1F2937] bg-[#111827] hover:border-[#374151] hover:bg-[#162033]"
                }
              `}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all"
                style={{
                  backgroundColor: selected ? `${goal.color}20` : "#0B1020",
                  color: selected ? goal.color : "#64748B",
                }}
              >
                <Icon className="w-6 h-6" />
              </div>
              <span className={`text-sm font-medium text-center ${selected ? "text-white" : "text-[#94A3B8]"}`}>
                {goal.label}
              </span>
              {selected && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  <div className="w-2 h-2 rounded-full bg-[#10B981]" />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      {data.financialGoals.length > 0 && (
        <p className="text-xs text-[#64748B] mt-4">{data.financialGoals.length} goals selected</p>
      )}

      <div className="flex items-center justify-between mt-8">
        <Button variant="ghost" size="md" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <Button variant="primary" size="lg" onClick={onNext}>
          Continue <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
