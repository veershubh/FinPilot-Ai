/**
 * FinPilot AI - EMI Analysis Result Display
 */

"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Lightbulb,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { HealthScoreGauge } from "@/components/dashboard/HealthScoreGauge";
import { formatCurrency, formatPercent, getRiskBgColor, getRiskColor } from "@/utils/formatters";
import type { PurchaseAnalysisResponse } from "@/types";

interface EMIResultProps {
  result: PurchaseAnalysisResponse;
}

export function EMIResult({ result }: EMIResultProps) {
  const getRecIcon = (rec: string) => {
    if (rec.includes("Full Payment")) return <CheckCircle2 className="w-5 h-5" />;
    if (rec.includes("EMI")) return <TrendingUp className="w-5 h-5" />;
    return <XCircle className="w-5 h-5" />;
  };

  const getRecColor = (rec: string) => {
    if (rec.includes("Full Payment")) return "from-emerald-500 to-teal-500";
    if (rec.includes("EMI")) return "from-blue-500 to-cyan-500";
    return "from-red-500 to-orange-500";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-5"
    >
      {/* Recommendation Banner */}
      <div className={`rounded-2xl bg-gradient-to-r ${getRecColor(result.recommendation)} p-[1px]`}>
        <div className="rounded-2xl bg-[#0d0d14]/95 backdrop-blur-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            {getRecIcon(result.recommendation)}
            <h3 className="text-xl font-bold text-white">{result.recommendation}</h3>
          </div>
          <p className="text-sm text-gray-300">{result.reason}</p>
        </div>
      </div>

      {/* Score + Risk Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Health Score Gauge */}
        <Card className="flex items-center justify-center py-6">
          <HealthScoreGauge score={result.financial_health_score} />
        </Card>

        {/* Key Metrics */}
        <Card className="p-6 space-y-4 md:col-span-2">
          <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Key Metrics</h4>
          <div className="grid grid-cols-2 gap-4">
            <MetricItem label="Monthly EMI" value={formatCurrency(result.monthly_emi)} />
            <MetricItem label="Remaining Savings" value={formatCurrency(result.remaining_savings)} />
            <MetricItem
              label="Risk Level"
              value={result.risk_level}
              valueClass={getRiskColor(result.risk_level)}
            />
            <MetricItem
              label="EMI-to-Income"
              value={formatPercent(result.financial_breakdown.emi_to_income_ratio)}
            />
          </div>

          {/* Risk Badge */}
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold ${getRiskBgColor(result.risk_level)} ${getRiskColor(result.risk_level)}`}>
            {result.risk_level === "Low" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
            {result.risk_level} Risk
          </div>
        </Card>
      </div>

      {/* Financial Breakdown Table */}
      <Card className="p-6">
        <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
          Financial Breakdown
        </h4>
        <div className="space-y-3">
          <BreakdownRow label="Disposable Income" value={formatCurrency(result.financial_breakdown.monthly_disposable_income)} />
          <BreakdownRow label="Estimated Monthly EMI" value={formatCurrency(result.financial_breakdown.estimated_monthly_emi)} />
          <BreakdownRow label="Total EMI Cost" value={formatCurrency(result.financial_breakdown.total_emi_cost)} />
          <BreakdownRow label="Interest Paid" value={formatCurrency(result.financial_breakdown.interest_paid)} highlight />
          <BreakdownRow label="Savings After Full Payment" value={formatCurrency(result.financial_breakdown.savings_after_full_payment)} />
          <BreakdownRow label="EMI-to-Income Ratio" value={formatPercent(result.financial_breakdown.emi_to_income_ratio)} />
          <BreakdownRow label="EMI-to-Disposable Ratio" value={formatPercent(result.financial_breakdown.emi_to_disposable_ratio)} />
        </div>
      </Card>

      {/* Detailed Reasons */}
      {result.detailed_reasons.length > 0 && (
        <Card className="p-6">
          <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
            Analysis Details
          </h4>
          <ul className="space-y-3">
            {result.detailed_reasons.map((reason, i) => (
              <li key={i} className="flex items-start gap-3">
                <ArrowRight className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <span className="text-sm text-gray-300">{reason}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Tips */}
      {result.tips.length > 0 && (
        <Card className="p-6 border-amber-500/10">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <h4 className="text-sm font-semibold text-amber-400 uppercase tracking-wider">
              Smart Tips
            </h4>
          </div>
          <ul className="space-y-2.5">
            {result.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center text-xs font-bold shrink-0">
                  {i + 1}
                </span>
                <span className="text-sm text-gray-300">{tip}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </motion.div>
  );
}

/* ── Helper Sub-Components ─────────────────────────────────── */

function MetricItem({ label, value, valueClass = "text-white" }: { label: string; value: string; valueClass?: string }) {
  return (
    <div>
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className={`text-lg font-bold ${valueClass}`}>{value}</p>
    </div>
  );
}

function BreakdownRow({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
      <span className="text-sm text-gray-400">{label}</span>
      <span className={`text-sm font-semibold ${highlight ? "text-amber-400" : "text-white"}`}>
        {value}
      </span>
    </div>
  );
}
