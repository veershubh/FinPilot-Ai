// src/components/dashboard/overview-cards.tsx
// Overview cards displaying key financial figures with animated counters.

'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSupabase } from '@/lib/supabaseClient';
import { getDashboardOverview } from '@/lib/dashboard';

interface CardProps {
  title: string;
  value: number;
  trend: 'up' | 'down' | 'neutral';
  trendValue: string;
  icon: React.ReactNode;
  color?: string; // tailwind text color class like 'text-emerald-500'
}

function OverviewCard({ title, value, trend, trendValue, icon, color = 'text-[#10B981]' }: CardProps) {
  // Animated counter
  const [display, setDisplay] = React.useState(0);
  React.useEffect(() => {
    let start = 0;
    const duration = 1500; // ms
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      const progressRatio = Math.min(progress / duration, 1);
      setDisplay(Math.floor(progressRatio * value));
      if (progress < duration) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value]);

  const TrendIcon = trend === 'up' ? ArrowUp : trend === 'down' ? ArrowDown : TrendingUp;
  const trendColor = trend === 'up' ? 'text-[#10B981]' : trend === 'down' ? 'text-[#EF4444]' : 'text-[#94A3B8]';

  return (
    <motion.div
      className={cn(
        'glass-card p-4 rounded-xl border border-[#1F2937] hover:glow-green transition-shadow flex flex-col justify-between h-36',
        color
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-[#94A3B8]">{title}</h3>
        {icon}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <p className="text-2xl font-bold text-white">₹{display.toLocaleString('en-IN')}</p>
        <span className={cn('flex items-center text-sm', trendColor)}>
          <TrendIcon className="w-4 h-4 mr-1" />
          {trendValue}
        </span>
      </div>
    </motion.div>
  );
}

export async function OverviewCards() {
  // Fetch real data server‑side
const supabase = getSupabase();
const { data: user } = await supabase.auth.getUser();
const userId = user?.id ?? '';
const overview = await getDashboardOverview(userId);
const data: CardProps[] = [
  {
    title: 'Monthly Income',
    value: overview.totalIncome,
    trend: overview.totalIncome >= overview.totalExpense ? 'up' : 'down',
    trendValue: `${((overview.totalIncome - overview.totalExpense) / (overview.totalExpense || 1) * 100).toFixed(0)}%`,
    icon: <TrendingUp className="w-5 h-5 text-[#10B981]" />, // revenue icon
    color: 'text-[#10B981]',
  },
  {
    title: 'Expenses',
    value: overview.totalExpense,
    trend: 'down',
    trendValue: '-5%',
    icon: <TrendingDown className="w-5 h-5 text-[#EF4444]" />, // expense icon
  },
  {
    title: 'Savings',
    value: overview.balance,
    trend: overview.balance >= 0 ? 'up' : 'down',
    trendValue: `${overview.balance >= 0 ? '+' : ''}${overview.balance}`,
    icon: <TrendingUp className="w-5 h-5 text-[#10B981]" />,
  },
  {
    title: 'Budget Health',
    value: Math.round((overview.budgets.reduce((sum, b) => sum + b.spent_amount, 0) / (overview.budgets.reduce((sum, b) => sum + b.monthly_limit, 0) || 1)) * 100),
    trend: 'neutral',
    trendValue: 'Stable',
    icon: <TrendingUp className="w-5 h-5 text-[#10B981]" />,
  },
];

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {data.map(card => (
        <OverviewCard key={card.title} {...card} />
      ))}
    </section>
  );
}
