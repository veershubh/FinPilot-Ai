"use client";

import React from "react";
import { motion } from "framer-motion";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Card } from "@/components/ui/Card";
import { Wallet, Building2, Gem, Landmark } from "lucide-react";

const planned = [
  { icon: Building2, label: "Real Estate", desc: "Track property values and rental income" },
  { icon: Gem, label: "Investments", desc: "Stocks, mutual funds, gold, and crypto" },
  { icon: Landmark, label: "Fixed Deposits", desc: "Bank FDs, RDs, and bonds" },
  { icon: Wallet, label: "Other Assets", desc: "Vehicles, valuables, and savings" },
];

export default function AssetsPage() {
  return (
    <PageWrapper title="Assets" subtitle="Track and manage your asset portfolio">
      <div className="flex flex-col items-center justify-center py-12">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="text-center mb-12">
          <div className="w-20 h-20 rounded-3xl bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center mx-auto mb-6">
            <Wallet className="w-10 h-10 text-[#10B981]" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Coming Soon</h2>
          <p className="text-[#94A3B8] max-w-md mx-auto text-sm">
            The Assets module will help you track all your investments, properties, and valuables in one place with AI-powered growth projections.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl w-full">
          {planned.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }}>
                <Card hover className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-[#10B981]/10 text-[#10B981]"><Icon className="w-5 h-5" /></div>
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
