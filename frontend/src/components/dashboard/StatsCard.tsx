/**
 * FinPilot AI - Stats Card Component
 */

"use client";

import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card } from "@/components/ui/Card";

interface StatsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  icon: React.ReactNode;
  accentColor?: string;
}

export function StatsCard({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  icon,
  accentColor = "emerald",
}: StatsCardProps) {
  const trendColors = {
    up: "text-emerald-400 bg-emerald-500/10",
    down: "text-red-400 bg-red-500/10",
    neutral: "text-gray-400 bg-gray-500/10",
  };

  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card hover className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className={`p-2.5 rounded-xl bg-${accentColor}-500/10 text-${accentColor}-400`}>
            {icon}
          </div>
          {trend && trendValue && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${trendColors[trend]}`}>
              <TrendIcon className="w-3 h-3" />
              {trendValue}
            </div>
          )}
        </div>
        <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
        <p className="text-sm text-gray-400 mt-0.5">{title}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </Card>
    </motion.div>
  );
}
