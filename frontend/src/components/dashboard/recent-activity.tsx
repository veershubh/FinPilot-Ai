// src/components/dashboard/recent-activity.tsx
// Animated timeline of recent financial activities.

"use client";
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CreditCard, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

interface Activity {
  id: string;
  type: 'deposit' | 'purchase' | 'subscription' | 'sip';
  amount: number;
  description: string;
  date: string; // ISO
}

const activities: Activity[] = [
  { id: '1', type: 'deposit', amount: 25000, description: 'Salary credited', date: '2026-05-28' },
  { id: '2', type: 'purchase', amount: 3800, description: 'Grocery - Supermart', date: '2026-05-27' },
  { id: '3', type: 'subscription', amount: 999, description: 'Netflix', date: '2026-05-26' },
  { id: '4', type: 'sip', amount: 5000, description: 'Equity SIP - Growth Fund', date: '2026-05-25' },
];

function getIcon(type: Activity['type']) {
  const map = {
    deposit: <ArrowUpCircle className="w-5 h-5 text-[#10B981]" />, // green up
    purchase: <ArrowDownCircle className="w-5 h-5 text-[#EF4444]" />, // red down
    subscription: <CreditCard className="w-5 h-5 text-[#94A3B8]" />, // neutral
    sip: <CreditCard className="w-5 h-5 text-[#93C5FD]" />, // blue
  } as const;
  return map[type];
}

export function RecentActivity() {
  return (
    <section className="bg-[#0B1020] rounded-xl glass-card border border-[#1F2937] p-4">
      <h3 className="text-lg font-medium text-white mb-4">Recent Activity</h3>
      <ul className="space-y-3">
        {activities.map((act, idx) => (
          <motion.li
            key={act.id}
            className="flex items-center gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            {getIcon(act.type)}
            <div className="flex-1">
              <p className="text-sm text-[#94A3B8]">{act.description}</p>
              <p className="text-xs text-[#64748B]">{new Date(act.date).toLocaleDateString('en-IN')}</p>
            </div>
            <span className={cn('font-medium', act.type === 'deposit' ? 'text-[#10B981]' : act.type === 'purchase' ? 'text-[#EF4444]' : 'text-[#94A3B8]')}>₹{act.amount.toLocaleString('en-IN')}</span>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
