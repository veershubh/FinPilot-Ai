// src/components/dashboard/top-navbar.tsx
// Top navigation bar inside the dashboard layout.

'use client';

import { Search, Bell, Cpu } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export function DashboardTopNavbar() {
  const [date, setDate] = useState('');
  useEffect(() => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };
    setDate(now.toLocaleDateString('en-IN', options));
  }, []);

  return (
    <header className="flex items-center justify-between h-16 px-6 bg-[#051424] border-b border-[#1F2937]">
      {/* Search */}
      <div className="relative w-64">
        <input
          type="text"
          placeholder="Search..."
          className="w-full pl-8 pr-3 py-1.5 bg-[#0F172A] text-[#94A3B8] rounded focus:outline-none focus:ring-2 focus:ring-[#10B981]"
        />
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
      </div>
      {/* Right side */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-[#94A3B8]">{date}</span>
        <button className="relative text-[#94A3B8] hover:text-white">
          <Bell className="w-5 h-5" />
          {/* placeholder badge */}
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#EF4444] rounded-full animate-pulse" />
        </button>
        {/* AI status pulse */}
        <div className="flex items-center gap-1">
          <Cpu className="w-5 h-5 text-[#10B981]" />
          <span className="h-2 w-2 bg-[#10B981] rounded-full animate-pulse" />
        </div>
      </div>
    </header>
  );
}
