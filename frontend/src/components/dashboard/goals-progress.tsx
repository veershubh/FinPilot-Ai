// src/components/dashboard/goals-progress.tsx
// Animated progress bars for financial goals.

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Goal {
  id: string;
  title: string;
  target: number; // total needed
  saved: number; // amount saved so far
}

const goals: Goal[] = [
  { id: '1', title: 'Emergency Fund', target: 200000, saved: 120000 },
  { id: '2', title: 'Japan Trip', target: 150000, saved: 45000 },
  { id: '3', title: 'MacBook Pro', target: 150000, saved: 80000 },
  { id: '4', title: 'Investments', target: 300000, saved: 130000 },
];

export function GoalsProgress() {
  return (
    <section className="bg-[#0B1020] rounded-xl glass-card border border-[#1F2937] p-4">
      <h3 className="text-lg font-medium text-white mb-4">Financial Goals</h3>
      <div className="space-y-4">
        {goals.map(goal => {
          const percent = Math.min((goal.saved / goal.target) * 100, 100);
          return (
            <div key={goal.id} className="space-y-1">
              <div className="flex justify-between text-sm text-[#94A3B8]">
                <span>{goal.title}</span>
                <span>{Math.round(percent)}%</span>
              </div>
              <div className="w-full bg-[#1F2937] rounded-full h-3 overflow-hidden">
                <motion.div
                  className="h-full bg-[#10B981]"
                  initial={{ width: 0 }}
                  animate={{ width: `${percent}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                />
              </div>
              <div className="flex justify-between text-xs text-[#64748B] mt-1">
                <span>{`₹${goal.saved.toLocaleString('en-IN')}`}</span>
                <span>{`₹${goal.target.toLocaleString('en-IN')}`}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
