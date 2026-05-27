import useSWR from 'swr';
import type { Expense } from '@/types/database';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

/** Hook to fetch expenses for the logged‑in user */
export function useExpenses() {
  const { data, error, isLoading, mutate } = useSWR<Expense[]>('/api/expenses', fetcher, {
    // Refresh every 30 seconds – helps keep UI up‑to‑date in case realtime misses
    refreshInterval: 30_000,
  });

  return {
    expenses: data,
    loading: isLoading,
    error,
    refresh: mutate,
  };
}
