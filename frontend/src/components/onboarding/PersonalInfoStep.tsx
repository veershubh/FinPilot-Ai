"use client";

import React from "react";
import { User, Briefcase, Globe, Banknote, ArrowRight, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { OnboardingData } from "@/app/(auth)/onboarding/page";

interface Props {
  data: OnboardingData;
  updateData: (d: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const occupations = ["Student", "Employee", "Self-Employed", "Freelancer", "Business Owner", "Retired", "Other"];
const countries = ["India", "United States", "United Kingdom", "Canada", "Australia", "Germany", "Other"];
const currencies = [
  { code: "INR", symbol: "₹" },
  { code: "USD", symbol: "$" },
  { code: "GBP", symbol: "£" },
  { code: "EUR", symbol: "€" },
  { code: "CAD", symbol: "C$" },
  { code: "AUD", symbol: "A$" },
];

export function PersonalInfoStep({ data, updateData, onNext, onBack }: Props) {
  return (
    <div className="max-w-lg">
      <h2 className="text-3xl font-bold text-white mb-2">Let&apos;s Know You Better</h2>
      <p className="text-sm text-[#94A3B8] mb-8">
        We need a few basic details to tailor your AI financial insights and ensure regulatory compliance.
      </p>

      <div className="space-y-5">
        <Input
          label="Full Name"
          value={data.fullName}
          onChange={(e) => updateData({ fullName: e.target.value })}
          placeholder="e.g., Vaishnavi Sharma"
          icon={<User className="w-4 h-4" />}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Age"
            type="number"
            value={data.age}
            onChange={(e) => updateData({ age: e.target.value })}
            placeholder="e.g., 25"
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-white">Occupation</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#64748B]">
                <Briefcase className="w-4 h-4" />
              </div>
              <select
                value={data.occupation}
                onChange={(e) => updateData({ occupation: e.target.value })}
                className="w-full rounded-xl border border-[#1F2937] bg-[#0F172A] pl-11 pr-4 py-3 text-sm text-white appearance-none focus:outline-none focus:border-[#10B981]/50 hover:border-[#374151] transition-all cursor-pointer"
              >
                <option value="" className="bg-[#0F172A]">Select your role</option>
                {occupations.map((o) => (
                  <option key={o} value={o} className="bg-[#0F172A]">{o}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-white">Country</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#64748B]">
                <Globe className="w-4 h-4" />
              </div>
              <select
                value={data.country}
                onChange={(e) => updateData({ country: e.target.value })}
                className="w-full rounded-xl border border-[#1F2937] bg-[#0F172A] pl-11 pr-4 py-3 text-sm text-white appearance-none focus:outline-none focus:border-[#10B981]/50 hover:border-[#374151] transition-all cursor-pointer"
              >
                <option value="" className="bg-[#0F172A]">Select country</option>
                {countries.map((c) => (
                  <option key={c} value={c} className="bg-[#0F172A]">{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-white">Currency</label>
            <select
              value={data.currency}
              onChange={(e) => updateData({ currency: e.target.value })}
              className="w-full rounded-xl border border-[#1F2937] bg-[#0F172A] px-4 py-3 text-sm text-white appearance-none focus:outline-none focus:border-[#10B981]/50 hover:border-[#374151] transition-all cursor-pointer"
            >
              {currencies.map((c) => (
                <option key={c.code} value={c.code} className="bg-[#0F172A]">{c.symbol} {c.code}</option>
              ))}
            </select>
          </div>
        </div>

        <Input
          label={`Monthly Income (${data.currency})`}
          type="number"
          value={data.monthlyIncome}
          onChange={(e) => updateData({ monthlyIncome: e.target.value })}
          placeholder="e.g., 50000"
          icon={<Banknote className="w-4 h-4" />}
          hint="Gross monthly income before taxes"
        />
      </div>

      {/* Buttons */}
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
