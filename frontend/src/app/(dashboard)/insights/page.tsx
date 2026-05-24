"use client";

import React from "react";
import { motion } from "framer-motion";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Card } from "@/components/ui/Card";
import { BarChart3, LineChart, Activity, Brain } from "lucide-react";

const planned = [
  { icon: LineChart, label: "Income vs Expenses", desc: "Track and visualize your financial balance over time" },
  { icon: Activity, label: "Financial Pulse", desc: "Real-time monitoring of your financial health indicators" },
  { icon: BarChart3, label: "Comparative Analysis", desc: "Benchmark your finances against healthy targets" },
  { icon: Brain, label: "AI-Powered Insights", desc: "Personalized recommendations based on your patterns" },
];

export default function InsightsPage() {
  return (
    <PageWrapper title="Financial Insights" subtitle="Analytics and intelligence for your finances">
      <div className="flex flex-col items-center justify-center py-12">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="text-center mb-12">
          <div className="w-20 h-20 rounded-3xl bg-[#F59E0B]/10 border border-[#F59E0B]/20 flex items-center justify-center mx-auto mb-6">
            <BarChart3 className="w-10 h-10 text-[#F59E0B]" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Coming Soon</h2>
          <p className="text-[#94A3B8] max-w-md mx-auto text-sm">
            Financial Insights will give you deep analytics, trend visualizations, and AI-driven intelligence.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl w-full">
          {planned.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }}>
                <Card hover className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-[#F59E0B]/10 text-[#F59E0B]"><Icon className="w-5 h-5" /></div>
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
