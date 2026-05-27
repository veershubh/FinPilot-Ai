// src/components/dashboard/upcoming-bills.tsx
// List of upcoming bills with due dates and sorting.

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string; // ISO format
}

const initialBills: Bill[] = [
  { id: '1', name: 'Credit Card EMI', amount: 12000, dueDate: '2026-06-05' },
  { id: '2', name: 'Electricity Bill', amount: 3500, dueDate: '2026-05-30' },
  { id: '3', name: 'Gym Membership', amount: 1500, dueDate: '2026-06-10' },
  { id: '4', name: 'Car Insurance', amount: 7800, dueDate: '2026-06-15' },
];

export function UpcomingBills() {
  const [bills, setBills] = useState<Bill[]>(initialBills);
  const [sortAsc, setSortAsc] = useState(true);

  const sorted = [...bills].sort((a, b) => {
    const da = new Date(a.dueDate).getTime();
    const db = new Date(b.dueDate).getTime();
    return sortAsc ? da - db : db - da;
  });

  return (
    <section className="bg-[#0B1020] rounded-xl glass-card border border-[#1F2937] p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-white">Upcoming Bills</h3>
        <button
          onClick={() => setSortAsc(!sortAsc)}
          className="flex items-center gap-1 text-[#94A3B8] hover:text-white"
        >
          {sortAsc ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          {sortAsc ? 'Soonest First' : 'Latest First'}
        </button>
      </div>
      <ul className="space-y-3">
        {sorted.map(bill => (
          <li
            key={bill.id}
            className="flex justify-between items-center p-2 rounded hover:bg-[#1F2937] transition"
          >
            <span className="text-[#94A3B8]">{bill.name}</span>
            <span className="text-white font-medium">₹{bill.amount.toLocaleString('en-IN')}</span>
            <span className="text-[#64748B] text-sm">{new Date(bill.dueDate).toLocaleDateString('en-IN')}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
