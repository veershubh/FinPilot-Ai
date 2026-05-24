"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calculator, Wallet, BarChart3, MessageSquare } from "lucide-react";

const actions = [
  { label: "Analyze Purchase", description: "EMI vs Full Payment", href: "/emi-analyzer", icon: Calculator, color: "bg-[#10B981]", shadow: "shadow-[#10B981]/20" },
  { label: "Plan Budget", description: "Optimize spending", href: "/budget-planner", icon: Wallet, color: "bg-[#9333EA]", shadow: "shadow-[#9333EA]/20" },
  { label: "View Insights", description: "Financial analytics", href: "/insights", icon: BarChart3, color: "bg-[#F59E0B]", shadow: "shadow-[#F59E0B]/20" },
  { label: "Ask AI", description: "Chat with FinPilot", href: "/ai-chat", icon: MessageSquare, color: "bg-[#3B82F6]", shadow: "shadow-[#3B82F6]/20" },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action, index) => {
        const Icon = action.icon;
        return (
          <motion.div key={action.href} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: index * 0.1 }}>
            <Link
              href={action.href}
              className="block p-5 rounded-2xl border border-[#1F2937] bg-[#111827] hover:bg-[#162033] hover:border-[#374151] transition-all duration-300 group hover:-translate-y-0.5"
            >
              <div className={`w-10 h-10 rounded-xl ${action.color} flex items-center justify-center shadow-lg ${action.shadow} mb-3 group-hover:scale-105 transition-transform`}>
                <Icon className="w-5 h-5 text-[#050816]" />
              </div>
              <p className="text-sm font-semibold text-white">{action.label}</p>
              <p className="text-xs text-[#64748B] mt-0.5">{action.description}</p>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
