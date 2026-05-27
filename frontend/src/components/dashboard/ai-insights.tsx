// src/components/dashboard/ai-insights.tsx
// AI recommendation cards with expandable details and confidence badge.

import { useState } from 'react';
'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Insight {
  id: string;
  title: string;
  summary: string;
  details: string;
  confidence: number; // 0-100
}

const insights: Insight[] = [
  {
    id: '1',
    title: 'Optimize EMI Payments',
    summary: 'Shift to a lower interest rate loan for savings.',
    details:
      'Based on your current EMI schedule, refinancing with a 6% rate could save ~₹3,200 per year. Consider checking with your bank for prepayment options.',
    confidence: 92,
  },
  {
    id: '2',
    title: 'Increase Emergency Fund',
    summary: 'Aim for 6 months of expenses in reserve.',
    details:
      'Your current emergency fund covers 3 months. Adding ₹15,000 each month will reach the target in 3 months.',
    confidence: 87,
  },
  {
    id: '3',
    title: 'Invest in SIP',
    summary: 'Start a systematic investment plan for long‑term growth.',
    details: 'A monthly SIP of ₹5,000 in a diversified equity fund could grow to ~₹1.2 Lakh in 5 years (assuming 12% CAGR).',
    confidence: 80,
  },
];

export function AIInsights() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {insights.map(insight => (
        <motion.div
          key={insight.id}
          layout
          className={cn(
            'glass-card rounded-xl border border-[#1F2937] p-4 hover:glow-green transition-shadow cursor-pointer',
            expanded === insight.id && 'shadow-xl'
          )}
          onClick={() => setExpanded(expanded === insight.id ? null : insight.id)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-[#10B981]" />
              <h4 className="text-lg font-medium text-white">{insight.title}</h4>
            </div>
            <span className="text-sm font-medium bg-[#10B981]/10 text-[#10B981] px-2 py-1 rounded">
              {insight.confidence}%
            </span>
          </div>
          <p className="mt-2 text-[#94A3B8]">{insight.summary}</p>
          <AnimatePresence>
            {expanded === insight.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 text-[#94A3B8]"
              >
                <p>{insight.details}</p>
                <button className="mt-2 flex items-center gap-1 text-[#10B981] hover:underline">
                  Take Action <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </section>
  );
}
