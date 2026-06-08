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

// ── Financial Timeline ──────────────────────────────────────────────────────
export const COMMITMENT_CATEGORIES = [
  "emi", "loan", "subscription", "sip", "investment", "other"
] as const;
export type CommitmentCategory = (typeof COMMITMENT_CATEGORIES)[number];

export const COMMITMENT_STATUSES = ["active", "completed", "overdue", "paused", "upcoming"] as const;
export type CommitmentStatus = (typeof COMMITMENT_STATUSES)[number];

export interface FinancialTimeline {
  id: string;
  user_id: string;
  title: string;
  category: CommitmentCategory;
  provider: string | null;
  monthly_amount: number;
  principal_amount: number | null;
  interest_rate: number | null;
  start_date: string;
  end_date: string | null;
  total_months: number;
  status: CommitmentStatus;
  notes: string | null;
  created_at: string;
}

export interface FinancialTimelineInsert {
  user_id: string;
  title: string;
  category: CommitmentCategory;
  provider?: string | null;
  monthly_amount: number;
  principal_amount?: number | null;
  interest_rate?: number | null;
  start_date: string;
  end_date?: string | null;
  total_months: number;
  status?: CommitmentStatus;
  notes?: string | null;
}

export interface FinancialTimelineUpdate {
  title?: string;
  category?: CommitmentCategory;
  provider?: string | null;
  monthly_amount?: number;
  principal_amount?: number | null;
  interest_rate?: number | null;
  start_date?: string;
  end_date?: string | null;
  total_months?: number;
  status?: CommitmentStatus;
  notes?: string | null;
}

// ── Commitments (NEW) ──────────────────────────────────────────────────────
export const NEW_COMMITMENT_CATEGORIES = [
  'phone_emi', 'laptop_emi', 'vehicle_loan', 'home_loan',
  'credit_card_emi', 'insurance', 'sip', 'subscription',
  'education_loan', 'personal_loan', 'family_expense',
  'business_expense', 'other'
] as const;
export type NewCommitmentCategory = (typeof NEW_COMMITMENT_CATEGORIES)[number];

export const NEW_COMMITMENT_STATUSES = [
  'upcoming', 'active', 'due_soon', 'overdue',
  'paused', 'completed', 'closed_early', 'refinanced'
] as const;
export type NewCommitmentStatus = (typeof NEW_COMMITMENT_STATUSES)[number];

// Health Score impact map (deterministic baseline)
export const HEALTH_SCORE_IMPACT: Record<NewCommitmentCategory, number> = {
  phone_emi: -3, laptop_emi: -3, vehicle_loan: -8,
  home_loan: -12, credit_card_emi: -5, insurance: -1,
  sip: +6, subscription: -1, education_loan: -6,
  personal_loan: -7, family_expense: -2,
  business_expense: -4, other: -2,
};

export interface Commitment {
  id: string;
  user_id: string;
  title: string;
  category: NewCommitmentCategory;
  provider: string | null;
  description: string | null;
  original_amount: number;
  outstanding_balance: number;
  monthly_amount: number;
  interest_rate: number;
  start_date: string;
  end_date: string | null;
  next_due_date: string | null;
  progress_percentage: number;
  months_completed: number;
  months_remaining: number;
  status: NewCommitmentStatus;
  created_at: string;
  updated_at: string;
}

export interface CommitmentInsert {
  user_id: string;
  title: string;
  category: NewCommitmentCategory;
  provider?: string | null;
  description?: string | null;
  original_amount?: number;
  outstanding_balance?: number;
  monthly_amount: number;
  interest_rate?: number;
  start_date: string;
  end_date?: string | null;
}

export interface CommitmentUpdate {
  title?: string;
  category?: NewCommitmentCategory;
  provider?: string | null;
  description?: string | null;
  original_amount?: number;
  outstanding_balance?: number;
  monthly_amount?: number;
  interest_rate?: number;
  start_date?: string;
  end_date?: string | null;
  next_due_date?: string | null;
  progress_percentage?: number;
  months_completed?: number;
  months_remaining?: number;
  status?: NewCommitmentStatus;
}

export interface CommitmentPayment {
  id: string;
  commitment_id: string;
  user_id: string;
  amount: number;
  paid_date: string;
  payment_mode: 'auto' | 'manual' | 'partial' | 'prepayment';
  notes: string | null;
  created_at: string;
}

export interface CommitmentPaymentInsert {
  commitment_id: string;
  user_id: string;
  amount: number;
  paid_date?: string;
  payment_mode?: 'auto' | 'manual' | 'partial' | 'prepayment';
  notes?: string | null;
}

export interface CommitmentAIInsight {
  id: string;
  commitment_id: string;
  user_id: string;
  affordability_score: number | null;
  risk_score: number | null;
  financial_impact_score: number | null;
  health_score_impact: number | null;
  projected_health_score: number | null;
  recommendation: string | null;
  generated_at: string;
}

export interface CommitmentNotification {
  id: string;
  commitment_id: string;
  user_id: string;
  type: 'due_soon' | 'overdue' | 'completed' | 'milestone' | 'health_impact' | 'payment_recorded';
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface CommitmentTemplate {
  label: string;
  category: NewCommitmentCategory;
  icon: string;
  defaultMonths: number;
  defaultRate: number;
}
export * from './commitments';