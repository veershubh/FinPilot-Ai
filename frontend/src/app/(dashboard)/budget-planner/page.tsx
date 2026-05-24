"use client";

import React from "react";
import { motion } from "framer-motion";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Card } from "@/components/ui/Card";
import { Wallet, PieChart, TrendingDown, Target } from "lucide-react";

const planned = [
  { icon: PieChart, label: "Expense Categorization", desc: "Auto-categorize spending into needs, wants & savings" },
  { icon: TrendingDown, label: "Spending Trends", desc: "Visualize monthly trends and identify patterns" },
  { icon: Target, label: "Budget Goals", desc: "Set monthly budget limits and track adherence" },
  { icon: Wallet, label: "Smart Suggestions", desc: "AI-powered tips to optimize your budget" },
];

export default function BudgetPlannerPage() {
  return (
    <PageWrapper title="Budget Planner" subtitle="Optimize your monthly spending">
      <div className="flex flex-col items-center justify-center py-12">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="text-center mb-12">
          <div className="w-20 h-20 rounded-3xl bg-[#9333EA]/10 border border-[#9333EA]/20 flex items-center justify-center mx-auto mb-6">
            <Wallet className="w-10 h-10 text-[#9333EA]" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Coming Soon</h2>
          <p className="text-[#94A3B8] max-w-md mx-auto text-sm">
            The Budget Planner will help you track expenses, set budgets, and discover smarter ways to manage your money.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl w-full">
          {planned.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }}>
                <Card hover className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-[#9333EA]/10 text-[#9333EA]"><Icon className="w-5 h-5" /></div>
                    <div><p className="text-sm font-semibold text-white">{item.label}</p><p className="text-xs text-[#64748B] mt-0.5">{item.desc}</p></div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </PageWrapper>
  );
}
