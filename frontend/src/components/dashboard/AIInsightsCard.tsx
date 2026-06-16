"use client";

import { useInsights } from "@/hooks/useInsights";
import { Card } from "@/components/ui/Card";
import { Loader2, AlertCircle, Sparkles, RefreshCw } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

/**
 * AI Insights Card – displays a streaming insight with proper fallback states.
 * Props:
 *   type: InsightType (e.g., 'spending')
 *   payload: data to feed the model
 *   title: Card title displayed above the streaming content
 */
export function AIInsightsCard({
  type,
  payload,
  title,
}: {
  type: string;
  payload: any;
  title: string;
}) {
  const { data, loading, error, startInsight } = useInsights();
  const hasStarted = useRef(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!hasStarted.current || retryCount > 0) {
      hasStarted.current = true;
      startInsight(type, payload);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, retryCount]);

  const handleRetry = () => {
    setRetryCount((c) => c + 1);
  };

  return (
    <Card className="p-6 bg-[#111827] border-[#1F2937]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
          <h3 className="text-sm font-semibold text-[#94A3B8] uppercase tracking-wider">
            {title}
          </h3>
        </div>
        {!loading && (data || error) && (
          <button
            onClick={handleRetry}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-white hover:bg-white/5 transition-colors"
            title="Refresh insight"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center space-x-2 text-[#64748B] py-4">
          <Loader2 className="w-5 h-5 animate-spin text-[#8B5CF6]" />
          <span className="text-sm">Generating insight…</span>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="flex flex-col items-center py-4 text-center">
          <AlertCircle className="w-6 h-6 text-[#F59E0B] mb-2" />
          <p className="text-sm text-[#94A3B8] mb-1">Insight unavailable</p>
          <p className="text-xs text-[#64748B] mb-3">
            {error.includes("401")
              ? "Please sign in to see AI insights."
              : "AI service is currently offline. Try again later."}
          </p>
          <button
            onClick={handleRetry}
            className="text-xs text-[#10B981] hover:underline flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" /> Retry
          </button>
        </div>
      )}

      {/* Empty Data State */}
      {!loading && !error && !data && (
        <div className="flex flex-col items-center py-4 text-center">
          <Sparkles className="w-6 h-6 text-[#374151] mb-2" />
          <p className="text-sm text-[#64748B]">No insight available</p>
          <p className="text-xs text-[#475569] mt-1">
            Add financial data to get personalized AI analysis.
          </p>
        </div>
      )}

      {/* Success State */}
      {!loading && !error && data && (
        <p className="whitespace-pre-wrap text-sm text-[#E5E7EB] leading-relaxed">
          {data}
        </p>
      )}
    </Card>
  );
}
