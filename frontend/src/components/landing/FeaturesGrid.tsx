"use client";

import React from "react";
import { motion } from "framer-motion";
import { Wallet, Calculator, Receipt, MessageSquare, Bot } from "lucide-react";

const features = [
  {
    icon: Wallet,
    title: "Smart Budget Planning",
    description: "AI-driven automated expense analysis tailored to your financial habits.",
  },
  {
    icon: Calculator,
    title: "EMI Analyzer",
    description: "Analyze interest and plan your EMI payment strategy intelligently.",
  },
  {
    icon: Receipt,
    title: "Expense Tracking",
    description: "Categorize 90% of your transactions automatically.",
  },
  {
    icon: Bot,
    title: "Financial Insights",
    description: "Deep-dive reports to understand your wealth growth trajectory.",
  },
  {
    icon: MessageSquare,
    title: "AI Chat Assistant",
    description: "Natural language queries for financial guidance, anytime.",
  },
];

export function FeaturesGrid() {
  return (
    <section className="py-20 bg-[#050816]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Comprehensive Intelligence for Your Wealth
          </h2>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="group rounded-2xl border border-[#1F2937] bg-[#111827] p-6 hover:border-[#374151] hover:bg-[#162033] transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-11 h-11 rounded-xl border border-[#1F2937] bg-[#0B1020] flex items-center justify-center mb-4 group-hover:border-[#10B981]/30 transition-colors">
                  <Icon className="w-5 h-5 text-[#10B981]" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-xs text-[#64748B] leading-relaxed">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
