export function toNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function toDateOnly(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function addMonths(dateString: string, months: number): string {
  const date = new Date(`${dateString}T00:00:00`);
  date.setMonth(date.getMonth() + months);
  return toDateOnly(date);
}

export function monthDiff(startDate: string, endDate: string | null | undefined): number {
  if (!endDate) return 0;

  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;

  const months = (end.getFullYear() - start.getFullYear()) * 12 + end.getMonth() - start.getMonth();
  return Math.max(0, months);
}

export function nextMonthlyDueDate(startDate: string, monthsCompleted = 0, from = new Date()): string {
  const start = new Date(`${startDate}T00:00:00`);
  if (Number.isNaN(start.getTime())) return toDateOnly(from);

  const due = new Date(start);
  const today = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const completed = Math.max(0, Math.floor(monthsCompleted));
  due.setMonth(start.getMonth() + completed);

  while (due < today) {
    due.setMonth(due.getMonth() + 1);
  }

  return toDateOnly(due);
}

export function calculateProgress(originalAmount: number, outstandingBalance: number): number {
  if (originalAmount <= 0) return outstandingBalance <= 0 ? 100 : 0;
  return Math.max(0, Math.min(100, Math.round(((originalAmount - outstandingBalance) / originalAmount) * 100)));
}

export function buildCommitmentTracking(input: {
  originalAmount: number;
  outstandingBalance?: number | null;
  monthlyAmount: number;
  startDate: string;
  endDate?: string | null;
  monthsCompleted?: number | null;
}) {
  const originalAmount = Math.max(0, toNumber(input.originalAmount));
  const monthlyAmount = Math.max(0, toNumber(input.monthlyAmount));
  const outstandingBalance = Math.max(0, toNumber(input.outstandingBalance, originalAmount));
  const monthsCompleted = Math.max(0, Math.floor(toNumber(input.monthsCompleted)));
  const totalMonthsFromDates = monthDiff(input.startDate, input.endDate);
  const totalMonthsFromAmount = monthlyAmount > 0 ? Math.ceil(originalAmount / monthlyAmount) : 0;
  const totalMonths = totalMonthsFromDates || totalMonthsFromAmount;
  const progressPercentage = calculateProgress(originalAmount, outstandingBalance);
  const completed = outstandingBalance <= 0 || progressPercentage >= 100;

  return {
    outstandingBalance,
    progressPercentage,
    monthsCompleted,
    monthsRemaining: completed ? 0 : Math.max(0, totalMonths - monthsCompleted),
    nextDueDate: completed ? null : nextMonthlyDueDate(input.startDate, monthsCompleted),
    status: completed ? "completed" : "active",
  };
}

export function validatePositive(value: unknown, fieldLabel: string): string | null {
  return toNumber(value) > 0 ? null : `${fieldLabel} must be greater than 0`;
}
