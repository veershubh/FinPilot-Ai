"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  ArrowLeft, Pencil, Trash2, Calendar, Landmark, Percent, RefreshCw, Wallet, CreditCard
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import type { Liability, LiabilityHistory } from "@/types/liabilities";
import { LIABILITY_CATEGORY_LABELS, LIABILITY_CATEGORY_COLORS } from "@/types/liabilities";
import Link from "next/link";

function formatCurrency(n: number): string {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n.toLocaleString("en-IN")}`;
}

export default function LiabilityDetailsPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [liability, setLiability] = useState<Liability | null>(null);
  const [history, setHistory] = useState<LiabilityHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [liabilityRes, historyRes] = await Promise.all([
        fetch(`/api/liabilities/${id}`),
        fetch(`/api/liabilities/${id}/history`),
      ]);

      if (!liabilityRes.ok) throw new Error("Failed to load liability details");
      const data = await liabilityRes.json();
      const historyData = historyRes.ok ? await historyRes.json() : [];

      setLiability(data);
      setHistory(historyData);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <PageWrapper title="Loading..." badge="Debt">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 text-[#EF4444] animate-spin" />
        </div>
      </PageWrapper>
    );
  }

  if (error || !liability) {
    return (
      <PageWrapper title="Error" badge="Debt">
        <Card className="p-8 text-center border-red-500/20 bg-red-500/[0.02]">
          <p className="text-red-400 text-sm mb-3">{error || "Liability not found"}</p>
          <Button variant="outline" size="sm" onClick={() => router.push("/liabilities")}>
             Return to Liabilities
          </Button>
        </Card>
      </PageWrapper>
    );
  }

  const color = LIABILITY_CATEGORY_COLORS[liability.category] || "#EF4444";

  // Prepare chart data (paydown chart)
  const chartData = history.map(h => ({
    date: new Date(h.recorded_date).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
    balance: h.outstanding_balance
  }));

  const progress = liability.original_amount > 0 
    ? Math.max(0, Math.min(100, ((liability.original_amount - liability.outstanding_balance) / liability.original_amount) * 100))
    : 0;

  return (
    <PageWrapper 
      title={liability.name} 
      subtitle={`${LIABILITY_CATEGORY_LABELS[liability.category]} ${liability.institution ? `· ${liability.institution}` : ''}`} 
      badge="Debt Details"
      action={
        <Link href="/liabilities" className="text-sm font-medium text-[#94A3B8] hover:text-white flex items-center gap-2 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Debts
        </Link>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Main Value Card */}
        <Card variant="elevated" className="lg:col-span-1 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl rounded-bl-full pointer-events-none opacity-40"
               style={{ backgroundImage: `linear-gradient(to bottom left, ${color}20, transparent)` }} />
          
          <div className="relative z-10">
            <p className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-2">Outstanding Balance</p>
            <h2 className="text-4xl font-extrabold text-[#EF4444] tracking-tight mb-4">
              {formatCurrency(liability.outstanding_balance)}
            </h2>

            {liability.original_amount > 0 && (
              <div className="mb-8">
                <div className="flex justify-between text-xs text-[#94A3B8] mb-1.5">
                   <span>Paid Off</span>
                   <span className="font-bold text-white">{progress.toFixed(1)}%</span>
                </div>
                <div className="h-2 rounded-full bg-[#0B1020] border border-[#1F2937] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}80` }}
                    />
                </div>
              </div>
            )}
            
            <div className="space-y-4 pt-6 border-t border-[#1F2937]">
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#94A3B8] flex items-center gap-2">
                   <Wallet className="w-4 h-4" /> Monthly EMI
                </span>
                <span className="text-sm font-bold text-white">{formatCurrency(liability.monthly_emi)}</span>
              </div>
              {liability.original_amount > 0 && (
                 <div className="flex justify-between items-center">
                   <span className="text-sm text-[#94A3B8] flex items-center gap-2">
                      <Landmark className="w-4 h-4" /> Original Amount
                   </span>
                   <span className="text-sm font-bold text-white">{formatCurrency(liability.original_amount)}</span>
                 </div>
              )}
              {liability.interest_rate > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#94A3B8] flex items-center gap-2">
                     <Percent className="w-4 h-4" /> Interest Rate
                  </span>
                  <span className="text-sm font-bold text-white">{liability.interest_rate}% p.a.</span>
                </div>
              )}
              {liability.end_date && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#94A3B8] flex items-center gap-2">
                     <Calendar className="w-4 h-4" /> Payoff Date
                  </span>
                  <span className="text-sm font-bold text-white">{new Date(liability.end_date).toLocaleDateString("en-IN")}</span>
                </div>
              )}
            </div>

            {liability.notes && (
              <div className="mt-6 pt-4 border-t border-[#1F2937]">
                 <p className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-1.5">Notes</p>
                 <p className="text-sm text-[#E5E7EB] leading-relaxed bg-[#0B1020] p-3 rounded-xl border border-[#1F2937]">{liability.notes}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Performance Chart */}
        <Card variant="elevated" className="lg:col-span-2 p-6">
           <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-semibold text-white">Paydown History</h3>
              {chartData.length === 0 && <span className="text-xs text-[#64748B]">No history available</span>}
           </div>

           {chartData.length > 0 ? (
             <div className="h-[300px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={color} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      stroke="#64748B" 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false} 
                      minTickGap={30}
                    />
                    <YAxis 
                      stroke="#64748B" 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false}
                      tickFormatter={(val) => `₹${val >= 1000 ? (val/1000).toFixed(0) + 'k' : val}`}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#0B1020", borderColor: "#1F2937", borderRadius: "12px", color: "#fff" }}
                      itemStyle={{ color: "#EF4444", fontWeight: 600 }}
                      labelStyle={{ color: "#94A3B8", marginBottom: "4px" }}
                      formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, "Balance"]}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="balance" 
                      stroke={color} 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorValue)" 
                      animationDuration={1500}
                    />
                  </AreaChart>
               </ResponsiveContainer>
             </div>
           ) : (
             <div className="h-[300px] w-full flex flex-col items-center justify-center border border-dashed border-[#1F2937] rounded-xl bg-[#0B1020]/50">
                <CreditCard className="w-8 h-8 text-[#374151] mb-2" />
                <p className="text-sm font-medium text-[#94A3B8]">History is being recorded</p>
                <p className="text-xs text-[#64748B] mt-1">Changes to this debt balance will appear here over time.</p>
             </div>
           )}
        </Card>

      </div>
    </PageWrapper>
  );
}
