"use client";

import React from "react";
import { Bell, Search } from "lucide-react";

export function Header() {
  return (
    <header className="h-16 border-b border-[#1F2937] bg-[#050816]/60 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-40">
      {/* Search */}
      <div className="relative w-80">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
        <input
          type="text"
          placeholder="Search features, tools..."
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0F172A] border border-[#1F2937] text-sm text-white placeholder-[#64748B] focus:outline-none focus:border-[#10B981]/40 hover:border-[#374151] transition-colors"
        />
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-xl hover:bg-white/[0.04] transition-colors text-[#94A3B8] hover:text-white">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#10B981]" />
        </button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center text-xs font-bold text-[#050816]">
          U
        </div>
      </div>
    </header>
  );
}
