// src/components/timeline/TimelineCard.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Pencil, Trash2 } from "lucide-react";

// NOTE: This component is part of the deprecated financial_timeline system.
// It will be removed after full migration to the commitments module.

interface FinancialTimeline {
  id: string;
  title: string;
  category: string;
  provider?: string | null;
  monthly_amount: number;
  status: string;
  start_date: string;
  end_date?: string | null;
}

interface ProgressResult {
  monthsElapsed: number;
  monthsRemaining: number;
  completionPercent: number;
  nextDueDate: string | null;
}

function calcCommitmentProgress(item: FinancialTimeline): ProgressResult {
  const start = new Date(item.start_date);
  const now = new Date();
  const monthsElapsed = Math.max(
    0,
    (now.getFullYear() - start.getFullYear()) * 12 +
      (now.getMonth() - start.getMonth())
  );
  const end = item.end_date ? new Date(item.end_date) : null;
  const totalMonths = end
    ? Math.max(
        1,
        (end.getFullYear() - start.getFullYear()) * 12 +
          (end.getMonth() - start.getMonth())
      )
    : monthsElapsed + 12;
  const monthsRemaining = Math.max(0, totalMonths - monthsElapsed);
  const completionPercent = Math.min(
    100,
    Math.round((monthsElapsed / totalMonths) * 100)
  );
  const nextDue = new Date(start);
  nextDue.setMonth(start.getMonth() + monthsElapsed + 1);
  return {
    monthsElapsed,
    monthsRemaining,
    completionPercent,
    nextDueDate: nextDue.toISOString().split("T")[0],
  };
}

interface TimelineCardProps {
  item: FinancialTimeline;
  onEdit?: (item: FinancialTimeline) => void;
  onDelete?: (id: string) => void;
}

const statusColorMap: Record<string, string> = {
  active: "bg-[#10B981]/10 text-[#10B981]",
  completed: "bg-[#22C55E]/10 text-[#22C55E]",
  overdue: "bg-[#EF4444]/10 text-[#EF4444]",
  paused: "bg-[#9CA3AF]/10 text-[#9CA3AF]",
  upcoming: "bg-[#3B82F6]/10 text-[#3B82F6]",
};

export function TimelineCard({ item, onEdit, onDelete }: TimelineCardProps) {
  const progress = calcCommitmentProgress(item);
  const progressPct = progress.completionPercent;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="p-4"
    >
      <Card className="bg-[#111827] border border-[#1F2937] p-4 hover:border-[#10B981] transition-colors relative">
        <div className="flex justify-between items-start mb-2">
          <h3
            className="text-white font-medium text-lg truncate"
            title={item.title}
          >
            {item.title}
          </h3>
          <Badge
            className={statusColorMap[item.status] ?? statusColorMap["active"]}
          >
            {item.status}
          </Badge>
        </div>
        <p className="text-[#94A3B8] text-sm mb-2">
          {item.category.toUpperCase()} • {item.provider ?? "—"}
        </p>
        <div className="text-white font-semibold text-xl mb-2">
          ₹{item.monthly_amount.toLocaleString()}/mo
        </div>
        <div className="relative w-full h-2 bg-[#1F2937] rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-[#10B981]"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-[#64748B]">
          <span>{progress.monthsElapsed}m elapsed</span>
          <span>{progress.monthsRemaining}m left</span>
        </div>
        {progress.nextDueDate && (
          <p className="mt-2 text-xs text-[#94A3B8]">
            Next due:{" "}
            {new Date(progress.nextDueDate).toLocaleDateString()}
          </p>
        )}
        {/* Action buttons */}
        {(onEdit || onDelete) && (
          <div className="absolute top-2 right-2 flex space-x-1">
            {onEdit && (
              <button
                onClick={() => onEdit(item)}
                title="Edit"
                className="p-1.5 rounded-lg bg-[#1F2937] text-[#94A3B8] hover:text-white hover:bg-[#374151] transition-colors"
              >
                <Pencil className="w-3 h-3" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(item.id)}
                title="Delete"
                className="p-1.5 rounded-lg bg-[#1F2937] text-[#94A3B8] hover:text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </Card>
    </motion.div>
  );
}
