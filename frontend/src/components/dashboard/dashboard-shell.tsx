// src/components/dashboard/dashboard-shell.tsx
// Wraps the dashboard with sidebar, top navbar and a responsive main area.

'use client';

import { useState } from 'react';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { DashboardTopNavbar } from '@/components/dashboard/top-navbar';
import { MobileSidebar } from '@/components/dashboard/mobile-sidebar';

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#050816] text-white">
      {/* Desktop sidebar */}
      <DashboardSidebar />

      {/* Mobile sidebar overlay */}
      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex flex-col flex-1 ml-0 lg:ml-[260px]">
        {/* Top navbar with a burger for mobile */}
        <header className="flex items-center h-16 px-4 lg:px-6 bg-[#051424] border-b border-[#1F2937]">
          <button
            className="lg:hidden p-2 text-[#94A3B8] hover:text-white"
            onClick={() => setMobileOpen(true)}
          >
            {/* Simple hamburger */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <DashboardTopNavbar />
        </header>
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
