"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Lock, Eye } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function WelcomeStep({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 relative">
      {/* Background glow */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] h-[400px] bg-[#10B981]/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Shield icon */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, type: "spring" }}
        className="mb-10"
      >
        <div className="w-28 h-28 rounded-full border-2 border-[#1F2937] bg-[#111827] flex items-center justify-center shadow-2xl relative">
          <div className="absolute inset-0 rounded-full border border-[#10B981]/20 animate-ping opacity-20" />
          <ShieldCheck className="w-12 h-12 text-[#10B981]" />
        </div>
      </motion.div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full max-w-md rounded-2xl border border-[#1F2937] bg-[#111827] p-8 text-center"
      >
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome to{" "}
          <br />
          FinPilot AI 🎉
        </h1>
        <p className="text-[#94A3B8] text-sm mb-8 leading-relaxed">
          Your AI financial co-pilot is ready to transform your wealth management.
        </p>

        <Button variant="primary" size="lg" className="w-full mb-3" onClick={onContinue}>
          Go to Onboarding <ArrowRight className="w-4 h-4" />
        </Button>

        <Link href="/dashboard">
          <Button variant="secondary" size="lg" className="w-full">
            Explore Dashboard
          </Button>
        </Link>

        {/* Badge */}
        <div className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#10B981]/20 bg-[#10B981]/5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
          <span className="text-xs font-semibold text-[#10B981] uppercase tracking-wider">Account Secured</span>
        </div>
      </motion.div>

      {/* Security badges */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-10 flex items-center gap-10"
      >
        {[
          { icon: Lock, label: "AES-256" },
          { icon: Eye, label: "SOC2 Type II" },
          { icon: ShieldCheck, label: "Privacy First" },
        ].map((b) => (
          <div key={b.label} className="flex flex-col items-center gap-2">
            <b.icon className="w-5 h-5 text-[#64748B]" />
            <span className="text-xs text-[#64748B]">{b.label}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
