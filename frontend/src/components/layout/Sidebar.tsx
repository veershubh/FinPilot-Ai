/**
 * FinPilot AI - Sidebar Navigation
 * ===================================
 * Fixed left sidebar with navigation links and branding.
 */

"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calculator,
  Wallet,
  BarChart3,
  MessageSquare,
  TrendingUp,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "EMI Analyzer", href: "/emi-analyzer", icon: Calculator },
  { label: "Budget Planner", href: "/budget-planner", icon: Wallet },
  { label: "Insights", href: "/insights", icon: BarChart3 },
  { label: "AI Chat", href: "/ai-chat", icon: MessageSquare },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[#0d0d14]/80 backdrop-blur-xl border-r border-white/[0.06] flex flex-col z-50">
      {/* Logo / Brand */}
      <div className="px-6 py-6 border-b border-white/[0.06]">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:shadow-emerald-500/40 transition-shadow">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">
              FinPilot
              <span className="text-emerald-400"> AI</span>
            </h1>
            <p className="text-[10px] text-gray-500 font-medium tracking-wider uppercase">
              Financial Co-Pilot
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-200
                ${
                  isActive
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 shadow-sm"
                    : "text-gray-400 hover:text-white hover:bg-white/[0.05]"
                }
              `}
            >
              <Icon className={`w-[18px] h-[18px] ${isActive ? "text-emerald-400" : ""}`} />
              {item.label}
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-4 py-4 border-t border-white/[0.06]">
        <div className="rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/10 p-3.5">
          <p className="text-xs font-semibold text-emerald-400 mb-1">Pro Tip</p>
          <p className="text-[11px] text-gray-400 leading-relaxed">
            Use the EMI Analyzer to compare purchase options before committing.
          </p>
        </div>
      </div>
    </aside>
  );
}
