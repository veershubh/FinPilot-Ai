"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Smartphone,
  Laptop,
  Car,
  Home,
  CreditCard,
  Shield,
  TrendingUp,
  Repeat,
  GraduationCap,
  Banknote,
  Users,
  Briefcase,
  Plus
} from "lucide-react";
import { CommitmentTemplate } from "@/types/commitments";

export const COMMITMENT_TEMPLATES: CommitmentTemplate[] = [
  { label: "Phone EMI", category: "phone_emi", icon: "Smartphone", defaultMonths: 12, defaultRate: 0 },
  { label: "Laptop EMI", category: "laptop_emi", icon: "Laptop", defaultMonths: 18, defaultRate: 0 },
  { label: "Car Loan", category: "vehicle_loan", icon: "Car", defaultMonths: 60, defaultRate: 8.5 },
  { label: "Home Loan", category: "home_loan", icon: "Home", defaultMonths: 240, defaultRate: 8.4 },
  { label: "Credit Card EMI", category: "credit_card_emi", icon: "CreditCard", defaultMonths: 6, defaultRate: 18 },
  { label: "Insurance", category: "insurance", icon: "Shield", defaultMonths: 12, defaultRate: 0 },
  { label: "SIP", category: "sip", icon: "TrendingUp", defaultMonths: 120, defaultRate: 12 },
  { label: "Subscription", category: "subscription", icon: "Repeat", defaultMonths: 1, defaultRate: 0 },
  { label: "Education Loan", category: "education_loan", icon: "GraduationCap", defaultMonths: 84, defaultRate: 10 },
  { label: "Personal Loan", category: "personal_loan", icon: "Banknote", defaultMonths: 36, defaultRate: 14 },
  { label: "Family Expense", category: "family_expense", icon: "Users", defaultMonths: 1, defaultRate: 0 },
  { label: "Business Expense", category: "business_expense", icon: "Briefcase", defaultMonths: 1, defaultRate: 0 },
  { label: "Other", category: "other", icon: "Plus", defaultMonths: 12, defaultRate: 0 },
];

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Smartphone,
  Laptop,
  Car,
  Home,
  CreditCard,
  Shield,
  TrendingUp,
  Repeat,
  GraduationCap,
  Banknote,
  Users,
  Briefcase,
  Plus,
};

interface TemplatePickerProps {
  onSelect: (template: CommitmentTemplate) => void;
  selectedCategory?: string;
}

export function TemplatePicker({ onSelect, selectedCategory }: TemplatePickerProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {COMMITMENT_TEMPLATES.map((template, index) => {
        const Icon = iconMap[template.icon];
        const isSelected = selectedCategory === template.category;

        return (
          <motion.div
            key={template.category}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <button
              type="button"
              onClick={() => onSelect(template)}
              className={`
                relative w-full p-4 rounded-xl border transition-all
                flex flex-col items-center text-center gap-3
                ${isSelected
                  ? "border-[#3B82F6] bg-[#1E3A8A]/30"
                  : "border-[#1F2937] bg-[#111827] hover:bg-[#162033]"
                }
              `}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 w-3 h-3 bg-[#3B82F6] rounded-full" />
              )}
              <Icon className={`w-8 h-8 ${isSelected ? "text-[#3B82F6]" : "text-[#A1A1AA]"}`} />
              <span className={`text-sm font-medium ${isSelected ? "text-white" : "text-[#A1A1AA]"}`}>
                {template.label}
              </span>
              <div className="text-xs text-[#6B7280]">
                {template.defaultMonths} mo • {template.defaultRate}% APR
              </div>
            </button>
          </motion.div>
        );
      })}
    </div>
  );
}