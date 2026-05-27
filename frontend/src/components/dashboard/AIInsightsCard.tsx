import { useInsights } from '@/hooks/useInsights';
import { Card } from '@/components/ui/Card';
import { Loader2 } from 'lucide-react';
import React, { useEffect } from 'react';

/**
 * AI Insights Card – displays a streaming insight.
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

  useEffect(() => {
    startInsight(type, payload);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, payload]);

  return (
    <Card className="p-6 bg-[#111827] border-[#1F2937]">
      <h3 className="text-sm font-semibold text-[#94A3B8] uppercase tracking-wider mb-4">
        {title}
      </h3>
      {loading && (
        <div className="flex items-center space-x-2 text-[#64748B]">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Generating insight…</span>
        </div>
      )}
      {error && (
        <p className="text-sm text-red-500">Error: {error}</p>
      )}
      {!loading && !error && (
        <p className="whitespace-pre-wrap text-sm text-[#E5E7EB]">
          {data}
        </p>
      )}
    </Card>
  );
}
