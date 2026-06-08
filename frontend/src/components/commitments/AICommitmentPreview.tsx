"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface SimulationResult {
  currentScore: number;
  projectedScore: number;
  scoreDelta: number;
  burdenRatio: string;
  monthlyFreeCash: number;
  riskLevel: "Low" | "Medium" | "High";
  recommendation: string;
}

interface AICommitmentPreviewProps {
  simulation: SimulationResult | null;
  commitment: {
    title: string;
    category: string;
    monthly_amount: number;
  };
  onAdd: () => void;
  onCancel: () => void;
}

const riskLevelColors: Record<"Low" | "Medium" | "High", string> = {
  Low: "bg-green-500/20 text-green-400 border-green-500/30",
  Medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  High: "bg-red-500/20 text-red-400 border-red-500/30",
};

export function AICommitmentPreview({
  simulation,
  commitment,
  onAdd,
  onCancel,
}: AICommitmentPreviewProps) {
  if (!simulation) {
    return (
      <Card className="p-6">
        <p className="text-[#A1A1AA] text-center py-8">
          No simulation data available. Please go back and fill in the details.
        </p>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">
            📄 AI Financial Analysis
          </h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">
                Your Commitment
              </h3>
              <p className="text-sm text-[#A1A1AA]">{commitment.title}</p>
              <p className="text-sm text-[#A1A1AA]">
                {commitment.category
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Health Score Impact */}
          <div className="border-t border-[#1F2937] pt-5">
            <h3 className="text-lg font-semibold text-white mb-3">
              Health Score Impact
            </h3>
            <div className="flex items-center justify-between text-2xl font-bold">
              <span className="text-white">{simulation.currentScore}</span>
              <Arrow
                direction={simulation.scoreDelta >= 0 ? "up" : "down"}
                color={
                  simulation.scoreDelta >= 0
                    ? "currentColor"
                    : "currentColor"
                }
                className={
                  simulation.scoreDelta >= 0
                    ? "text-green-400"
                    : "text-red-400"
                }
                size={24}
              />
              <span className="text-white">{simulation.projectedScore}</span>
            </div>
            <p
              className={`mt-1 text-sm font-medium ${
                simulation.scoreDelta >= 0
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {simulation.scoreDelta >= 0 ? "+" : ""}
              {simulation.scoreDelta}
            </p>
          </div>

          {/* Financial Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <p className="text-xs text-[#A1A1AA] uppercase tracking-wide">
                Monthly Burden Ratio
              </p>
              <p className="text-lg font-bold text-white">
                {simulation.burdenRatio}
              </p>
            </div>
            <div className="space-y-3">
              <p className="text-xs text-[#A1A1AA] uppercase tracking-wide">
                Monthly Free Cash
              </p>
              <p className="text-lg font-bold text-white">
                ₹{simulation.monthlyFreeCash.toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          {/* Risk Level */}
          <div className="border-t border-[#1F2937] pt-5">
            <h3 className="text-lg font-semibold text-white mb-3">
              Risk Assessment
            </h3>
            <Badge
              className={`${riskLevelColors[simulation.riskLevel]} px-3 py-1 rounded-full text-sm font-medium`}
            >
              {simulation.riskLevel}
            </Badge>
          </div>

          {/* Recommendation */}
          <div className="border-t border-[#1F2937] pt-5">
            <h3 className="text-lg font-semibold text-white mb-3">
              AI Recommendation
            </h3>
            <p className="text-[#A1A1AA] leading-relaxed">
              {simulation.recommendation}
            </p>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onAdd}>Add This Commitment</Button>
        </div>
      </Card>
    </motion.div>
  );
}

function Arrow({
  direction,
  color = "currentColor",
  className = "",
  size = 24,
}: {
  direction: "up" | "down";
  color?: string;
  className?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-transform duration-200 ${className}`}
    >
      {direction === "up" ? (
        <>
          <path d="M5 12l7-7 7 7" />
          <path d="M12 5v14" />
        </>
      ) : (
        <>
          <path d="M19 12l-7 7-7-7" />
          <path d="M12 19v-14" />
        </>
      )}
    </svg>
  );
}