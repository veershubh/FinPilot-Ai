// src/components/dashboard/expense-breakdown.tsx
// Pie chart showing expense categories.

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
'use client';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const data = [
  { name: 'Essentials', value: 45 },
  { name: 'Lifestyle', value: 20 },
  { name: 'Investments', value: 15 },
  { name: 'Bills', value: 12 },
  { name: 'Other', value: 8 },
];

const COLORS = ['#10B981', '#64748B', '#93C5FD', '#FBBF24', '#D946EF'];

export function ExpenseBreakdown() {
  return (
    <section className="bg-[#0B1020] rounded-xl glass-card border border-[#1F2937] p-4">
      <h3 className="text-lg font-medium text-white mb-4">Expense Breakdown</h3>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            animationDuration={800}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                stroke="none"
                className="hover:scale-105 transition-transform"
              />
            ))}
          </Pie>
          <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #1F2937', color: '#fff' }} />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </section>
  );
}
