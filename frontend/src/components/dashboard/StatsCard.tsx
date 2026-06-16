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
  accentColor?: "emerald" | "violet" | "amber" | "blue";
  delay?: number;
}

const accentConfig = {
  emerald: {
    iconBorder: "border-[#10B981]/20",
    iconBg: "bg-[#10B981]/[0.06]",
    iconColor: "text-[#10B981]",
    glowClass: "glow-green-subtle",
    gradient: "from-[#10B981]/5 to-transparent",
  },
  violet: {
    iconBorder: "border-[#8B5CF6]/20",
    iconBg: "bg-[#8B5CF6]/[0.06]",
    iconColor: "text-[#8B5CF6]",
    glowClass: "glow-violet",
    gradient: "from-[#8B5CF6]/5 to-transparent",
  },
  amber: {
    iconBorder: "border-[#F59E0B]/20",
    iconBg: "bg-[#F59E0B]/[0.06]",
    iconColor: "text-[#F59E0B]",
    glowClass: "glow-amber",
    gradient: "from-[#F59E0B]/5 to-transparent",
  },
  blue: {
    iconBorder: "border-[#3B82F6]/20",
    iconBg: "bg-[#3B82F6]/[0.06]",
    iconColor: "text-[#3B82F6]",
    glowClass: "glow-blue",
    gradient: "from-[#3B82F6]/5 to-transparent",
  },
};

export function StatsCard({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  icon,
  accentColor = "emerald",
  delay = 0,
}: StatsCardProps) {
  const config = accentConfig[accentColor];

  const trendColors = {
    up: "text-[#10B981] bg-[#10B981]/10",
    down: "text-[#EF4444] bg-[#EF4444]/10",
    neutral: "text-[#94A3B8] bg-[#94A3B8]/10",
  };

  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card hover variant="elevated" className="relative p-5 overflow-hidden group">
        {/* Subtle gradient overlay matching accent */}
        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${config.gradient} rounded-bl-full opacity-60 pointer-events-none`} />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            {/* Landing-page style icon container: bordered + bg-elevated */}
            <div className={`w-11 h-11 rounded-xl border ${config.iconBorder} ${config.iconBg} flex items-center justify-center transition-colors duration-300 group-hover:border-[#10B981]/30`}>
              <div className={config.iconColor}>
                {icon}
              </div>
            </div>
            {trend && trendValue && (
              <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold ${trendColors[trend]}`}>
                <TrendIcon className="w-3 h-3" />
                {trendValue}
              </div>
            )}
          </div>
          <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
          <p className="text-xs text-[#64748B] mt-1 font-medium uppercase tracking-wider">{title}</p>
          {subtitle && <p className="text-xs text-[#94A3B8] mt-1.5">{subtitle}</p>}
        </div>
      </Card>
    </motion.div>
  );
}
