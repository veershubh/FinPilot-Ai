// src/types/liabilities.ts

export const LIABILITY_CATEGORIES = [
  'home_loan',
  'vehicle_loan',
  'personal_loan',
  'education_loan',
  'credit_card',
  'business_loan',
  'other',
] as const;
export type LiabilityCategory = (typeof LIABILITY_CATEGORIES)[number];

export const LIABILITY_STATUSES = ['active', 'closed', 'defaulted'] as const;
export type LiabilityStatus = (typeof LIABILITY_STATUSES)[number];

export const LIABILITY_CATEGORY_LABELS: Record<LiabilityCategory, string> = {
  home_loan: 'Home Loan',
  vehicle_loan: 'Vehicle Loan',
  personal_loan: 'Personal Loan',
  education_loan: 'Education Loan',
  credit_card: 'Credit Card',
  business_loan: 'Business Loan',
  other: 'Other',
};

export const LIABILITY_CATEGORY_COLORS: Record<LiabilityCategory, string> = {
  home_loan: '#EF4444',
  vehicle_loan: '#F59E0B',
  personal_loan: '#8B5CF6',
  education_loan: '#3B82F6',
  credit_card: '#EC4899',
  business_loan: '#14B8A6',
  other: '#64748B',
};

export interface Liability {
  id: string;
  user_id: string;
  name: string;
  category: LiabilityCategory;
  lender: string | null;
  original_amount: number;
  outstanding_balance: number;
  monthly_emi: number;
  interest_rate: number;
  start_date: string;
  end_date: string | null;
  next_due_date: string | null;
  status: LiabilityStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface LiabilityInsert {
  name: string;
  category: LiabilityCategory;
  lender?: string | null;
  original_amount: number;
  outstanding_balance?: number;
  monthly_emi: number;
  interest_rate?: number;
  start_date: string;
  end_date?: string | null;
  next_due_date?: string | null;
  status?: LiabilityStatus;
  notes?: string | null;
}

export interface LiabilityUpdate {
  name?: string;
  category?: LiabilityCategory;
  lender?: string | null;
  original_amount?: number;
  outstanding_balance?: number;
  monthly_emi?: number;
  interest_rate?: number;
  start_date?: string;
  end_date?: string | null;
  next_due_date?: string | null;
  status?: LiabilityStatus;
  notes?: string | null;
}

export interface LiabilitySummary {
  totalDebt: number;
  totalMonthlyObligation: number;
  weightedAvgRate: number;
  liabilityCount: number;
  categoryBreakdown: { category: LiabilityCategory; label: string; value: number; color: string }[];
}
