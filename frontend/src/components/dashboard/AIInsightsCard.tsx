"use client";

import { useInsights } from "@/hooks/useInsights";
import { Card } from "@/components/ui/Card";
import { Loader2, AlertCircle, Sparkles, RefreshCw, TrendingUp, PiggyBank, Calculator, Zap } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const typeConfig: Record<string, { icon: any; accent: string; gradient: string }> = {
  spending: {
    icon: TrendingUp,
    accent: "#F59E0B",
    gradient: "from-[#F59E0B]/5 to-transparent",
  },
  savings: {
    icon: PiggyBank,
    accent: "#10B981",
    gradient: "from-[#10B981]/5 to-transparent",
  },
  emi: {
    icon: Calculator,
    accent: "#3B82F6",
    gradient: "from-[#3B82F6]/5 to-transparent",
  },
  recommendations: {
    icon: Zap,
    accent: "#8B5CF6",
    gradient: "from-[#8B5CF6]/5 to-transparent",
  },
};

/**
 * AI Insights Card – displays a streaming insight with premium glass-dark styling.
 */
export function AIInsightsCard({
  type,
  payload,
  title,
  delay = 0,
}: {
  type: string;
  payload: any;
  title: string;
  delay?: number;
}) {
  const { data, loading, error, startInsight } = useInsights();
  const hasStarted = useRef(false);
  const [retryCount, setRetryCount] = useState(0);

  const config = typeConfig[type] || typeConfig.recommendations;
  const Icon = config.icon;

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card variant="elevated" className="relative p-6 overflow-hidden group">
        {/* Gradient corner overlay */}
        <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl ${config.gradient} rounded-bl-full opacity-60 pointer-events-none`} />

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              {/* Landing-page icon container */}
              <div
                className="w-8 h-8 rounded-lg border border-[#1F2937] bg-[#0B1020] flex items-center justify-center"
                style={{ borderColor: `${config.accent}20` }}
              >
                <Icon className="w-4 h-4" style={{ color: config.accent }} />
              </div>
              <h3 className="text-sm font-semibold text-white">{title}</h3>
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
            <div className="flex items-center space-x-3 py-6">
              <div className="relative">
                <Loader2 className="w-5 h-5 animate-spin" style={{ color: config.accent }} />
              </div>
              <div>
                <span className="text-sm text-[#94A3B8]">Analyzing your data…</span>
                <div className="mt-2 h-1.5 w-32 rounded-full bg-[#1F2937] overflow-hidden">
                  <div
                    className="h-full rounded-full animate-shimmer"
                    style={{ background: `linear-gradient(90deg, transparent, ${config.accent}40, transparent)`, width: "200%" }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="flex flex-col items-center py-6 text-center">
              <div className="w-10 h-10 rounded-xl border border-[#F59E0B]/20 bg-[#F59E0B]/[0.06] flex items-center justify-center mb-3">
                <AlertCircle className="w-5 h-5 text-[#F59E0B]" />
              </div>
              <p className="text-sm text-[#94A3B8] mb-1">Insight unavailable</p>
              <p className="text-xs text-[#64748B] mb-3">
                {error.includes("401")
                  ? "Please sign in to see AI insights."
                  : "AI service is currently offline."}
              </p>
              <button
                onClick={handleRetry}
                className="text-xs font-medium text-[#10B981] hover:text-[#059669] flex items-center gap-1 transition-colors"
              >
                <RefreshCw className="w-3 h-3" /> Retry
              </button>
            </div>
          )}

          {/* Empty Data State */}
          {!loading && !error && !data && (
            <div className="flex flex-col items-center py-6 text-center">
              <div className="w-10 h-10 rounded-xl border border-[#1F2937] bg-[#0B1020] flex items-center justify-center mb-3">
                <Sparkles className="w-5 h-5 text-[#374151]" />
              </div>
              <p className="text-sm text-[#64748B]">No insight available</p>
              <p className="text-xs text-[#475569] mt-1">
                Add financial data to unlock AI analysis.
              </p>
            </div>
          )}

          {/* Success State */}
          {!loading && !error && data && (
            <div className="relative">
              {/* Accent left border */}
              <div
                className="absolute left-0 top-0 bottom-0 w-0.5 rounded-full"
                style={{ backgroundColor: `${config.accent}40` }}
              />
              <p className="whitespace-pre-wrap text-sm text-[#E5E7EB] leading-relaxed pl-4">
                {data}
              </p>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
