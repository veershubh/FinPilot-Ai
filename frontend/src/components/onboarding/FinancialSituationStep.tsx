"use client";

import React from "react";
import { PiggyBank, CreditCard, Receipt, Landmark, ShieldCheck, FileText, ArrowRight, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { OnboardingData } from "@/app/(auth)/onboarding/page";

interface Props {
  data: OnboardingData;
  updateData: (d: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function FinancialSituationStep({ data, updateData, onNext, onBack }: Props) {
  const savings = Number(data.currentSavings) || 0;
  const debt = Number(data.currentDebt) || 0;
  const netWorth = savings - debt;

  return (
    <div className="max-w-lg">
      <h2 className="text-3xl font-bold text-white mb-2">Financial Situation</h2>
      <p className="text-sm text-[#94A3B8] mb-8">
        Help us understand your current financial standing for accurate AI analysis.
      </p>

      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Current Savings"
            type="number"
            value={data.currentSavings}
            onChange={(e) => updateData({ currentSavings: e.target.value })}
            placeholder="e.g., 200000"
            icon={<PiggyBank className="w-4 h-4" />}
          />
          <Input
            label="Current Debt"
            type="number"
            value={data.currentDebt}
            onChange={(e) => updateData({ currentDebt: e.target.value })}
            placeholder="e.g., 50000"
            icon={<CreditCard className="w-4 h-4" />}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Monthly Expenses"
            type="number"
            value={data.monthlyExpenses}
            onChange={(e) => updateData({ monthlyExpenses: e.target.value })}
            placeholder="e.g., 25000"
            icon={<Receipt className="w-4 h-4" />}
          />
          <Input
            label="Active Loans"
            type="number"
            value={data.loans}
            onChange={(e) => updateData({ loans: e.target.value })}
            placeholder="e.g., 0"
            icon={<Landmark className="w-4 h-4" />}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-white">Credit Card Usage</label>
            <select
              value={data.creditCardUsage}
              onChange={(e) => updateData({ creditCardUsage: e.target.value })}
              className="w-full rounded-xl border border-[#1F2937] bg-[#0F172A] px-4 py-3 text-sm text-white appearance-none focus:outline-none focus:border-[#10B981]/50 hover:border-[#374151] transition-all cursor-pointer"
            >
              <option value="" className="bg-[#0F172A]">Select usage</option>
              <option value="none" className="bg-[#0F172A]">No credit card</option>
              <option value="low" className="bg-[#0F172A]">Low (0-30%)</option>
              <option value="moderate" className="bg-[#0F172A]">Moderate (30-60%)</option>
              <option value="high" className="bg-[#0F172A]">High (60%+)</option>
            </select>
          </div>
          <Input
            label="Emergency Fund"
            type="number"
            value={data.emergencyFund}
            onChange={(e) => updateData({ emergencyFund: e.target.value })}
            placeholder="e.g., 100000"
            icon={<ShieldCheck className="w-4 h-4" />}
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-white">Notes (Optional)</label>
          <textarea
            value={data.notes}
            onChange={(e) => updateData({ notes: e.target.value })}
            placeholder="Any additional financial details..."
            rows={3}
            className="w-full rounded-xl border border-[#1F2937] bg-[#0F172A] px-4 py-3 text-sm text-white placeholder-[#64748B] focus:outline-none focus:border-[#10B981]/50 hover:border-[#374151] transition-all resize-none"
          />
        </div>

        {/* Live summary card */}
        {(savings > 0 || debt > 0) && (
          <div className="rounded-xl border border-[#1F2937] bg-[#0B1020] p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-[#10B981]" />
              <p className="text-xs font-semibold text-[#10B981] uppercase tracking-wider">Live Summary</p>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-lg font-bold text-[#10B981]">₹{savings.toLocaleString("en-IN")}</p>
                <p className="text-[10px] text-[#64748B]">Savings</p>
              </div>
              <div>
                <p className="text-lg font-bold text-[#EF4444]">₹{debt.toLocaleString("en-IN")}</p>
                <p className="text-[10px] text-[#64748B]">Debt</p>
              </div>
              <div>
                <p className={`text-lg font-bold ${netWorth >= 0 ? "text-[#10B981]" : "text-[#EF4444]"}`}>
                  ₹{Math.abs(netWorth).toLocaleString("en-IN")}
                </p>
                <p className="text-[10px] text-[#64748B]">Net Worth</p>
              </div>
            </div>
          </div>
        )}
      </div>

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
