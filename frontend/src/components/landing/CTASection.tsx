"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";

export function CTASection() {
  return (
    <section className="py-20 bg-[#050816]">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl border border-[#1F2937] bg-[#0B1020] overflow-hidden"
        >
          {/* Background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#10B981]/8 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative px-8 py-16 md:py-20 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Take Control of Your Financial Future
            </h2>
            <p className="text-[#94A3B8] max-w-lg mx-auto mb-8 leading-relaxed">
              Be in the vanguard of smart investors and savers who use FinPilot AI to navigate
              their financial journey with total clarity.
            </p>
            <Link href="/signup">
              <Button variant="primary" size="lg">
                Start Free Today
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
