/**
 * FinPilot AI - Formatting Utilities
 * =====================================
 * Reusable formatting functions for currency, numbers, and percentages.
 */

/**
 * Format a number as Indian Rupee currency.
 * Example: 80000 → "₹80,000"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a number as a percentage.
 * Example: 47.37 → "47.4%"
 */
export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Format a number with commas.
 * Example: 95000 → "95,000"
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-IN").format(value);
}

/**
 * Get a risk level color class based on risk level string.
 */
export function getRiskColor(risk: string): string {
  switch (risk) {
    case "Low":
      return "text-emerald-400";
    case "Medium":
      return "text-amber-400";
    case "High":
      return "text-red-400";
    default:
      return "text-gray-400";
  }
}

/**
 * Get a risk level background class.
 */
export function getRiskBgColor(risk: string): string {
  switch (risk) {
    case "Low":
      return "bg-emerald-500/20 border-emerald-500/30";
    case "Medium":
      return "bg-amber-500/20 border-amber-500/30";
    case "High":
      return "bg-red-500/20 border-red-500/30";
    default:
      return "bg-gray-500/20 border-gray-500/30";
  }
}

/**
 * Get health score color based on score value.
 */
export function getHealthColor(score: number): string {
  if (score >= 70) return "#10b981";
  if (score >= 40) return "#f59e0b";
  return "#ef4444";
}
