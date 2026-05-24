"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, BarChart3, Bot } from "lucide-react";
import { Button } from "@/components/ui/Button";

const pills = [
  { label: "Smart Budgeting", icon: Sparkles },
  { label: "AI Intelligence", icon: BarChart3 },
  { label: "AI Advisor", icon: Bot },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#10B981]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-16 text-center">
        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight max-w-4xl mx-auto"
        >
          Welcome to FinPilot AI: Your AI{" "}
          <br className="hidden md:block" />
          Co-Pilot for{" "}
          <span className="text-gradient-green">Smarter Financial Decisions</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mt-6 text-base md:text-lg text-[#94A3B8] max-w-2xl mx-auto leading-relaxed"
        >
          Master your money with precision-engineered AI intelligence. Seamlessly track expenses,
          optimize EMIs, and build a future-proof budget with real-time financial insights.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 flex items-center justify-center gap-4"
        >
          <Link href="/signup">
            <Button variant="primary" size="lg">Get Started</Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" size="lg">Watch Demo</Button>
          </Link>
        </motion.div>

        {/* Pill badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="mt-8 flex items-center justify-center gap-3 flex-wrap"
        >
          {pills.map((pill) => {
            const Icon = pill.icon;
            return (
              <div
                key={pill.label}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#1F2937] bg-[#111827]/60 text-sm text-[#94A3B8]"
              >
                <Icon className="w-3.5 h-3.5 text-[#10B981]" />
                {pill.label}
              </div>
            );
          })}
        </motion.div>

        {/* Hero visual placeholder — glass dashboard mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-16 relative max-w-4xl mx-auto"
        >
          <div className="rounded-2xl border border-[#1F2937] bg-[#111827]/80 backdrop-blur-xl p-6 md:p-8 shadow-2xl">
            {/* Fake dashboard header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
              </div>
              <div className="flex-1 flex items-center gap-2">
                <div className="px-3 py-1 rounded text-[10px] font-semibold text-[#10B981] bg-[#10B981]/10">BUDGET</div>
                <div className="px-3 py-1 rounded text-[10px] font-medium text-[#64748B] hover:text-[#94A3B8] cursor-pointer">SCORE</div>
                <div className="px-3 py-1 rounded text-[10px] font-medium text-[#64748B]">98%</div>
              </div>
            </div>

            {/* Mock content grid */}
            <div className="grid grid-cols-3 gap-4">
              {/* Chart area */}
              <div className="col-span-2 h-48 rounded-xl bg-[#0B1020] border border-[#1F2937] p-4 flex items-end gap-2">
                <div className="flex items-end gap-[6px] h-full w-full">
                  {[40, 55, 35, 70, 60, 85, 50, 75].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t bg-gradient-to-t from-[#10B981]/30 to-[#10B981] transition-all"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>

              {/* Side cards */}
              <div className="space-y-4">
                <div className="rounded-xl border border-[#1F2937] bg-[#0B1020] p-4">
                  <p className="text-[10px] text-[#64748B] mb-1">Savings Tracker</p>
                  <p className="text-lg font-bold text-[#10B981]">&#8377;45,200</p>
                </div>
                <div className="rounded-xl border border-[#1F2937] bg-[#0B1020] p-4">
                  <p className="text-[10px] text-[#64748B] mb-1">EMI Due</p>
                  <p className="text-lg font-bold text-[#EF4444]">&#8377;12,400</p>
                  <p className="text-[10px] text-[#64748B] mt-1">Home Loan &middot; SBI</p>
                </div>
              </div>
            </div>
          </div>

          {/* Glow behind dashboard */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-[#10B981]/10 blur-[60px] rounded-full pointer-events-none" />
        </motion.div>
      </div>
    </section>
  );
}
