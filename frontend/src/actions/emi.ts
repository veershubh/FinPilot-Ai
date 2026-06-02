// src/actions/emi.ts
/**
 * EMI / Financial Analysis — Server Action
 * =========================================
 * This file ONLY contains async server actions.
 * All synchronous helpers live in @/utils/emi-calculator.
 */

"use server";

import { groq } from "@/lib/groq";
import type { PurchaseAnalysisRequest, PurchaseAnalysisResponse } from "@/types";
import { calculateDeterministic } from "@/utils/emi-calculator";
import type { EmiAnalysisResult } from "@/utils/emi-calculator";

/**
 * Main server action — calls Groq AI and returns a structured wrapper.
 * Includes retry (max 2 attempts) and a 5-second timeout per attempt.
 * AI failure NEVER propagates — always returns the deterministic result.
 */
export async function analyzeEMI(
  request: PurchaseAnalysisRequest,
  prompt?: string,
): Promise<EmiAnalysisResult> {
  // Deterministic baseline first (synchronous, pure math)
  const deterministic = calculateDeterministic(request);

  const systemPrompt = `You are a professional financial advisor. Return ONLY valid JSON matching this schema:
{
  "recommendation": string,
  "risk_level": "Low" | "Medium" | "High",
  "monthly_emi": number,
  "remaining_savings": number,
  "financial_health_score": number,
  "reason": string,
  "detailed_reasons": string[],
  "financial_breakdown": {
    "monthly_disposable_income": number,
    "estimated_monthly_emi": number,
    "total_emi_cost": number,
    "interest_paid": number,
    "savings_after_full_payment": number,
    "emi_to_income_ratio": number,
    "emi_to_disposable_ratio": number
  },
  "tips": string[]
}`;

  const userPrompt =
    prompt ??
    `Analyze this loan: Price ${request.product_price}, Rate ${request.interest_rate}%, Tenure ${request.emi_months}, Income ${request.monthly_income}, Expenses ${request.monthly_expenses}, Savings ${request.current_savings}.`;

  const invokeGroq = async (attempt: number): Promise<string | null> => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const completion = await groq.chat.completions.create(
        {
          model: "llama3-8b-8192",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.2,
          response_format: { type: "json_object" },
        },
        { signal: controller.signal },
      );
      clearTimeout(timeout);
      return completion.choices[0]?.message?.content ?? null;
    } catch (e) {
      if (attempt >= 2) return null;
      return await invokeGroq(attempt + 1);
    }
  };

  const aiResponse = await invokeGroq(1);

  if (aiResponse) {
    try {
      const parsed = JSON.parse(aiResponse) as PurchaseAnalysisResponse;
      // Merge AI response onto deterministic baseline; AI fields win when present
      const merged: PurchaseAnalysisResponse = { ...deterministic, ...parsed };
      return { success: true, result: merged, aiEnhanced: true };
    } catch {
      // fall through to deterministic fallback
    }
  }

  const errorMsg = aiResponse ? "Failed to parse AI response" : "AI request failed";
  return { success: true, result: deterministic, aiEnhanced: false, error: errorMsg };
}