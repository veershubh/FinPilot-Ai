// src/types/commitments.ts

/** Commitment lifecycle states */
export const COMMITMENT_STATUSES = [
  'upcoming',
  'active',
  'due_soon',
  'overdue',
  'paused',
  'completed',
  'closed_early',
  'refinanced',
] as const;
export type CommitmentStatus = typeof COMMITMENT_STATUSES[number];

/** Commitment categories */
export const COMMITMENT_CATEGORIES = [
  'phone_emi',
  'laptop_emi',
  'vehicle_loan',
  'home_loan',
  'credit_card_emi',
  'insurance',
  'sip',
  'subscription',
  'education_loan',
  'personal_loan',
  'family_expense',
  'business_expense',
  'other',
] as const;
export type CommitmentCategory = typeof COMMITMENT_CATEGORIES[number];

/** Deterministic health score impact per category (Δ points) */
export const HEALTH_SCORE_IMPACT: Record<CommitmentCategory, number> = {
  phone_emi: -3,
  laptop_emi: -3,
  vehicle_loan: -8,
  home_loan: -12,
  credit_card_emi: -5,
  insurance: -1,
  sip: 6,
  subscription: -1,
  education_loan: -6,
  personal_loan: -7,
  family_expense: -2,
  business_expense: -4,
  other: -2,
};

/** Commitment template for UI pre‑fill */
export interface CommitmentTemplate {
  label: string; // e.g. "Phone EMI"
  category: CommitmentCategory;
  icon: string; // lucide icon name
  defaultRate: number; // annual %
  defaultMonths: number;
}

/** Core Commitment entity */
export interface Commitment {
  id: string;
  user_id: string;
  title: string;
  category: CommitmentCategory;
  provider?: string | null;
  description?: string | null;
  original_amount: number;
  outstanding_balance: number;
  monthly_amount: number;
  interest_rate: number;
  start_date: string; // ISO date
  end_date?: string | null;
  next_due_date?: string | null;
  progress_percentage: number;
  months_completed: number;
  months_remaining: number;
  status: CommitmentStatus;
  created_at: string;
  updated_at: string;
}

/** Insert payload (client‑side) */
export type CommitmentInsert = Omit<Commitment, 'id' | 'created_at' | 'updated_at' | 'outstanding_balance' | 'progress_percentage' | 'months_completed' | 'months_remaining' | 'status' | 'next_due_date'>;

/** Partial update payload */
export type CommitmentUpdate = Partial<Omit<Commitment, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;

/** Payment entity */
export interface CommitmentPayment {
  id: string;
  commitment_id: string;
  user_id: string;
  amount: number;
  paid_date: string;
  payment_mode?: string | null;
  notes?: string | null;
  created_at: string;
}

export type CommitmentPaymentInsert = Omit<CommitmentPayment, 'id' | 'created_at'>;

/** AI Insight entity */
export interface CommitmentAIInsight {
  id: string;
  commitment_id: string;
  user_id: string;
  affordability_score?: number | null;
  risk_score?: number | null;
  financial_impact_score?: number | null;
  health_score_impact?: number | null;
  projected_health_score?: number | null;
  recommendation?: string | null;
  generated_at: string;
}

/** Notification entity */
export interface CommitmentNotification {
  id: string;
  commitment_id: string;
  user_id: string;
  type: 'due_soon' | 'overdue' | 'completed' | 'milestone' | 'health_impact' | 'payment_recorded';
  message: string;
  is_read: boolean;
  created_at: string;
}

/** Prepayment / principal reduction entity */
export interface CommitmentPrepayment {
  id: string;
  commitment_id: string;
  user_id: string;
  amount: number;
  interest_saved: number;
  months_reduced: number;
  new_outstanding: number;
  new_tenure_months: number;
  created_at: string;
}

/** Loan categories that support prepayment */
export const LOAN_CATEGORIES: CommitmentCategory[] = [
  'vehicle_loan',
  'home_loan',
  'education_loan',
  'personal_loan',
  'phone_emi',
  'laptop_emi',
  'credit_card_emi',
];
