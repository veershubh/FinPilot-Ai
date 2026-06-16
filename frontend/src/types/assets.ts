// src/types/assets.ts

export const ASSET_CATEGORIES = [
  'bank_account',
  'fixed_deposit',
  'mutual_fund',
  'stock',
  'gold',
  'real_estate',
  'other',
] as const;
export type AssetCategory = (typeof ASSET_CATEGORIES)[number];

export const ASSET_STATUSES = ['active', 'matured', 'sold'] as const;
export type AssetStatus = (typeof ASSET_STATUSES)[number];

export const ASSET_CATEGORY_LABELS: Record<AssetCategory, string> = {
  bank_account: 'Bank Account',
  fixed_deposit: 'Fixed Deposit',
  mutual_fund: 'Mutual Fund',
  stock: 'Stock',
  gold: 'Gold',
  real_estate: 'Real Estate',
  other: 'Other',
};

export const ASSET_CATEGORY_COLORS: Record<AssetCategory, string> = {
  bank_account: '#3B82F6',
  fixed_deposit: '#8B5CF6',
  mutual_fund: '#10B981',
  stock: '#F59E0B',
  gold: '#EAB308',
  real_estate: '#EF4444',
  other: '#64748B',
};

export interface Asset {
  id: string;
  user_id: string;
  name: string;
  category: AssetCategory;
  institution: string | null;
  current_value: number;
  invested_value: number;
  returns_percentage: number;
  maturity_date: string | null;
  interest_rate: number;
  units: number | null;
  notes: string | null;
  status: AssetStatus;
  created_at: string;
  updated_at: string;
}

export interface AssetInsert {
  name: string;
  category: AssetCategory;
  institution?: string | null;
  current_value: number;
  invested_value?: number;
  returns_percentage?: number;
  maturity_date?: string | null;
  interest_rate?: number;
  units?: number | null;
  notes?: string | null;
  status?: AssetStatus;
}

export interface AssetUpdate {
  name?: string;
  category?: AssetCategory;
  institution?: string | null;
  current_value?: number;
  invested_value?: number;
  returns_percentage?: number;
  maturity_date?: string | null;
  interest_rate?: number;
  units?: number | null;
  notes?: string | null;
  status?: AssetStatus;
}

export interface AssetSummary {
  totalValue: number;
  totalInvested: number;
  overallReturns: number;
  assetCount: number;
  allocation: { category: AssetCategory; label: string; value: number; color: string }[];
}
