// src/types/strategy.ts

export const GOAL_CATEGORIES = [
  'retirement',
  'emergency_fund',
  'debt_payoff',
  'investment',
  'savings',
  'education',
  'home',
  'other',
] as const;
export type GoalCategory = (typeof GOAL_CATEGORIES)[number];

export const GOAL_PRIORITIES = ['high', 'medium', 'low'] as const;
export type GoalPriority = (typeof GOAL_PRIORITIES)[number];

export const GOAL_STATUSES = ['active', 'completed', 'paused'] as const;
export type GoalStatus = (typeof GOAL_STATUSES)[number];

export const GOAL_CATEGORY_LABELS: Record<GoalCategory, string> = {
  retirement: 'Retirement',
  emergency_fund: 'Emergency Fund',
  debt_payoff: 'Debt Payoff',
  investment: 'Investment',
  savings: 'Savings',
  education: 'Education',
  home: 'Home',
  other: 'Other',
};

export const GOAL_CATEGORY_COLORS: Record<GoalCategory, string> = {
  retirement: '#8B5CF6',
  emergency_fund: '#EF4444',
  debt_payoff: '#F59E0B',
  investment: '#10B981',
  savings: '#3B82F6',
  education: '#EC4899',
  home: '#14B8A6',
  other: '#64748B',
};

export const GOAL_PRIORITY_COLORS: Record<GoalPriority, string> = {
  high: '#EF4444',
  medium: '#F59E0B',
  low: '#10B981',
};

export interface FinancialGoal {
  id: string;
  user_id: string;
  title: string;
  category: GoalCategory;
  target_amount: number;
  current_amount: number;
  monthly_contribution: number;
  target_date: string | null;
  priority: GoalPriority;
  status: GoalStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface GoalInsert {
  title: string;
  category: GoalCategory;
  target_amount: number;
  current_amount?: number;
  monthly_contribution?: number;
  target_date?: string | null;
  priority?: GoalPriority;
  status?: GoalStatus;
  notes?: string | null;
}

export interface GoalUpdate {
  title?: string;
  category?: GoalCategory;
  target_amount?: number;
  current_amount?: number;
  monthly_contribution?: number;
  target_date?: string | null;
  priority?: GoalPriority;
  status?: GoalStatus;
  notes?: string | null;
}

export interface StrategySummary {
  totalGoals: number;
  activeGoals: number;
  completedGoals: number;
  totalTarget: number;
  totalSaved: number;
  avgProgress: number;
  totalMonthlyContribution: number;
}
