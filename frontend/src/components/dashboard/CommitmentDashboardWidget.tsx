"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { useCommitmentsSummary, useCommitments } from "@/hooks/useCommitments";
import {
  TrendingUp,
  Clock,
  AlertTriangle,
  ArrowRight,
  Banknote,
  Activity,
  Target,
} from "lucide-react";
import Link from "next/link";

/**
 * Compact commitment widgets for the main dashboard.
 * Shows: burden ratio, upcoming payments, and overdue alerts.
 */
export function CommitmentDashboardWidget() {
  const { summary, loading: summaryLoading } = useCommitmentsSummary();
  const { commitments, loading: listLoading } = useCommitments({
    status: ["active", "due_soon", "overdue"],
  });

  const loading = summaryLoading || listLoading;

  // Upcoming: due within 7 days
  const now = new Date();
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const upcoming = commitments.filter((c) => {
    if (!c.next_due_date) return false;
    const due = new Date(c.next_due_date);
    return due >= now && due <= weekFromNow;
  });

  const overdue = commitments.filter((c) => c.status === "overdue");

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-36 rounded-2xl bg-gradient-to-br from-[#111827] to-[#0B1020] border border-[#1F2937] animate-pulse" />
        <div className="h-24 rounded-2xl bg-gradient-to-br from-[#111827] to-[#0B1020] border border-[#1F2937] animate-pulse" />
      </div>
    );
  }

  if (!summary || summary.activeCount === 0) {
    return (
      <Card variant="elevated" className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg border border-[#1F2937] bg-[#0B1020] flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-[#10B981]" />
            </div>
            <h3 className="text-sm font-semibold text-white">Commitments</h3>
          </div>
          <Link
            href="/commitments"
            className="text-xs font-medium text-[#10B981] hover:text-[#059669] flex items-center gap-1 transition-colors"
          >
            View All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="flex flex-col items-center py-4">
          <div className="w-10 h-10 rounded-xl border border-[#1F2937] bg-[#0B1020] flex items-center justify-center mb-3">
            <TrendingUp className="w-5 h-5 text-[#374151]" />
          </div>
          <p className="text-sm text-[#64748B] text-center">
            No active commitments. Add your first EMI, loan, or subscription.
          </p>
        </div>
      </Card>
    );
  }

  const summaryItems = [
    {
      label: "Monthly Burden",
      value: `₹${summary.totalMonthlyBurden.toLocaleString("en-IN")}`,
      icon: Banknote,
      accent: "#10B981",
    },
    {
      label: "Active",
      value: String(summary.activeCount),
      icon: Activity,
      accent: "#3B82F6",
    },
    {
      label: "Avg Progress",
      value: `${summary.avgProgress}%`,
      icon: Target,
      accent: "#8B5CF6",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Burden Overview Card */}
      <Card variant="elevated" className="p-6 relative overflow-hidden">
        {/* Gradient overlay */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#10B981]/5 to-transparent rounded-bl-full pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg border border-[#10B981]/20 bg-[#10B981]/[0.06] flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-[#10B981]" />
              </div>
              <h3 className="text-sm font-semibold text-white">Commitments</h3>
            </div>
            <Link
              href="/commitments"
              className="text-xs font-medium text-[#10B981] hover:text-[#059669] flex items-center gap-1 transition-colors"
            >
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {summaryItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="text-center">
                  <div
                    className="w-9 h-9 rounded-xl border bg-[#0B1020] flex items-center justify-center mx-auto mb-2"
                    style={{ borderColor: `${item.accent}20` }}
                  >
                    <Icon className="w-4 h-4" style={{ color: item.accent }} />
                  </div>
                  <p className="text-lg font-bold text-white">{item.value}</p>
                  <p className="text-[10px] text-[#64748B] uppercase tracking-wider mt-0.5 font-medium">{item.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Upcoming Payments */}
      {upcoming.length > 0 && (
        <Card variant="elevated" className="p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-7 h-7 rounded-lg border border-[#F59E0B]/20 bg-[#F59E0B]/[0.06] flex items-center justify-center">
              <Clock className="w-3.5 h-3.5 text-[#F59E0B]" />
            </div>
            <h4 className="text-sm font-semibold text-white">
              Upcoming Payments
            </h4>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F59E0B]/10 text-[#F59E0B]">
              {upcoming.length}
            </span>
          </div>
          <div className="space-y-2">
            {upcoming.slice(0, 3).map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between p-3 rounded-xl bg-[#0B1020] border border-[#1F2937] hover:border-[#374151] transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-white">{c.title}</p>
                  <p className="text-[11px] text-[#64748B]">
                    Due{" "}
                    {new Date(c.next_due_date!).toLocaleDateString("en-IN", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <p className="text-sm font-bold text-white">
                  ₹{c.monthly_amount.toLocaleString("en-IN")}
                </p>
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {/* Overdue Alert */}
      {overdue.length > 0 && (
        <Card className="p-4 border-red-500/20 bg-red-500/[0.04]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg border border-red-500/20 bg-red-500/[0.06] flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-red-400">
                {overdue.length} overdue payment{overdue.length > 1 ? "s" : ""}
              </p>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                {overdue.map((c) => c.title).join(", ")}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
