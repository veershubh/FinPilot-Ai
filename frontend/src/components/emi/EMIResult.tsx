"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, XCircle, Lightbulb, TrendingUp, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { HealthScoreGauge } from "@/components/dashboard/HealthScoreGauge";
import { formatCurrency, formatPercent } from "@/utils/formatters";
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
    if (rec.includes("Full Payment")) return "from-[#10B981] to-[#059669]";
    if (rec.includes("EMI")) return "from-[#3B82F6] to-[#0EA5E9]";
    return "from-[#EF4444] to-[#F97316]";
  };

  const getRiskColor = (risk: string) => {
    if (risk === "Low") return "text-[#10B981]";
    if (risk === "Medium") return "text-[#F59E0B]";
    return "text-[#EF4444]";
  };

  const getRiskBg = (risk: string) => {
    if (risk === "Low") return "bg-[#10B981]/10 border-[#10B981]/20 text-[#10B981]";
    if (risk === "Medium") return "bg-[#F59E0B]/10 border-[#F59E0B]/20 text-[#F59E0B]";
    return "bg-[#EF4444]/10 border-[#EF4444]/20 text-[#EF4444]";
  };

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-5">
      {/* Recommendation Banner */}
      <div className={`rounded-2xl bg-gradient-to-r ${getRecColor(result.recommendation)} p-[1px]`}>
        <div className="rounded-2xl bg-[#0B1020]/95 backdrop-blur-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            {getRecIcon(result.recommendation)}
            <h3 className="text-xl font-bold text-white">{result.recommendation}</h3>
          </div>
          <p className="text-sm text-[#94A3B8]">{result.reason}</p>
        </div>
      </div>

      {/* Score + Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="flex items-center justify-center py-6">
          <HealthScoreGauge score={result.financial_health_score} />
        </Card>

        <Card className="p-6 space-y-4 md:col-span-2">
          <h4 className="text-sm font-semibold text-[#94A3B8] uppercase tracking-wider">Key Metrics</h4>
          <div className="grid grid-cols-2 gap-4">
            <div><p className="text-xs text-[#64748B] mb-0.5">Monthly EMI</p><p className="text-lg font-bold text-white">{formatCurrency(result.monthly_emi)}</p></div>
            <div><p className="text-xs text-[#64748B] mb-0.5">Remaining Savings</p><p className="text-lg font-bold text-white">{formatCurrency(result.remaining_savings)}</p></div>
            <div><p className="text-xs text-[#64748B] mb-0.5">Risk Level</p><p className={`text-lg font-bold ${getRiskColor(result.risk_level)}`}>{result.risk_level}</p></div>
            <div><p className="text-xs text-[#64748B] mb-0.5">EMI-to-Income</p><p className="text-lg font-bold text-white">{formatPercent(result.financial_breakdown.emi_to_income_ratio)}</p></div>
          </div>
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold ${getRiskBg(result.risk_level)}`}>
            {result.risk_level === "Low" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
            {result.risk_level} Risk
          </div>
        </Card>
      </div>

      {/* Breakdown */}
      <Card className="p-6">
        <h4 className="text-sm font-semibold text-[#94A3B8] uppercase tracking-wider mb-4">Financial Breakdown</h4>
        <div className="space-y-3">
          {[
            ["Disposable Income", formatCurrency(result.financial_breakdown.monthly_disposable_income), false],
            ["Estimated Monthly EMI", formatCurrency(result.financial_breakdown.estimated_monthly_emi), false],
            ["Total EMI Cost", formatCurrency(result.financial_breakdown.total_emi_cost), false],
            ["Interest Paid", formatCurrency(result.financial_breakdown.interest_paid), true],
            ["Savings After Full Payment", formatCurrency(result.financial_breakdown.savings_after_full_payment), false],
            ["EMI-to-Income Ratio", formatPercent(result.financial_breakdown.emi_to_income_ratio), false],
            ["EMI-to-Disposable Ratio", formatPercent(result.financial_breakdown.emi_to_disposable_ratio), false],
          ].map(([label, value, highlight]) => (
            <div key={label as string} className="flex items-center justify-between py-2 border-b border-[#1F2937]/50 last:border-0">
              <span className="text-sm text-[#94A3B8]">{label as string}</span>
              <span className={`text-sm font-semibold ${highlight ? "text-[#F59E0B]" : "text-white"}`}>{value as string}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Reasons */}
      {result.detailed_reasons.length > 0 && (
        <Card className="p-6">
          <h4 className="text-sm font-semibold text-[#94A3B8] uppercase tracking-wider mb-4">Analysis Details</h4>
          <ul className="space-y-3">
            {result.detailed_reasons.map((reason, i) => (
              <li key={i} className="flex items-start gap-3">
                <ArrowRight className="w-4 h-4 text-[#10B981] mt-0.5 shrink-0" />
                <span className="text-sm text-[#94A3B8]">{reason}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Tips */}
      {result.tips.length > 0 && (
        <Card className="p-6 border-[#F59E0B]/10">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-4 h-4 text-[#F59E0B]" />
            <h4 className="text-sm font-semibold text-[#F59E0B] uppercase tracking-wider">Smart Tips</h4>
          </div>
          <ul className="space-y-2.5">
            {result.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-[#F59E0B]/10 text-[#F59E0B] flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                <span className="text-sm text-[#94A3B8]">{tip}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </motion.div>
  );
}
