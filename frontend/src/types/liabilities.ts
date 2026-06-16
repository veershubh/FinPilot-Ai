// src/types/liabilities.ts

export const LIABILITY_CATEGORIES = [
  'home_loan',
  'auto_loan',
  'education_loan',
  'personal_loan',
  'credit_card',
  'other',
] as const;

export type LiabilityCategory = (typeof LIABILITY_CATEGORIES)[number];

export const LIABILITY_STATUSES = ['active', 'paid_off'] as const;
export type LiabilityStatus = (typeof LIABILITY_STATUSES)[number];

export const LIABILITY_CATEGORY_LABELS: Record<LiabilityCategory, string> = {
  home_loan: 'Home Loan',
  auto_loan: 'Auto Loan',
  education_loan: 'Education Loan',
  personal_loan: 'Personal Loan',
  credit_card: 'Credit Card',
  other: 'Other',
};

export const LIABILITY_CATEGORY_COLORS: Record<LiabilityCategory, string> = {
  home_loan: '#10B981',     // Emerald
  auto_loan: '#3B82F6',     // Blue
  education_loan: '#8B5CF6', // Violet
  personal_loan: '#F59E0B',  // Amber
  credit_card: '#EF4444',    // Red
  other: '#64748B',          // Slate
};

export interface Liability {
  id: string;
  user_id: string;
  name: string;
  category: LiabilityCategory;
  institution: string | null;
  outstanding_balance: number;
  original_amount: number;
  interest_rate: number;
  monthly_emi: number;
  start_date: string | null;
  end_date: string | null;
  notes: string | null;
  status: LiabilityStatus;
  created_at: string;
  updated_at: string;
}

export interface LiabilityInsert {
  name: string;
  category: LiabilityCategory;
  institution?: string | null;
  outstanding_balance: number;
  original_amount?: number;
  interest_rate?: number;
  monthly_emi?: number;
  start_date?: string | null;
  end_date?: string | null;
  notes?: string | null;
  status?: LiabilityStatus;
}

export interface LiabilityUpdate extends Partial<LiabilityInsert> {}

export interface LiabilitySummary {
  totalOutstanding: number;
  totalOriginal: number;
  totalMonthlyEmi: number;
  liabilityCount: number;
  allocation: { category: LiabilityCategory; label: string; value: number; color: string }[];
  nextDue?: { name: string; amount: number; date: string | null };
}

export interface LiabilityHistory {
  id: string;
  liability_id: string;
  user_id: string;
  recorded_date: string;
  outstanding_balance: number;
  created_at: string;
}
