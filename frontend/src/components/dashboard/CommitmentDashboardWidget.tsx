"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useCommitmentsSummary, useCommitments } from "@/hooks/useCommitments";
import {
  Banknote,
  TrendingUp,
  Clock,
  AlertTriangle,
  ArrowRight,
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
        <div className="h-32 rounded-2xl bg-[#111827] border border-[#1F2937] animate-pulse" />
        <div className="h-24 rounded-2xl bg-[#111827] border border-[#1F2937] animate-pulse" />
      </div>
    );
  }

  if (!summary || summary.activeCount === 0) {
    return (
      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-[#94A3B8] uppercase tracking-wider">
            Commitments
          </h3>
          <Link
            href="/commitments"
            className="text-xs text-[#10B981] hover:underline flex items-center gap-1"
          >
            View All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <p className="text-sm text-[#64748B] py-4 text-center">
          No active commitments. Add your first EMI, loan, or subscription.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Burden Ratio Card */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-[#94A3B8] uppercase tracking-wider">
            Commitments
          </h3>
          <Link
            href="/commitments"
            className="text-xs text-[#10B981] hover:underline flex items-center gap-1"
          >
            View All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <p className="text-xs text-[#64748B]">Monthly Burden</p>
            <p className="text-lg font-bold text-white">
              ₹{summary.totalMonthlyBurden.toLocaleString("en-IN")}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#64748B]">Active</p>
            <p className="text-lg font-bold text-[#10B981]">
              {summary.activeCount}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#64748B]">Avg Progress</p>
            <p className="text-lg font-bold text-[#3B82F6]">
              {summary.avgProgress}%
            </p>
          </div>
        </div>
      </Card>

      {/* Upcoming Payments */}
      {upcoming.length > 0 && (
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-[#F59E0B]" />
            <h4 className="text-sm font-semibold text-white">
              Upcoming Payments ({upcoming.length})
            </h4>
          </div>
          <div className="space-y-2">
            {upcoming.slice(0, 3).map((c) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#0F172A] border border-[#1F2937]"
              >
                <div>
                  <p className="text-sm font-medium text-white">{c.title}</p>
                  <p className="text-xs text-[#64748B]">
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
        <Card className="p-4 border-red-500/20 bg-red-500/5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <p className="text-sm font-medium text-red-400">
              {overdue.length} overdue payment{overdue.length > 1 ? "s" : ""}
            </p>
          </div>
          <p className="text-xs text-[#94A3B8] mt-1">
            {overdue.map((c) => c.title).join(", ")}
          </p>
        </Card>
      )}
    </div>
  );
}
