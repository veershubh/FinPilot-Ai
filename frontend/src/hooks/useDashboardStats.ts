// src/hooks/useDashboardStats.ts
"use client";

import useSWR from "swr";

export interface DashboardStats {
  monthlyIncome: number;
  monthlySavings: number;
  totalMonthlyBurden: number;
  totalOutstanding: number;
  activeEMICount: number;
  healthScore: number;
  healthAdvice: string;
  trends: {
    income: "up" | "down" | "neutral";
    savings: "up" | "down" | "neutral";
  };
}

async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed with status ${res.status}`);
  }
  return res.json();
}

/**
 * Fetch real-time dashboard statistics.
 * Refreshes every 60 seconds.
 */
export function useDashboardStats() {
  const { data, error, isLoading, mutate } = useSWR<DashboardStats>(
    "/api/dashboard/stats",
    fetcher,
    { refreshInterval: 60_000 }
  );

  return {
    stats: data ?? null,
    loading: isLoading,
    error,
    refresh: mutate,
  };
}
