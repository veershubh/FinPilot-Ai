// src/utils/emi-calculator.ts
/**
 * Pure EMI calculation utilities and result builders.
 * ====================================================
 * This file is intentionally NOT a server action. It contains synchronous,
 * deterministic helpers that can be imported from both client and server code.
 */

import type { PurchaseAnalysisRequest, PurchaseAnalysisResponse, FinancialBreakdown } from "@/types";
import {
  calcEMI,
  calcTotalPayment,
  calcTotalInterest,
  calcDisposableIncome,
  isAffordable,
} from "@/lib/calcEmi";

/** Result wrapper returned by analyzeEMI server action. */
export interface EmiAnalysisResult {
  /** Overall success (always true for deterministic fallback). */
  success: boolean;
  /** The final PurchaseAnalysisResponse, either AI‑enhanced or deterministic. */
  result: PurchaseAnalysisResponse;
  /** True if AI provided a response that was merged into the result. */
  aiEnhanced: boolean;
  /** Optional error message when AI fails. */
  error?: string;
}

/** Build a full PurchaseAnalysisResponse from raw request data + pre-computed numbers. */
export function buildPurchaseAnalysisResult(
  data: PurchaseAnalysisRequest,
  emi: number,
  totalPayment: number,
  totalInterest: number,
  disposable: number,
): PurchaseAnalysisResponse {
  const remainingSavings = Math.max(0, data.current_savings - totalPayment);
  const affordability = isAffordable(emi, disposable);
  const riskLevel = affordability ? "Low" : "High";
  const financialBreakdown: FinancialBreakdown = {
    monthly_disposable_income: disposable,
    estimated_monthly_emi: emi,
    total_emi_cost: totalPayment,
    interest_paid: totalInterest,
    savings_after_full_payment: remainingSavings,
    emi_to_income_ratio: data.monthly_income ? emi / data.monthly_income : 0,
    emi_to_disposable_ratio: disposable ? emi / disposable : 0,
  };
  return {
    recommendation: affordability ? "Proceed with purchase" : "Do not purchase",
    risk_level: riskLevel,
    monthly_emi: emi,
    remaining_savings: remainingSavings,
    financial_health_score: affordability ? 85 : 30,
    reason: affordability
      ? "EMI is within affordable range (≤30% of disposable income)."
      : "EMI exceeds affordable threshold.",
    detailed_reasons: [
      `EMI/Income ratio: ${(emi / data.monthly_income).toFixed(2)}`,
      `EMI/Disposable ratio: ${(emi / disposable).toFixed(2)}`,
    ],
    financial_breakdown: financialBreakdown,
    tips: affordability
      ? ["Maintain your emergency fund.", "Consider extra repayments to reduce interest."]
      : ["Reduce loan amount or extend tenure.", "Increase savings before committing."],
  };
}

/** Deterministic calculation without AI – produces a complete response instantly. */
export function calculateDeterministic(request: PurchaseAnalysisRequest): PurchaseAnalysisResponse {
  const emi = calcEMI(request.product_price, request.interest_rate, request.emi_months);
  const totalPayment = calcTotalPayment(emi, request.emi_months);
  const totalInterest = calcTotalInterest(totalPayment, request.product_price);
  const disposable = calcDisposableIncome(request.monthly_income, request.monthly_expenses);
  return buildPurchaseAnalysisResult(request, emi, totalPayment, totalInterest, disposable);
}
