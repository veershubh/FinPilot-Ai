/**
 * FinPilot AI - Custom Hook for Purchase Analysis
 * ==================================================
 * Manages the state and API call for the EMI analyzer.
 */

"use client";

import { useState } from "react";
import type { PurchaseAnalysisRequest, PurchaseAnalysisResponse } from "@/types";
import { analyzePurchase } from "@/services/api";

export function useAnalysis() {
  const [result, setResult] = useState<PurchaseAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function analyze(data: PurchaseAnalysisRequest) {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await analyzePurchase(data);
      setResult(response);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Is the backend running?"
      );
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setResult(null);
    setError(null);
  }

  return { result, loading, error, analyze, reset };
}
