/**
 * FinPilot AI — Database Type Definitions
 * ========================================
 * Updated to match the extended Supabase schema.
 */

// ── Profiles ────────────────────────────────────────────────────────────────
export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  monthly_income?: number | null;
  onboarding_completed?: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProfileInsert {
  id: string;
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
  monthly_income?: number;
  onboarding_completed?: boolean;
}

export interface ProfileUpdate {
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
  monthly_income?: number;
  onboarding_completed?: boolean;
  updated_at?: string;
}

// ── Expenses ────────────────────────────────────────────────────────────────
export interface Expense {
  id: string;
  user_id: string;
  category: string;
  amount: number;
  description: string | null;
  expense_date: string;
  created_at: string;
}

export interface ExpenseInsert {
  user_id: string;
  category: string;
  amount: number;
  description?: string | null;
  expense_date?: string;
}

export interface ExpenseUpdate {
  category?: string;
  amount?: number;
  description?: string | null;
  expense_date?: string;
}

// ── Budgets ─────────────────────────────────────────────────────────────────
export interface Budget {
  id: string;
  user_id: string;
  category: string;
  monthly_limit: number;
  spent_amount: number;
  period: string;
  created_at: string;
}

export interface BudgetInsert {
  user_id: string;
  category: string;
  monthly_limit: number;
  spent_amount?: number;
  period?: string;
}

export interface BudgetUpdate {
  category?: string;
  monthly_limit?: number;
  spent_amount?: number;
  period?: string;
}

// ── Goals ───────────────────────────────────────────────────────────────────
export interface Goal {
  id: string;
  user_id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  target_date: string | null;
  status: string;
  created_at: string;
}

export interface GoalInsert {
  user_id: string;
  title: string;
  target_amount: number;
  current_amount?: number;
  target_date?: string | null;
  status?: string;
}

export interface GoalUpdate {
  title?: string;
  target_amount?: number;
  current_amount?: number;
  target_date?: string | null;
  status?: string;
}

// ── EMI Planner ─────────────────────────────────────────────────────────────
export interface EMIPlan {
  id: string;
  user_id: string;
  title: string | null;
  principal: number;
  interest_rate: number;
  tenure_months: number;
  emi_amount: number;
  start_date: string | null;
  created_at: string;
}

export interface EMIPlanInsert {
  user_id: string;
  title?: string | null;
  principal: number;
  interest_rate: number;
  tenure_months: number;
  emi_amount: number;
  start_date?: string | null;
}

export interface EMIPlanUpdate {
  title?: string | null;
  principal?: number;
  interest_rate?: number;
  tenure_months?: number;
  emi_amount?: number;
  start_date?: string | null;
}

// ── Transactions ────────────────────────────────────────────────────────────
export interface Transaction {
  id: string;
  user_id: string;
  title?: string;
  type: TransactionType;
  amount: number;
  description?: string;
  notes?: string;
  category?: string;
  transaction_date: string;
  created_at: string;
}

export interface TransactionInsert {
  user_id: string;
  title?: string;
  type: TransactionType;
  amount: number;
  notes?: string;
  category?: string;
  transaction_date?: string;
}

export interface TransactionUpdate {
  title?: string;
  type?: TransactionType;
  amount?: number;
  notes?: string;
  category?: string;
  transaction_date?: string;
}

// ── Subscriptions ───────────────────────────────────────────────────────────
export interface Subscription {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  renewal_date: string;
  category: string;
  created_at: string;
}

export interface SubscriptionInsert {
  user_id: string;
  name: string;
  amount: number;
  renewal_date: string;
  category: string;
}

export interface SubscriptionUpdate {
  name?: string;
  amount?: number;
  renewal_date?: string;
  category?: string;
}

// ── AI Insights ─────────────────────────────────────────────────────────────
export interface AIInsight {
  id: string;
  user_id: string;
  title: string;
  description: string;
  confidence_score: number;
  severity: string;
  created_at: string;
}

export interface AIInsightInsert {
  user_id: string;
  title: string;
  description: string;
  confidence_score: number;
  severity: string;
}

// ── Enums & Types ───────────────────────────────────────────────────────────
export const EXPENSE_CATEGORIES = [
  "Food & Dining",
  "Transportation",
  "Shopping",
  "Entertainment",
  "Bills & Utilities",
  "Healthcare",
  "Education",
  "Rent",
  "Insurance",
  "Investments",
  "Subscriptions",
  "Travel",
  "Groceries",
  "Personal Care",
  "Gifts & Donations",
  "Other",
] as const;
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const BUDGET_PERIODS = ["weekly", "monthly", "quarterly", "yearly"] as const;
export type BudgetPeriod = (typeof BUDGET_PERIODS)[number];

export const TRANSACTION_TYPES = ["income", "expense", "transfer", "investment"] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export const AI_INSIGHT_SEVERITY = ["low", "medium", "high"] as const;
export type AIInsightSeverity = (typeof AI_INSIGHT_SEVERITY)[number];
