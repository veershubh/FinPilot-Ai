/**
 * EMI calculation utilities.
 * All functions operate purely on numbers and never depend on external services.
 */

/** Convert any value to a number, defaulting to 0 for invalid inputs */
export function toNumber(value: any): number {
  const n = Number(value);
  return Number.isNaN(n) ? 0 : n;
}

/** Calculate monthly EMI based on principal, annual interest rate and tenure (months) */
export function calcEMI(principal: number, annualInterestRate: number, months: number): number {
  const P = toNumber(principal);
  const r = toNumber(annualInterestRate) / 12 / 100; // monthly rate
  const n = toNumber(months);
  if (r === 0) return P / n;
  const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  return Number(emi.toFixed(2));
}

/** Total payment over the tenure */
export function calcTotalPayment(emi: number, months: number): number {
  return Number((emi * months).toFixed(2));
}

/** Total interest paid */
export function calcTotalInterest(totalPayment: number, principal: number): number {
  return Number((totalPayment - principal).toFixed(2));
}

/** Disposable income per month after expenses */
export function calcDisposableIncome(monthlyIncome: number, monthlyExpenses: number): number {
  return Number((monthlyIncome - monthlyExpenses).toFixed(2));
}

/** Determine if the EMI is affordable based on disposable income (<=30% rule) */
export function isAffordable(emi: number, disposableIncome: number): boolean {
  if (disposableIncome <= 0) return false;
  return emi / disposableIncome <= 0.3; // EMI should be <=30% of disposable income
}
