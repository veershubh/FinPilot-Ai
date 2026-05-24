/**
 * FinPilot AI - TypeScript Type Definitions
 * ==========================================
 * Central type definitions for API requests, responses,
 * and shared interfaces across the frontend.
 */

// ── Purchase Analysis Request ────────────────────────────────────

export interface PurchaseAnalysisRequest {
  product_price: number;
  monthly_income: number;
  monthly_expenses: number;
  current_savings: number;
  emergency_fund: number;
  emi_months: number;
  interest_rate: number;
}

// ── Financial Breakdown ──────────────────────────────────────────

export interface FinancialBreakdown {
  monthly_disposable_income: number;
  estimated_monthly_emi: number;
  total_emi_cost: number;
  interest_paid: number;
  savings_after_full_payment: number;
  emi_to_income_ratio: number;
  emi_to_disposable_ratio: number;
}

// ── Purchase Analysis Response ───────────────────────────────────

export interface PurchaseAnalysisResponse {
  recommendation: string;
  risk_level: "Low" | "Medium" | "High";
  monthly_emi: number;
  remaining_savings: number;
  financial_health_score: number;
  reason: string;
  detailed_reasons: string[];
  financial_breakdown: FinancialBreakdown;
  tips: string[];
}

// ── Navigation ───────────────────────────────────────────────────

export interface NavItem {
  label: string;
  href: string;
  icon: string;
}

// ── Dashboard Stats ──────────────────────────────────────────────

export interface StatCard {
  title: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon: string;
}
