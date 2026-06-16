"use client";

import React from "react";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";

interface HealthScoreGaugeProps {
  score: number;
  label?: string;
  size?: number;
}

export function HealthScoreGauge({ score, label = "Financial Health", size = 180 }: HealthScoreGaugeProps) {
  const getColor = (s: number) => {
    if (s >= 70) return "#10B981";
    if (s >= 40) return "#F59E0B";
    return "#EF4444";
  };

  const getGradient = (s: number) => {
    if (s >= 70) return ["#10B981", "#059669"];
    if (s >= 40) return ["#F59E0B", "#D97706"];
    return ["#EF4444", "#DC2626"];
  };

  const color = getColor(score);
  const [gradStart, gradEnd] = getGradient(score);
  const radius = (size - 24) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const center = size / 2;

  const getStatus = (s: number) => {
    if (s >= 80) return "Excellent";
    if (s >= 70) return "Very Good";
    if (s >= 40) return "Fair";
    return "At Risk";
  };

  const getAdvice = (s: number) => {
    if (s >= 80) return "Outstanding financial discipline";
    if (s >= 70) return "Your finances are in great shape";
    if (s >= 40) return "Room for improvement—check spending";
    return "Immediate attention needed";
  };

  return (
    <div className="flex flex-col items-center">
      {/* Title pill */}
      <div className="flex items-center gap-2 mb-5">
        <div className="w-7 h-7 rounded-lg border border-[#1F2937] bg-[#0B1020] flex items-center justify-center">
          <Shield className="w-3.5 h-3.5 text-[#10B981]" />
        </div>
        <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">{label}</span>
      </div>

      {/* Gauge */}
      <div className="relative" style={{ width: size, height: size }}>
        {/* Background glow */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${color}12 0%, transparent 70%)`,
          }}
        />

        <svg width={size} height={size} className="-rotate-90">
          {/* Track ring */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#1F2937"
            strokeWidth="8"
          />
          {/* Subtle secondary track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#0B1020"
            strokeWidth="8"
            strokeDasharray={`${circumference * 0.01} ${circumference * 0.04}`}
            opacity="0.5"
          />
          {/* Progress arc with gradient via linearGradient */}
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={gradStart} />
              <stop offset="100%" stopColor={gradEnd} />
            </linearGradient>
          </defs>
          <motion.circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="url(#scoreGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - progress }}
            transition={{ duration: 1.4, ease: "easeOut" }}
            className="animate-score-pulse"
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-4xl font-bold text-white tracking-tight"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
          >
            {score}
          </motion.span>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-[11px] font-semibold mt-0.5"
            style={{ color }}
          >
            {getStatus(score)}
          </motion.span>
        </div>
      </div>

      {/* Advice text */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="text-xs text-[#64748B] mt-4 text-center max-w-[220px] leading-relaxed"
      >
        {getAdvice(score)}
      </motion.p>
    </div>
  );
}
