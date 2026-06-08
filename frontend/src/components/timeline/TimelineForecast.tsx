// src/components/timeline/TimelineForecast.tsx
"use client";

import React from "react";
import useSWR from "swr";
import { ForecastChart } from "./ForecastChart";
import type { FinancialTimeline } from "@/types/database";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function TimelineForecast() {
  const { data, error } = useSWR<FinancialTimeline[]>("/api/timeline", fetcher);

  if (error) return <p className="text-red-500">Failed to load forecast.</p>;
  if (!data) return <p className="text-[#64748B]">Loading forecast…</p>;

  return (
    <div className="mt-8">
      <h2 className="text-white text-xl font-semibold mb-4">Financial Forecast</h2>
      <ForecastChart commitments={data} />
    </div>
  );
}
