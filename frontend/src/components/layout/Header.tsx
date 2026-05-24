/**
 * FinPilot AI - Header Bar
 */

"use client";

import React from "react";
import { Bell, Search } from "lucide-react";

export function Header() {
  return (
    <header className="h-16 border-b border-white/[0.06] bg-[#0a0a0f]/60 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-40">
      {/* Search */}
      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search features, tools..."
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-emerald-500/40 transition-colors"
        />
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative p-2 rounded-xl hover:bg-white/[0.05] transition-colors text-gray-400 hover:text-white">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500" />
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
          U
        </div>
      </div>
    </header>
  );
}
