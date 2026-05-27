// src/app/dashboard/layout.tsx
// Dashboard layout with server‑side auth check and shell wrapper.

import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getServerSupabase } from '@/utils/supabase/server';
import DashboardShell from '@/components/dashboard/dashboard-shell';

export const metadata = {
  title: 'Dashboard – FinPilot AI',
  description: 'Your financial overview and AI insights',
};

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  // Server‑side session validation – redirects unauthenticated users to /login.
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }
  // Authenticated – render dashboard shell.
  return <DashboardShell>{children}</DashboardShell>;
}
