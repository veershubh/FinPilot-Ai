"use client";

import React from "react";
import { motion } from "framer-motion";

interface HealthScoreGaugeProps {
  score: number;
  label?: string;
  size?: number;
}

export function HealthScoreGauge({ score, label = "Health Score", size = 160 }: HealthScoreGaugeProps) {
  const getColor = (s: number) => {
    if (s >= 70) return "#10B981";
    if (s >= 40) return "#F59E0B";
    return "#EF4444";
  };

  const color = getColor(score);
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const center = size / 2;

  const getStatus = (s: number) => {
    if (s >= 70) return "Excellent";
    if (s >= 40) return "Fair";
    return "At Risk";
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={center} cy={center} r={radius} fill="none" stroke="#1F2937" strokeWidth="10" />
          <motion.circle
            cx={center} cy={center} r={radius} fill="none"
            stroke={color} strokeWidth="10" strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - progress }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            style={{ filter: `drop-shadow(0 0 8px ${color}40)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-3xl font-bold text-white"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            {score}
          </motion.span>
          <span className="text-xs text-[#64748B] mt-0.5">{getStatus(score)}</span>
        </div>
      </div>
      <p className="text-sm text-[#94A3B8] mt-3 font-medium">{label}</p>
    </div>
  );
}
