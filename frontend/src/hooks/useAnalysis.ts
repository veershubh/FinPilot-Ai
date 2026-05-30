/**
 * FinPilot AI - Custom Hook for Purchase Analysis
 * ==================================================
 * Manages the state and API call for the EMI analyzer.
 */

"use client";

import { useState } from "react";
import type { PurchaseAnalysisRequest, PurchaseAnalysisResponse } from "@/types";
import { analyzeEMI } from "@/actions/emi";

export function useAnalysis() {
  const [result, setResult] = useState<PurchaseAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function analyze(data: PurchaseAnalysisRequest) {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      
    // Build prompt for AI analysis
    const prompt = `
    Loan Amount: ${data.product_price}
    Interest Rate: ${data.interest_rate}%
    Tenure (months): ${data.emi_months}
    Monthly Income: ${data.monthly_income}
    Monthly Expenses: ${data.monthly_expenses}
    Current Savings: ${data.current_savings}
    Emergency Fund: ${data.emergency_fund}
    `;
    console.log("Calling analyzeEMI...");
    console.log("Prompt:", prompt);
    const response = await analyzeEMI(prompt);

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
