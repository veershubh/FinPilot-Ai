import type { Transaction, Budget } from '@/types/database';

/** Calculate total spend per category */
export const calculateSpendByCategory = (transactions: Transaction[]) => {
  const spend: Record<string, number> = {};
  transactions.forEach(tx => {
    if (tx.type !== 'expense') return;
    const cat = tx.category ?? 'Other';
    spend[cat] = (spend[cat] ?? 0) + (tx.amount ?? 0);
  });
  return spend;
};

/** Compute budget utilization percentages */
export const budgetUtilization = (budgets: Budget[]) => {
  return budgets.map(b => ({
    ...b,
    utilization: b.monthly_limit ? (b.spent_amount / b.monthly_limit) * 100 : 0,
  }));
};
