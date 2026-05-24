"use client";

import React from "react";
import { motion } from "framer-motion";

export function LiveInsightSection() {
  return (
    <section className="py-20 bg-[#0B1020]/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left — Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#10B981]/20 bg-[#10B981]/5 mb-6">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span className="text-xs font-semibold text-[#10B981] uppercase tracking-wider">Live Insight</span>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-4">
              Experience Proactive Financial Intelligence
            </h2>

            <p className="text-[#94A3B8] leading-relaxed mb-8">
              FinPilot silently streams every transaction to your AI Co-Pilot.
              Monitor your spending patterns in real-time to prevent financial
              challenges before they happen.
            </p>

            {/* AI Insight bubble */}
            <div className="rounded-xl border border-[#10B981]/20 bg-[#10B981]/5 p-4 max-w-md">
              <p className="text-sm text-[#94A3B8] leading-relaxed">
                &ldquo;Your food spending increased by{" "}
                <span className="text-[#10B981] font-semibold">17%</span>{" "}
                this month. Consider reducing eating out expenses to maintain
                your 25% savings goal.&rdquo;
              </p>
            </div>
          </motion.div>

          {/* Right — Visual */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="rounded-2xl border border-[#1F2937] bg-[#111827] p-6 shadow-2xl">
              {/* Mini dashboard */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-white">Spending Analytics</p>
                <span className="text-xs text-[#64748B]">This Month</span>
              </div>

              {/* Bars */}
              <div className="space-y-3">
                {[
                  { label: "Housing", pct: 35, color: "bg-[#10B981]" },
                  { label: "Food", pct: 25, color: "bg-[#F59E0B]" },
                  { label: "Transport", pct: 15, color: "bg-[#3B82F6]" },
                  { label: "Shopping", pct: 12, color: "bg-[#9333EA]" },
                  { label: "Others", pct: 13, color: "bg-[#64748B]" },
                ].map((item) => (
                  <div key={item.label} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#94A3B8]">{item.label}</span>
                      <span className="text-[#64748B]">{item.pct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#0B1020]">
                      <motion.div
                        className={`h-full rounded-full ${item.color}`}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${item.pct}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating glow */}
            <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-[#10B981]/8 rounded-full blur-[60px] pointer-events-none" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
