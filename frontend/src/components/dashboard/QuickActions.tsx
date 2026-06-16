"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calculator, Wallet, BarChart3, MessageSquare, ArrowUpRight } from "lucide-react";

const actions = [
  {
    label: "Analyze Purchase",
    description: "EMI vs Full Payment",
    href: "/emi-analyzer",
    icon: Calculator,
    accent: "#10B981",
  },
  {
    label: "Manage Assets",
    description: "Track your wealth",
    href: "/assets",
    icon: Wallet,
    accent: "#8B5CF6",
  },
  {
    label: "View Strategy",
    description: "Financial goals",
    href: "/strategy",
    icon: BarChart3,
    accent: "#F59E0B",
  },
  {
    label: "Ask AI",
    description: "Chat with FinPilot",
    href: "/ai-assistant",
    icon: MessageSquare,
    accent: "#3B82F6",
  },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action, index) => {
        const Icon = action.icon;
        return (
          <motion.div
            key={action.href}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 + index * 0.08 }}
          >
            <Link
              href={action.href}
              className="group block p-5 rounded-2xl border border-[#1F2937] bg-[#111827] hover:border-[#374151] hover:bg-[#162033] transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
            >
              {/* Subtle gradient corner */}
              <div
                className="absolute top-0 right-0 w-20 h-20 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: `radial-gradient(circle at top right, ${action.accent}10, transparent)` }}
              />

              <div className="relative z-10">
                {/* Landing-page icon container: bordered + bg-elevated */}
                <div
                  className="w-11 h-11 rounded-xl border border-[#1F2937] bg-[#0B1020] flex items-center justify-center mb-3 group-hover:border-opacity-50 transition-all duration-300"
                  style={{ borderColor: undefined }}
                >
                  <Icon className="w-5 h-5 transition-colors duration-300" style={{ color: action.accent }} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">{action.label}</p>
                    <p className="text-[11px] text-[#64748B] mt-0.5">{action.description}</p>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#374151] group-hover:text-[#94A3B8] transition-colors opacity-0 group-hover:opacity-100" />
                </div>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
