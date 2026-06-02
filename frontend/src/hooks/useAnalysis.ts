// src/hooks/useAnalysis.ts
/**
 * FinPilot AI — Custom Hook for Purchase Analysis
 * ==================================================
 * Runs a deterministic calculation first (instant), then enhances with AI.
 */

"use client";

import { useState } from "react";
import type { PurchaseAnalysisRequest, PurchaseAnalysisResponse } from "@/types";
import { analyzeEMI } from "@/actions/emi";
import { buildPurchaseAnalysisResult } from "@/utils/emi-calculator";
import {
  calcEMI,
  calcTotalPayment,
  calcTotalInterest,
  calcDisposableIncome,
} from "@/lib/calcEmi";

export function useAnalysis() {
  const [result, setResult] = useState<PurchaseAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAiEnhanced, setIsAiEnhanced] = useState(false);
  const [analyzeStep, setAnalyzeStep] = useState<"idle" | "calculating" | "ai" | "done">("idle");

  async function analyze(data: PurchaseAnalysisRequest) {
    setLoading(true);
    setError(null);
    setResult(null);
    setIsAiEnhanced(false);
    setAnalyzeStep("calculating");

    try {
      // ----- Deterministic calculation (instant) -----
      const principal = data.product_price;
      const emi = calcEMI(principal, data.interest_rate, data.emi_months);
      const totalPayment = calcTotalPayment(emi, data.emi_months);
      const totalInterest = calcTotalInterest(totalPayment, principal);
      const disposable = calcDisposableIncome(data.monthly_income, data.monthly_expenses);

      const deterministicResult = buildPurchaseAnalysisResult(
        data,
        emi,
        totalPayment,
        totalInterest,
        disposable,
      );

      // Show deterministic result immediately
      setResult(deterministicResult);
      setAnalyzeStep("ai");

      // ----- AI enhancement (server action) -----
      const aiResult = await analyzeEMI(data);

      // Merge AI fields onto base result when AI actually changed something
      const enhanced =
        aiResult.aiEnhanced &&
        (aiResult.result.recommendation !== deterministicResult.recommendation ||
          JSON.stringify(aiResult.result.tips) !== JSON.stringify(deterministicResult.tips));

      if (enhanced) {
        setResult({ ...deterministicResult, ...aiResult.result });
      }
      setIsAiEnhanced(enhanced);
    } catch (err) {
      // Deterministic result is already displayed — just surface the error
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
      setAnalyzeStep("done");
    }
  }

  function reset() {
    setResult(null);
    setError(null);
    setIsAiEnhanced(false);
    setAnalyzeStep("idle");
  }

  return { result, loading, error, isAiEnhanced, analyzeStep, analyze, reset };
}
