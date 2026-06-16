// src/components/dashboard/sidebar.tsx
// Desktop navigation sidebar for the dashboard.

'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Calculator, Wallet, BarChart3, MessageSquare, Settings, LogOut } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'EMI Analyzer', href: '/emi-analyzer', icon: Calculator },
  { label: 'Budget Planner', href: '/budget-planner', icon: Wallet },
  { label: 'Insights', href: '/insights', icon: BarChart3 },
  { label: 'AI Chat', href: '/ai-chat', icon: MessageSquare },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <aside className="hidden lg:flex flex-col w-[260px] h-screen bg-[#0B1020] border-r border-[#1F2937] pt-4">
      {/* Logo */}
      <div className="px-5 mb-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-[#10B981] flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#050816]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2" />
            </svg>
          </div>
          <span className="text-lg font-bold text-[#10B981]">FinPilot AI</span>
        </Link>
      </div>
      {/* Nav items */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map(item => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition',
                isActive
                  ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20'
                  : 'text-[#94A3B8] hover:text-white hover:bg-white/5 border border-transparent'
              )}
            >
              <Icon className={cn('w-4 h-4', isActive && 'text-[#10B981]')} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      {/* Bottom user info */}
      <div className="px-3 py-4 border-t border-[#1F2937]">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 text-[#94A3B8] hover:text-red-400 hover:bg-red-500/5 py-2"
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </button>
      </div>
    </aside>
  );
}
