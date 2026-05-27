"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  UtensilsCrossed, ShoppingBag, Plane, Tv, Music, Home,
  Receipt, TrendingUp, HeartPulse, ArrowRight, ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { OnboardingData } from "@/app/(auth)/onboarding/page";

interface Props {
  data: OnboardingData;
  updateData: (d: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const categories = [
  { id: "food", label: "Food", icon: UtensilsCrossed },
  { id: "shopping", label: "Shopping", icon: ShoppingBag },
  { id: "travel", label: "Travel", icon: Plane },
  { id: "subscriptions", label: "Subscriptions", icon: Tv },
  { id: "entertainment", label: "Entertainment", icon: Music },
  { id: "rent", label: "Rent", icon: Home },
  { id: "bills", label: "Bills", icon: Receipt },
  { id: "investments", label: "Investments", icon: TrendingUp },
  { id: "healthcare", label: "Healthcare", icon: HeartPulse },
];

export function SpendingHabitsStep({ data, updateData, onNext, onBack }: Props) {
  const toggle = (id: string) => {
    const current = data.spendingCategories;
    if (current.includes(id)) {
      updateData({ spendingCategories: current.filter((c) => c !== id) });
    } else {
      updateData({ spendingCategories: [...current, id] });
    }
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-3xl font-bold text-white mb-2">Spending Habits</h2>
      <p className="text-sm text-[#94A3B8] mb-8">
        Where do you usually spend most of your money? Select all that apply.
      </p>

      <div className="grid grid-cols-3 gap-3">
        {categories.map((cat, i) => {
          const Icon = cat.icon;
          const selected = data.spendingCategories.includes(cat.id);
          return (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => toggle(cat.id)}
              className={`
                flex flex-col items-center gap-2.5 p-5 rounded-2xl border transition-all duration-200 cursor-pointer
                ${selected
                  ? "border-[#10B981]/40 bg-[#10B981]/10 shadow-lg shadow-[#10B981]/10"
                  : "border-[#1F2937] bg-[#111827] hover:border-[#374151] hover:bg-[#162033]"
                }
              `}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                selected ? "bg-[#10B981]/20 text-[#10B981]" : "bg-[#0B1020] text-[#64748B]"
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-sm font-medium ${selected ? "text-[#10B981]" : "text-[#94A3B8]"}`}>
                {cat.label}
              </span>
              {selected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-5 h-5 rounded-full bg-[#10B981] flex items-center justify-center"
                >
                  <svg className="w-3 h-3 text-[#050816]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      {data.spendingCategories.length > 0 && (
        <p className="text-xs text-[#64748B] mt-4">{data.spendingCategories.length} categories selected</p>
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
