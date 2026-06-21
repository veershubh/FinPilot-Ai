"use client";

import React from "react";
import { motion } from "framer-motion";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { HealthScoreGauge } from "@/components/dashboard/HealthScoreGauge";
import { CommitmentDashboardWidget } from "@/components/dashboard/CommitmentDashboardWidget";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { AIInsightsCard } from "@/components/dashboard/AIInsightsCard";
import { Card } from "@/components/ui/Card";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import {
  Wallet, TrendingUp, ShieldCheck, PiggyBank,
  Loader2, Sparkles, ArrowRight, Clock,
} from "lucide-react";
import Link from "next/link";

function formatINR(n: number): string {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  return `₹${n.toLocaleString("en-IN")}`;
}

// ── Section Header (landing-page style) ──────────────────────────────────
function SectionHeader({
  title,
  icon: Icon,
  accent = "#10B981",
  action,
}: {
  title: string;
  icon: any;
  accent?: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-2.5">
        <div
          className="w-7 h-7 rounded-lg border bg-[#0B1020] flex items-center justify-center"
          style={{ borderColor: `${accent}20` }}
        >
          <Icon className="w-3.5 h-3.5" style={{ color: accent }} />
        </div>
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      {action && (
        <Link
          href={action.href}
          className="text-xs font-medium text-[#10B981] hover:text-[#059669] flex items-center gap-1 transition-colors"
        >
          {action.label} <ArrowRight className="w-3 h-3" />
        </Link>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { stats, loading, error } = useDashboardStats();

  return (
    <PageWrapper title="Dashboard" subtitle="Your financial overview at a glance" badge="Live">
      {/* ═══ Stats Grid ═══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatsCard
          title="Net Worth"
          value={loading ? "—" : formatINR(stats?.netWorth ?? 0)}
          trend={(stats?.netWorth ?? 0) >= 0 ? "up" : "down"}
          trendValue={
            stats ? `${formatINR(stats.totalAssets)} assets` : "Live data"
          }
          icon={<Wallet className="w-5 h-5" />}
          delay={0}
        />
        <StatsCard
          title="Total Liabilities"
          value={loading ? "—" : formatINR(stats?.totalLiabilities ?? 0)}
          trend={(stats?.totalLiabilities ?? 0) > 0 ? "down" : "neutral"}
          trendValue={
            stats?.totalLiabilities ? `${stats.activeEMICount} active` : "Debt free"
          }
          icon={<PiggyBank className="w-5 h-5" />}
          accentColor="violet"
          delay={0.05}
        />
        <StatsCard
          title="Monthly Commitments"
          value={loading ? "—" : formatINR(stats?.monthlyCommitments ?? 0)}
          trend={
            stats && stats.monthlyCommitments > 0
              ? "down"
              : "neutral"
          }
          trendValue={
            stats?.monthlySavings ? `${formatINR(stats.monthlySavings)} free` : "No burden"
          }
          icon={<ShieldCheck className="w-5 h-5" />}
          accentColor="amber"
          delay={0.1}
        />
        <StatsCard
          title="Goal Progress"
          value={loading ? "—" : `${stats?.goalProgress ?? 0}%`}
          subtitle={
            stats?.goalProgress
              ? "Average across goals"
              : "Create your first goal"
          }
          icon={<TrendingUp className="w-5 h-5" />}
          accentColor="blue"
          delay={0.15}
        />
      </div>

      {/* ═══ Health Score + Commitments Row ════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Health Score — glass elevated card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card variant="elevated" className="flex flex-col items-center justify-center py-8 px-6 relative overflow-hidden h-full">
            {/* Background radial glow */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#10B981]/[0.04] rounded-full blur-[60px]" />
            </div>

            <div className="relative z-10">
              {loading ? (
                <div className="flex flex-col items-center gap-3 py-8">
                  <Loader2 className="w-8 h-8 text-[#10B981] animate-spin" />
                  <span className="text-xs text-[#64748B]">Calculating...</span>
                </div>
              ) : (
                <HealthScoreGauge score={stats?.healthScore ?? 75} size={180} />
              )}
            </div>
          </Card>
        </motion.div>

        {/* Commitments + Quick Actions */}
        <motion.div
          className="lg:col-span-2 space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          <CommitmentDashboardWidget />

          <div>
            <SectionHeader title="Quick Actions" icon={Sparkles} accent="#8B5CF6" />
            <QuickActions />
          </div>
        </motion.div>
      </div>

      {/* ═══ AI Insights ══════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mb-8"
      >
        <SectionHeader
          title="AI Insights"
          icon={Sparkles}
          accent="#8B5CF6"
          action={{ label: "Ask AI", href: "/ai-assistant" }}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AIInsightsCard type="spending" payload={{}} title="Spending Analysis" delay={0.35} />
          <AIInsightsCard type="savings" payload={{}} title="Savings Prediction" delay={0.4} />
          <AIInsightsCard type="emi" payload={{}} title="EMI Intelligence" delay={0.45} />
          <AIInsightsCard type="recommendations" payload={{}} title="Smart Recommendations" delay={0.5} />
        </div>
      </motion.div>

      {/* ═══ Recent Activity ══════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.55 }}
      >
        <Card variant="elevated" className="p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-[#10B981]/[0.03] to-transparent rounded-bl-full pointer-events-none" />

          <div className="relative z-10">
            <SectionHeader title="Recent Activity" icon={Clock} />

            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-14 h-14 rounded-2xl border border-[#1F2937] bg-[#0B1020] flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-[#374151]" />
              </div>
              <p className="text-sm text-[#94A3B8] font-medium">No recent analyses yet</p>
              <p className="text-xs text-[#64748B] mt-1 max-w-xs">
                Use the EMI Analyzer to get started — your activity will appear here.
              </p>
              <Link
                href="/emi-analyzer"
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-[#10B981] hover:text-[#059669] transition-colors"
              >
                Open EMI Analyzer <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </Card>
      </motion.div>
    </PageWrapper>
  );
}
