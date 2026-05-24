"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Calculator, Wallet, BarChart3,
  MessageSquare, TrendingUp, Settings, LogOut,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "EMI Analyzer", href: "/emi-analyzer", icon: Calculator },
  { label: "Budget Planner", href: "/budget-planner", icon: Wallet },
  { label: "Insights", href: "/insights", icon: BarChart3 },
  { label: "AI Chat", href: "/ai-chat", icon: MessageSquare },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[260px] bg-[#0B1020] border-r border-[#1F2937] flex flex-col z-50">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[#1F2937]">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-[#10B981] flex items-center justify-center shadow-lg shadow-[#10B981]/20 group-hover:shadow-[#10B981]/40 transition-shadow">
            <TrendingUp className="w-5 h-5 text-[#050816]" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">
              FinPilot<span className="text-[#10B981]"> AI</span>
            </h1>
            <p className="text-[10px] text-[#64748B] font-medium tracking-wider uppercase">
              Financial Co-Pilot
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 mb-2 text-[10px] font-semibold text-[#64748B] uppercase tracking-widest">
          Menu
        </p>
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
                ${isActive
                  ? "bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20"
                  : "text-[#94A3B8] hover:text-white hover:bg-white/[0.04] border border-transparent"
                }
              `}
            >
              <Icon className={`w-[18px] h-[18px] ${isActive ? "text-[#10B981]" : ""}`} />
              {item.label}
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-3 border-t border-[#1F2937] space-y-1">
        <Link
          href="#"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#94A3B8] hover:text-white hover:bg-white/[0.04] transition-colors"
        >
          <Settings className="w-[18px] h-[18px]" />
          Settings
        </Link>
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#94A3B8] hover:text-red-400 hover:bg-red-500/5 transition-colors"
        >
          <LogOut className="w-[18px] h-[18px]" />
          Log Out
        </Link>
      </div>
    </aside>
  );
}
