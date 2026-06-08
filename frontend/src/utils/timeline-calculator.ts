// src/utils/timeline-calculator.ts
/**
 * FinPilot — Financial Timeline Calculator
 * Pure functions for commitment progress, health score, and forecasts.
 * No server deps — safe for client & server.
 */

import type { FinancialTimeline, CommitmentStatus } from "@/types/database";

// ── Commitment Progress ────────────────────────────────────────────────────

export interface CommitmentProgress {
  monthsElapsed: number;
  monthsRemaining: number;
  completionPercent: number;
  totalPaid: number;
  totalRemaining: number;
  computedStatus: CommitmentStatus;
  nextDueDate: string | null;
  impactScore: number; // 1-20, higher = more financial impact
}

export function calcCommitmentProgress(item: FinancialTimeline): CommitmentProgress {
  const now = new Date();
  const start = new Date(item.start_date);
  const end = item.end_date ? new Date(item.end_date) : null;

  const msPerMonth = 30.44 * 24 * 60 * 60 * 1000;
  const monthsElapsed = Math.max(0, Math.floor((now.getTime() - start.getTime()) / msPerMonth));
  const monthsRemaining = Math.max(0, item.total_months - monthsElapsed);

  const completionPercent =
    item.total_months > 0 ? Math.min(100, Math.round((monthsElapsed / item.total_months) * 100)) : 0;

  const totalPaid = monthsElapsed * item.monthly_amount;
  const totalRemaining = monthsRemaining * item.monthly_amount;

  // Compute live status
  let computedStatus: CommitmentStatus = item.status;
  if (item.status !== "paused") {
    if (monthsRemaining <= 0) {
      computedStatus = "completed";
    } else if (start > now) {
      computedStatus = "upcoming";
    } else {
      computedStatus = "active";
    }
  }

  // Next due date: 1st of next month from now (simplified)
  let nextDueDate: string | null = null;
  if (computedStatus === "active") {
    const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    nextDueDate = next.toISOString().split("T")[0];
  }

  // Impact score: higher monthly_amount relative to total = higher impact
  // Scale 1-20 based on monthly burden
  const impactScore = Math.min(20, Math.max(1, Math.round(item.monthly_amount / 2500)));

  return {
    monthsElapsed,
    monthsRemaining,
    completionPercent,
    totalPaid,
    totalRemaining,
    computedStatus,
    nextDueDate,
    impactScore,
  };
}

// ── Financial Health Score ──────────────────────────────────────────────────

export interface HealthScoreInput {
  monthlyIncome: number;
  monthlyExpenses: number;
  currentSavings: number;
  totalMonthlyCommitments: number;
  totalDebt: number;          // sum of remaining principal across all commitments
  activeCommitmentCount: number;
}

export interface HealthScoreResult {
  score: number;           // 0-100
  grade: string;           // Excellent / Good / Fair / Poor
  breakdown: {
    debtToIncomeRatio: number;
    savingsRate: number;
    commitmentBurden: number;
    emergencyFundMonths: number;
    cashFlowScore: number;
  };
}

export function calcHealthScore(input: HealthScoreInput): HealthScoreResult {
  const { monthlyIncome, monthlyExpenses, currentSavings, totalMonthlyCommitments, totalDebt, activeCommitmentCount } = input;

  // Guard against zero income
  const income = Math.max(monthlyIncome, 1);

  // 1. Debt-to-Income ratio (lower is better, 25 points)
  const dti = totalDebt / (income * 12);
  const dtiScore = Math.max(0, 25 - Math.round(dti * 25));

  // 2. Savings rate (higher is better, 25 points)
  const savingsRate = (income - monthlyExpenses - totalMonthlyCommitments) / income;
  const savingsScore = Math.max(0, Math.min(25, Math.round(savingsRate * 100)));

  // 3. Commitment burden (lower is better, 25 points)
  const commitmentRatio = totalMonthlyCommitments / income;
  const commitmentScore = Math.max(0, 25 - Math.round(commitmentRatio * 50));

  // 4. Emergency fund (more months is better, 15 points)
  const emergencyMonths = currentSavings / Math.max(monthlyExpenses, 1);
  const emergencyScore = Math.min(15, Math.round(emergencyMonths * 2.5));

  // 5. Active commitment count penalty (10 points max)
  const countScore = Math.max(0, 10 - activeCommitmentCount);

  const score = Math.max(0, Math.min(100, dtiScore + savingsScore + commitmentScore + emergencyScore + countScore));

  let grade = "Poor";
  if (score >= 80) grade = "Excellent";
  else if (score >= 60) grade = "Good";
  else if (score >= 40) grade = "Fair";

  return {
    score,
    grade,
    breakdown: {
      debtToIncomeRatio: Math.round(dti * 100),
      savingsRate: Math.round(savingsRate * 100),
      commitmentBurden: Math.round(commitmentRatio * 100),
      emergencyFundMonths: Math.round(emergencyMonths * 10) / 10,
      cashFlowScore: Math.max(0, income - monthlyExpenses - totalMonthlyCommitments),
    },
  };
}

// ── Forecast Engine ────────────────────────────────────────────────────────

export interface ForecastPoint {
  label: string;          // "Today", "6 Months", "12 Months"
  monthsFromNow: number;
  totalMonthlyBurden: number;
  activeCount: number;
  completingItems: string[];
}

export function calcForecast(
  commitments: FinancialTimeline[],
  months: number[] = [0, 6, 12, 24],
): ForecastPoint[] {
  const now = new Date();

  return months.map((m) => {
    const futureDate = new Date(now);
    futureDate.setMonth(futureDate.getMonth() + m);

    let totalBurden = 0;
    let activeCount = 0;
    const completing: string[] = [];

    commitments.forEach((c) => {
      const progress = calcCommitmentProgress(c);
      const remainingAtPoint = progress.monthsRemaining - m;

      if (remainingAtPoint > 0 && c.status !== "completed" && c.status !== "paused") {
        totalBurden += c.monthly_amount;
        activeCount++;
      } else if (remainingAtPoint <= 0 && progress.monthsRemaining > 0) {
        completing.push(c.title);
      }
    });

    const labels: Record<number, string> = { 0: "Today", 6: "6 Months", 12: "12 Months", 24: "24 Months" };
    return {
      label: labels[m] ?? `${m} Months`,
      monthsFromNow: m,
      totalMonthlyBurden: totalBurden,
      activeCount,
      completingItems: completing,
    };
  });
}

// ── Simulator ──────────────────────────────────────────────────────────────

export interface SimulatorInput {
  currentScore: number;
  currentMonthlyCommitments: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  currentSavings: number;
  totalDebt: number;
  activeCount: number;
  // New hypothetical commitment
  newMonthlyAmount: number;
  newTotalMonths: number;
  newPrincipal: number;
}

export interface SimulatorResult {
  newScore: number;
  scoreDelta: number;
  newDebtRatio: number;
  newBurdenRatio: number;
  riskLevel: "Low" | "Medium" | "High";
  recommendation: string;
}

export function simulateImpact(input: SimulatorInput): SimulatorResult {
  const newCommitments = input.currentMonthlyCommitments + input.newMonthlyAmount;
  const newDebt = input.totalDebt + input.newPrincipal;

  const newResult = calcHealthScore({
    monthlyIncome: input.monthlyIncome,
    monthlyExpenses: input.monthlyExpenses,
    currentSavings: input.currentSavings,
    totalMonthlyCommitments: newCommitments,
    totalDebt: newDebt,
    activeCommitmentCount: input.activeCount + 1,
  });

  const scoreDelta = newResult.score - input.currentScore;
  const burdenRatio = Math.round((newCommitments / Math.max(input.monthlyIncome, 1)) * 100);
  const debtRatio = Math.round((newDebt / Math.max(input.monthlyIncome * 12, 1)) * 100);

  let riskLevel: "Low" | "Medium" | "High" = "Low";
  if (burdenRatio > 50 || debtRatio > 60) riskLevel = "High";
  else if (burdenRatio > 35 || debtRatio > 40) riskLevel = "Medium";

  let recommendation = "This commitment fits well within your financial capacity.";
  if (riskLevel === "High") {
    recommendation = "This would significantly strain your finances. Consider a smaller amount or longer tenure.";
  } else if (riskLevel === "Medium") {
    recommendation = "Affordable but will reduce your financial flexibility. Ensure emergency fund is adequate.";
  }

  return {
    newScore: newResult.score,
    scoreDelta,
    newDebtRatio: debtRatio,
    newBurdenRatio: burdenRatio,
    riskLevel,
    recommendation,
  };
}
