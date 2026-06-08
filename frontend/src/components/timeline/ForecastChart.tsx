// src/components/timeline/ForecastChart.tsx
"use client";

import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { calcForecast } from "@/utils/timeline-calculator";
import type { FinancialTimeline } from "@/types/database";

interface ForecastChartProps {
  commitments: FinancialTimeline[];
}

export function ForecastChart({ commitments }: ForecastChartProps) {
  const data = calcForecast(commitments);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
        <XAxis dataKey="label" stroke="#94A3B8" />
        <YAxis stroke="#94A3B8" />
        <Tooltip
          contentStyle={{ backgroundColor: "#111827", border: "1px solid #1F2937" }}
          labelStyle={{ color: "#fff" }}
        />
        <Line type="monotone" dataKey="totalMonthlyBurden" stroke="#10B981" strokeWidth={2} dot={{ fill: "#10B981" }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
