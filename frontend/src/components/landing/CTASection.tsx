"use client";
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export function CTASection() {
  return (
    <section className="py-20 bg-[#0B1020]/50">
      <div className="max-w-2xl mx-auto text-center px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl font-bold text-white mb-4"
        >
          Ready to supercharge your finances?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-[#94A3B8] mb-8"
        >
          Join thousands of users who trust FinPilot AI to make smarter financial decisions every day.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Link href="/signup" passHref>
            <Button variant="primary" size="lg">
              Get Started
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
