"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Banknote,
} from "lucide-react";
import type { CommitmentsSummaryData } from "@/hooks/useCommitments";

interface CommitmentsSummaryCardsProps {
  summary: CommitmentsSummaryData | null;
  loading: boolean;
}

export function CommitmentsSummaryCards({
  summary,
  loading,
}: CommitmentsSummaryCardsProps) {
  if (loading || !summary) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-28 rounded-2xl bg-[#111827] border border-[#1F2937] animate-pulse"
          />
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: "Monthly Burden",
      value: `₹${summary.totalMonthlyBurden.toLocaleString("en-IN")}`,
      sub: `${summary.activeCount} active commitments`,
      icon: Banknote,
      color: "#3B82F6",
      bgColor: "#3B82F6",
    },
    {
      label: "Total Outstanding",
      value: `₹${summary.totalOutstanding.toLocaleString("en-IN")}`,
      sub: `${summary.avgProgress}% avg progress`,
      icon: TrendingDown,
      color: "#F59E0B",
      bgColor: "#F59E0B",
    },
    {
      label: "Upcoming",
      value: String(summary.upcomingCount),
      sub: "commitments starting soon",
      icon: Clock,
      color: "#8B5CF6",
      bgColor: "#8B5CF6",
    },
    {
      label: "Completed",
      value: String(summary.completedCount),
      sub: summary.overdueCount > 0
        ? `${summary.overdueCount} overdue`
        : "all on track",
      icon: summary.overdueCount > 0 ? AlertTriangle : CheckCircle2,
      color: summary.overdueCount > 0 ? "#EF4444" : "#10B981",
      bgColor: summary.overdueCount > 0 ? "#EF4444" : "#10B981",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card hover className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div
                  className="p-2.5 rounded-xl"
                  style={{ backgroundColor: `${card.bgColor}15` }}
                >
                  <Icon
                    className="w-5 h-5"
                    style={{ color: card.color }}
                  />
                </div>
              </div>
              <p className="text-2xl font-bold text-white mb-0.5">
                {card.value}
              </p>
              <p className="text-xs text-[#64748B]">{card.label}</p>
              <p className="text-xs text-[#475569] mt-1">{card.sub}</p>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
