// src/hooks/useCommitments.ts
"use client";

import useSWR from "swr";
import type {
  Commitment,
  CommitmentPayment,
  CommitmentAIInsight,
} from "@/types/database";

/**
 * SWR fetcher that throws on non-OK responses.
 * This ensures SWR treats 401/500 responses as errors (populating `error`),
 * NOT as valid data (which would corrupt the typed return value).
 */
async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = new Error(body.error ?? `Request failed with status ${res.status}`);
    (err as any).status = res.status;
    throw err;
  }
  return res.json();
}

// ─── Commitment List ────────────────────────────────────────────────────────

/**
 * Fetch all commitments for the logged-in user.
 * Optional status/category filters via query params.
 *
 * `commitments` is ALWAYS a Commitment[] (defaults to [] on error/loading).
 */
export function useCommitments(filters?: {
  status?: string[];
  category?: string[];
}) {
  const params = new URLSearchParams();
  if (filters?.status) params.set("status", filters.status.join(","));
  if (filters?.category) params.set("category", filters.category.join(","));
  const qs = params.toString();
  const url = `/api/commitments${qs ? `?${qs}` : ""}`;

  const { data, error, isLoading, mutate } = useSWR<Commitment[]>(
    url,
    fetcher,
    {
      refreshInterval: 30_000,
      // Ensure `data` is never a stale non-array value on revalidation errors
      keepPreviousData: true,
    }
  );

  // Defensive: guarantee array even if SWR somehow returns non-array data
  const commitments = Array.isArray(data) ? data : [];

  return {
    commitments,
    loading: isLoading,
    error,
    refresh: mutate,
  };
}

// ─── Single Commitment Detail ───────────────────────────────────────────────

export interface CommitmentDetail {
  commitment: Commitment;
  payments: CommitmentPayment[];
  insights: CommitmentAIInsight[];
}

/**
 * Fetch a single commitment with its payments and AI insights.
 */
export function useCommitmentDetail(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<CommitmentDetail>(
    id ? `/api/commitments/${id}` : null,
    fetcher,
    { refreshInterval: 15_000 }
  );

  return {
    detail: data ?? null,
    loading: isLoading,
    error,
    refresh: mutate,
  };
}

// ─── Commitments Summary ────────────────────────────────────────────────────

export interface CommitmentsSummaryData {
  totalMonthlyBurden: number;
  totalOutstanding: number;
  activeCount: number;
  upcomingCount: number;
  completedCount: number;
  overdueCount: number;
  avgProgress: number;
  categoryBreakdown: Record<string, { count: number; monthly: number }>;
}

/**
 * Aggregate summary for dashboard widgets.
 */
export function useCommitmentsSummary() {
  const { data, error, isLoading, mutate } = useSWR<CommitmentsSummaryData>(
    "/api/commitments?summary=true",
    fetcher,
    { refreshInterval: 60_000 }
  );

  return {
    summary: data ?? null,
    loading: isLoading,
    error,
    refresh: mutate,
  };
}

// ─── Mutation Helpers ───────────────────────────────────────────────────────

/** Create a new commitment via API */
export async function createCommitmentAPI(
  data: Record<string, any>
): Promise<Commitment> {
  const res = await fetch("/api/commitments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? "Failed to create commitment");
  }
  return res.json();
}

/** Update commitment via API */
export async function updateCommitmentAPI(
  id: string,
  updates: Record<string, any>
): Promise<Commitment> {
  const res = await fetch(`/api/commitments/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? "Failed to update commitment");
  }
  return res.json();
}

/** Delete commitment via API */
export async function deleteCommitmentAPI(id: string): Promise<boolean> {
  const res = await fetch(`/api/commitments/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? "Failed to delete commitment");
  }
  return true;
}

/** Record a payment via API */
export async function recordPaymentAPI(
  commitmentId: string,
  data: { amount: number; payment_mode?: string; notes?: string }
): Promise<any> {
  const res = await fetch(`/api/commitments/${commitmentId}/payments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? "Failed to record payment");
  }
  return res.json();
}
