import useSWR from 'swr';
import type { Budget } from '@/types/database';

const fetcher = (url: string) => fetch(url).then(r => r.json());

/** Hook to fetch budgets for the logged‑in user */
export function useBudgets() {
  const { data, error, isLoading, mutate } = useSWR<Budget[]>('/api/budgets', fetcher, {
    refreshInterval: 30_000,
  });

  return {
    budgets: data,
    loading: isLoading,
    error,
    refresh: mutate,
  };
}
