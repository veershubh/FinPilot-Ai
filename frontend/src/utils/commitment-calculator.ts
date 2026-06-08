/**
 * Commitment Calculator Utilities
 * Pure functions for calculating commitment progress, costs, and health scores.
 */

export interface ProgressResult {
  monthsElapsed: number;
  monthsRemaining: number;
  completionPct: number;
}

export interface TotalCostResult {
  totalPaid: number;
  interestPaid: number;
}

export interface HealthScoreInput {
  income: number;
  totalExpenses: number;
  totalCommitments: number;
  totalDebt: number;
  savings: number;
}

export interface HealthScoreResult {
  score: number;
  grade: string;
  breakdown: {
    incomeScore: number;
    expenseScore: number;
    commitmentScore: number;
    debtScore: number;
    savingsScore: number;
  };
}

export interface SimulationResult {
  currentScore: number;
  projectedScore: number;
  scoreDelta: number;
  burdenRatio: string;
  monthlyFreeCash: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  recommendation: string;
}

/**
 * Calculate progress for a commitment
 */
export function calcProgress(
  startDate: string,
  endDate: string | null,
  monthsCompleted: number,
  monthsRemaining: number
): ProgressResult {
  const start = new Date(startDate);
  const now = new Date();

  const startYear = start.getFullYear();
  const startMonth = start.getMonth();
  const nowYear = now.getFullYear();
  const nowMonth = now.getMonth();

  const monthsElapsed = (nowYear - startYear) * 12 + (nowMonth - startMonth);
  const elapsed = Math.max(0, monthsElapsed);

  const remaining = Math.max(0, monthsRemaining);
  const totalMonths = elapsed + remaining || monthsCompleted + monthsRemaining;
  const completionPct = totalMonths > 0 ? Math.round((monthsCompleted / totalMonths) * 100) : 0;

  return {
    monthsElapsed: elapsed,
    monthsRemaining: remaining,
    completionPct
  };
}

/**
 * Calculate outstanding balance after payments
 */
export function calcOutstandingBalance(
  originalAmount: number,
  payments: Array<{ amount: number }>
): number {
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  return Math.max(0, originalAmount - totalPaid);
}

/**
 * Calculate next due date (monthly cadence)
 */
export function calcNextDueDate(
  startDate: string,
  monthsCompleted: number
): string {
  const start = new Date(startDate);
  const nextDue = new Date(start);
  nextDue.setMonth(start.getMonth() + monthsCompleted);
  return nextDue.toISOString().split('T')[0];
}

/**
 * Calculate total cost including interest
 */
export function calcTotalCost(
  principal: number,
  rate: number,
  months: number
): TotalCostResult {
  const monthlyRate = rate / 100 / 12;
  const emi = monthlyRate > 0
    ? (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1)
    : principal / months;

  const totalPaid = emi * months;
  const interestPaid = totalPaid - principal;

  return {
    totalPaid: Math.round(totalPaid),
    interestPaid: Math.round(interestPaid)
  };
}

/**
 * Calculate affordability score (0-100)
 */
export function calcAffordability(
  income: number,
  expenses: number,
  existingCommitments: number,
  newAmount: number
): number {
  const availableIncome = income - expenses - existingCommitments;
  const ratio = availableIncome / income;

  if (ratio < 0) return 0;
  if (ratio > 0.3) return 100;

  return Math.round(ratio * (100 / 0.3));
}

/**
 * Calculate health score
 */
export function calcHealthScore(input: HealthScoreInput): HealthScoreResult {
  const { income, totalExpenses, totalCommitments, totalDebt, savings } = input;

  const expenseRatio = totalExpenses / income;
  const commitmentRatio = totalCommitments / income;
  const debtRatio = totalDebt / (income * 12);
  const savingsRatio = savings / (totalExpenses * 3); // 3 months emergency fund target

  const incomeScore = income > 0 ? Math.min(100, (income / 100000) * 25) : 0;
  const expenseScore = expenseRatio <= 0.5 ? 100 - (expenseRatio * 200) : 0;
  const commitmentScore = commitmentRatio <= 0.3 ? 100 - (commitmentRatio * 333) : 0;
  const debtScore = debtRatio <= 0.3 ? 100 - (debtRatio * 333) : 0;
  const savingsScore = Math.min(100, savingsRatio * 50);

  const score = Math.round(
    (incomeScore * 0.15 + expenseScore * 0.3 + commitmentScore * 0.2 + debtScore * 0.2 + savingsScore * 0.1)
  );

  let grade = 'A';
  if (score < 60) grade = 'C';
  else if (score < 80) grade = 'B';
  else if (score >= 90) grade = 'A+';

  return {
    score,
    grade,
    breakdown: {
      incomeScore: Math.round(incomeScore),
      expenseScore: Math.round(expenseScore),
      commitmentScore: Math.round(commitmentScore),
      debtScore: Math.round(debtScore),
      savingsScore: Math.round(savingsScore)
    }
  };
}

/**
 * Simulate impact of a new commitment
 */
export function simulateNewCommitment(
  currentState: HealthScoreInput,
  newCommitment: {
    monthly_amount: number;
    original_amount: number;
    category: string;
  },
  healthScoreImpactMap: Record<string, number>
): SimulationResult {
  const currentScore = calcHealthScore(currentState).score;

  const newCommitmentTotal = currentState.totalCommitments + newCommitment.monthly_amount;
  const newBurdenRatio = (newCommitmentTotal / currentState.income) * 100;

  const impact = healthScoreImpactMap[newCommitment.category] ?? -2;
  const projectedScore = Math.max(0, currentScore + impact);

  const debtRatio = (currentState.totalDebt + newCommitment.original_amount) / (currentState.income * 12);
  const riskLevel: 'Low' | 'Medium' | 'High' =
    debtRatio < 0.3 ? 'Low' :
    debtRatio < 0.5 ? 'Medium' : 'High';

  const freeCash = currentState.income - currentState.totalExpenses - newCommitmentTotal;

  const recommendation = riskLevel === 'High'
    ? `Reduce this commitment by ₹${Math.round((newCommitment.monthly_amount * 0.4))} to bring risk down.`
    : `This commitment is within safe limits.`;

  return {
    currentScore,
    projectedScore,
    scoreDelta: projectedScore - currentScore,
    burdenRatio: `${Math.round(newBurdenRatio)}%`,
    monthlyFreeCash: Math.round(freeCash),
    riskLevel,
    recommendation
  };
}