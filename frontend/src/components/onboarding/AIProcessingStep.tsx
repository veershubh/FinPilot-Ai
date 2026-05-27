"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { ArrowRight, Sparkles, BarChart2, CreditCard, TrendingUp, Zap, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/Button"

export function AIProcessingStep({ onComplete }: { onComplete: () => void }) {
  // Sequence of messages to display
  const messages = [
    "Analyzing financial patterns...",
    "Building AI profile...",
    "Creating personalized recommendations...",
    "Generating affordability models...",
    "Finalizing dashboard configuration...",
  ];

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (current < messages.length) {
      const timer = setTimeout(() => setCurrent((c) => c + 1), 1500);
      return () => clearTimeout(timer);
    } else {
      // All messages shown, proceed after a short pause
      const finalTimer = setTimeout(() => onComplete(), 800);
      return () => clearTimeout(finalTimer);
    }
  }, [current, onComplete]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#050816] relative overflow-hidden">
      {/* Soft animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0B1020] via-[#111827] to-[#050816] opacity-70" />
      {/* Floating particles (simple CSS) */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-20 w-3 h-3 bg-[#10B981]/30 rounded-full animate-pulse" />
        <div className="absolute bottom-20 right-16 w-4 h-4 bg-[#9333EA]/30 rounded-full animate-pulse delay-2000" />
        <div className="absolute top-1/2 left-1/3 w-2 h-2 bg-[#059669]/30 rounded-full animate-pulse delay-1500" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="z-10 flex flex-col items-center"
      >
        <Sparkles className="w-12 h-12 text-[#10B981] mb-4" />
        <h2 className="text-2xl font-semibold text-white mb-2">FinPilot AI is learning…</h2>
        <p className="text-[#94A3B8] max-w-md mb-6">
          {messages[current] || "Wrapping up..."}
        </p>
        <div className="w-48 h-2 bg-[#1F2937] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#10B981] to-[#059669]"
            animate={{ width: `${((current + 1) / messages.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <Button
          variant="primary"
          size="lg"
          className="mt-6"
          disabled={current < messages.length}
          onClick={onComplete}
        >
          {current >= messages.length ? "Continue" : "Please wait..."}
          <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </motion.div>
    </div>
  )
}
