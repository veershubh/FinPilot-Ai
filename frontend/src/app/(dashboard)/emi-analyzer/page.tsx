"use client";

import React from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { EMIForm } from "@/components/emi/EMIForm";
import { EMIResult } from "@/components/emi/EMIResult";
import { useAnalysis } from "@/hooks/useAnalysis";
import { Button } from "@/components/ui/Button";
import { RotateCcw } from "lucide-react";

export default function EMIAnalyzerPage() {
  const { result, loading, error, analyze, reset } = useAnalysis();

  return (
    <PageWrapper title="EMI Analyzer" subtitle="Compare EMI vs Full Payment options for any purchase">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <EMIForm onSubmit={analyze} loading={loading} />
        </div>

        <div>
          {error && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5 mb-5">
              <p className="text-sm text-red-400 font-medium">Analysis Failed</p>
              <p className="text-xs text-red-300/70 mt-1">{error}</p>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-10 h-10 rounded-full border-2 border-[#10B981]/30 border-t-[#10B981] animate-spin" />
              <p className="text-sm text-[#94A3B8] mt-4">Analyzing your finances...</p>
            </div>
          )}

          {result && !loading && (
            <div>
              <div className="flex justify-end mb-4">
                <Button variant="ghost" size="sm" onClick={reset}>
                  <RotateCcw className="w-3.5 h-3.5" />
                  New Analysis
                </Button>
              </div>
              <EMIResult result={result} />
            </div>
          )}

          {!result && !loading && !error && (
            <div className="flex flex-col items-center justify-center py-20 text-[#64748B]">
              <div className="w-16 h-16 rounded-2xl bg-[#111827] border border-[#1F2937] flex items-center justify-center mb-4">
                <svg className="w-8 h-8 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm font-medium">Ready to Analyze</p>
              <p className="text-xs text-[#64748B] mt-1 text-center max-w-[250px]">
                Fill in the form and click &quot;Analyze Purchase&quot; to get your recommendation.
              </p>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
