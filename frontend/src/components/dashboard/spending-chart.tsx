import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { cn } from '@/lib/utils';
import { getSupabase } from '@/lib/supabaseClient';
import { getDashboardOverview } from '@/lib/dashboard';

/**
 * Spending chart that aggregates transactions by week or month.
 * Server‑side component – async to fetch data.
 */
export async function SpendingChart() {
  const supabase = getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id ?? '';
  const overview = await getDashboardOverview(userId);
  const transactions = overview.transactions;

  // Group by week (Monday‑Sunday) or month
  const groupBy = 'weekly'; // could be made toggleable later

  const data = groupBy === 'weekly' ? aggregateWeekly(transactions) : aggregateMonthly(transactions);

  return (
    <section className="bg-[#0B1020] rounded-xl glass-card border border-[#1F2937] p-4">
      <h3 className="text-lg font-medium text-white mb-4">Spending Overview ({groupBy})</h3>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1F2937" />
          <XAxis dataKey="period" stroke="#94A3B8" tickLine={false} />
          <YAxis stroke="#94A3B8" tickLine={false} />
          <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #1F2937', color: '#fff' }} />
          <Area type="monotone" dataKey="amount" stroke="#10B981" fillOpacity={1} fill="url(#colorSpend)" />
        </AreaChart>
      </ResponsiveContainer>
    </section>
  );
}

interface Transaction {
  type: string;
  transaction_date: string;
  amount: number;
}

/** Aggregate transactions into weekly totals */
function aggregateWeekly(transactions: Transaction[]) {
  const weeks: Record<string, number> = {};
  transactions.forEach(tx => {
    if (tx.type !== 'expense') return;
    const date = new Date(tx.transaction_date);
    // Get ISO week number
    const week = getISOWeek(date);
    const year = date.getFullYear();
    const key = `${year}-W${week}`;
    weeks[key] = (weeks[key] ?? 0) + (tx.amount ?? 0);
  });
  return Object.entries(weeks).map(([period, amount]) => ({ period, amount }));
}

/** Aggregate transactions into monthly totals */
function aggregateMonthly(transactions: Transaction[]) {
  const months: Record<string, number> = {};
  transactions.forEach(tx => {
    if (tx.type !== 'expense') return;
    const date = new Date(tx.transaction_date);
    const key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    months[key] = (months[key] ?? 0) + (tx.amount ?? 0);
  });
  return Object.entries(months).map(([period, amount]) => ({ period, amount }));
}

/** Calculate ISO week number */
function getISOWeek(date: Date) {
  const tmp = new Date(date.getTime());
  tmp.setUTCDate(tmp.getUTCDate() + 4 - (tmp.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((tmp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return weekNo;
}
