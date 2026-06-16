"use client";

import React from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { HealthScoreGauge } from "@/components/dashboard/HealthScoreGauge";
import { CommitmentDashboardWidget } from "@/components/dashboard/CommitmentDashboardWidget";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { AIInsightsCard } from "@/components/dashboard/AIInsightsCard";
import { Card } from "@/components/ui/Card";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { Wallet, TrendingUp, ShieldCheck, PiggyBank, Loader2 } from "lucide-react";

function formatINR(n: number): string {
  return `₹${n.toLocaleString("en-IN")}`;
}

export default function DashboardPage() {
  const { stats, loading, error } = useDashboardStats();

  return (
    <PageWrapper title="Dashboard" subtitle="Your financial overview at a glance">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatsCard
          title="Monthly Income"
          value={loading ? "—" : formatINR(stats?.monthlyIncome ?? 0)}
          trend={stats?.trends.income ?? "neutral"}
          trendValue={
            stats?.monthlyIncome
              ? stats.trends.income === "up"
                ? "+8%"
                : "Stable"
              : "Set in profile"
          }
          icon={<Wallet className="w-5 h-5" />}
        />
        <StatsCard
          title="Monthly Savings"
          value={loading ? "—" : formatINR(stats?.monthlySavings ?? 0)}
          trend={stats?.trends.savings ?? "neutral"}
          trendValue={
            stats?.trends.savings === "up"
              ? "Healthy"
              : stats?.trends.savings === "down"
              ? "Low"
              : "Stable"
          }
          icon={<PiggyBank className="w-5 h-5" />}
          accentColor="violet"
        />
        <StatsCard
          title="Monthly Burden"
          value={loading ? "—" : formatINR(stats?.totalMonthlyBurden ?? 0)}
          trend={
            stats && stats.totalMonthlyBurden > 0
              ? "down"
              : "neutral"
          }
          trendValue={
            stats?.totalMonthlyBurden
              ? `${stats.activeEMICount} active`
              : "No EMIs"
          }
          icon={<ShieldCheck className="w-5 h-5" />}
          accentColor="amber"
        />
        <StatsCard
          title="Active EMIs"
          value={loading ? "—" : String(stats?.activeEMICount ?? 0)}
          subtitle={
            stats?.activeEMICount
              ? `${formatINR(stats.totalMonthlyBurden)}/mo total`
              : "No active installments"
          }
          icon={<TrendingUp className="w-5 h-5" />}
          accentColor="blue"
        />
      </div>

      {/* Health Score + Commitments + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="flex flex-col items-center justify-center py-8">
          {loading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-[#10B981] animate-spin" />
              <span className="text-xs text-[#64748B]">Calculating...</span>
            </div>
          ) : (
            <>
              <HealthScoreGauge score={stats?.healthScore ?? 75} size={180} />
              <p className="text-xs text-[#64748B] mt-4 text-center max-w-[200px]">
                {stats?.healthAdvice ??
                  "Your financial health is strong. Keep building your emergency fund."}
              </p>
            </>
          )}
        </Card>

        <div className="lg:col-span-2 space-y-6">
          {/* Commitment Widget */}
          <CommitmentDashboardWidget />

          <h3 className="text-sm font-semibold text-[#94A3B8] uppercase tracking-wider">
            Quick Actions
          </h3>
          <QuickActions />
        </div>
      </div>

      {/* AI Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <AIInsightsCard type="spending" payload={{}} title="Spending Analysis" />
        <AIInsightsCard type="savings" payload={{}} title="Savings Prediction" />
        <AIInsightsCard type="emi" payload={{}} title="EMI Intelligence" />
        <AIInsightsCard type="recommendations" payload={{}} title="Smart Recommendations" />
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <h3 className="text-sm font-semibold text-[#94A3B8] uppercase tracking-wider mb-4">
          Recent Activity
        </h3>
        <div className="flex flex-col items-center justify-center py-12 text-[#64748B]">
          <TrendingUp className="w-10 h-10 mb-3 opacity-30" />
          <p className="text-sm">No recent analyses yet</p>
          <p className="text-xs text-[#64748B] mt-1">Use the EMI Analyzer to get started</p>
        </div>
      </Card>
    </PageWrapper>
  );
}
