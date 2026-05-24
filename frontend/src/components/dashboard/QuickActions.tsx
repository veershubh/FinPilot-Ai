/**
 * FinPilot AI - Quick Actions Component
 */

"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calculator, Wallet, BarChart3, MessageSquare } from "lucide-react";

const actions = [
  {
    label: "Analyze Purchase",
    description: "EMI vs Full Payment",
    href: "/emi-analyzer",
    icon: Calculator,
    gradient: "from-emerald-600 to-teal-600",
    shadow: "shadow-emerald-500/20",
  },
  {
    label: "Plan Budget",
    description: "Optimize spending",
    href: "/budget-planner",
    icon: Wallet,
    gradient: "from-violet-600 to-purple-600",
    shadow: "shadow-violet-500/20",
  },
  {
    label: "View Insights",
    description: "Financial analytics",
    href: "/insights",
    icon: BarChart3,
    gradient: "from-amber-600 to-orange-600",
    shadow: "shadow-amber-500/20",
  },
  {
    label: "Ask AI",
    description: "Chat with FinPilot",
    href: "/ai-chat",
    icon: MessageSquare,
    gradient: "from-blue-600 to-cyan-600",
    shadow: "shadow-blue-500/20",
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
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Link
              href={action.href}
              className={`
                block p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02]
                hover:bg-white/[0.05] hover:border-white/[0.12]
                transition-all duration-300 group hover:-translate-y-0.5
              `}
            >
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center shadow-lg ${action.shadow} mb-3 group-hover:scale-105 transition-transform`}
              >
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm font-semibold text-white">{action.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{action.description}</p>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
