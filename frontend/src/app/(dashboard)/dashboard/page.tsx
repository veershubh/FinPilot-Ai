"use client";

import React from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { HealthScoreGauge } from "@/components/dashboard/HealthScoreGauge";
import { CommitmentDashboardWidget } from "@/components/dashboard/CommitmentDashboardWidget";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { AIInsightsCard } from "@/components/dashboard/AIInsightsCard";
import { Card } from "@/components/ui/Card";
import { Wallet, TrendingUp, ShieldCheck, PiggyBank } from "lucide-react";

export default function DashboardPage() {
  return (
    <PageWrapper title="Dashboard" subtitle="Your financial overview at a glance">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatsCard
          title="Monthly Income"
          value="&#8377;50,000"
          trend="up"
          trendValue="+8%"
          icon={<Wallet className="w-5 h-5" />}
        />
        <StatsCard
          title="Monthly Savings"
          value="&#8377;15,000"
          trend="up"
          trendValue="+12%"
          icon={<PiggyBank className="w-5 h-5" />}
          accentColor="violet"
        />
        <StatsCard
          title="Emergency Fund"
          value="&#8377;1,20,000"
          trend="neutral"
          trendValue="Stable"
          icon={<ShieldCheck className="w-5 h-5" />}
          accentColor="amber"
        />
        <StatsCard
          title="Active EMIs"
          value="0"
          subtitle="No active installments"
          icon={<TrendingUp className="w-5 h-5" />}
          accentColor="blue"
        />
      </div>

      {/* Health Score + Commitments + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="flex flex-col items-center justify-center py-8">
          <HealthScoreGauge score={75} size={180} />
          <p className="text-xs text-[#64748B] mt-4 text-center max-w-[200px]">
            Your financial health is strong. Keep building your emergency fund.
          </p>
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
