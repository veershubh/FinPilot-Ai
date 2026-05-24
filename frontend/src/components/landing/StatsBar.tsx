"use client";

import React from "react";
import { motion } from "framer-motion";

const stats = [
  { value: "50K+", label: "Active Users" },
  { value: "\u20B9100M+", label: "Wealth Managed" },
  { value: "95%", label: "AI Accuracy" },
  { value: "4.9", label: "User Rating" },
];

export function StatsBar() {
  return (
    <section className="py-16 bg-[#050816]">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="text-center"
            >
              <p className="text-3xl md:text-4xl font-bold text-[#10B981]">{stat.value}</p>
              <p className="text-sm text-[#64748B] mt-1 uppercase tracking-wider">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
