"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  ArrowLeft, Pencil, Trash2, TrendingUp, TrendingDown,
  Calendar, PiggyBank, Landmark, Percent, RefreshCw
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import type { Asset, AssetHistory } from "@/types/assets";
import { ASSET_CATEGORY_LABELS, ASSET_CATEGORY_COLORS } from "@/types/assets";
import Link from "next/link";

function formatCurrency(n: number): string {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n.toLocaleString("en-IN")}`;
}

export default function AssetDetailsPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [asset, setAsset] = useState<Asset | null>(null);
  const [history, setHistory] = useState<AssetHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [assetRes, historyRes] = await Promise.all([
        fetch(`/api/assets/${id}`),
        fetch(`/api/assets/${id}/history`),
      ]);

      if (!assetRes.ok) throw new Error("Failed to load asset details");
      const assetData = await assetRes.json();
      const historyData = historyRes.ok ? await historyRes.json() : [];

      setAsset(assetData);
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
      <PageWrapper title="Loading..." badge="Asset">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 text-[#10B981] animate-spin" />
        </div>
      </PageWrapper>
    );
  }

  if (error || !asset) {
    return (
      <PageWrapper title="Error" badge="Asset">
        <Card className="p-8 text-center border-red-500/20 bg-red-500/[0.02]">
          <p className="text-red-400 text-sm mb-3">{error || "Asset not found"}</p>
          <Button variant="outline" size="sm" onClick={() => router.push("/assets")}>
             Return to Assets
          </Button>
        </Card>
      </PageWrapper>
    );
  }

  const color = ASSET_CATEGORY_COLORS[asset.category] || "#10B981";
  const isPositive = (asset.returns_percentage ?? 0) >= 0;

  // Prepare chart data
  const chartData = history.map(h => ({
    date: new Date(h.recorded_date).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
    value: h.value,
    invested: h.invested_value
  }));

  return (
    <PageWrapper 
      title={asset.name} 
      subtitle={`${ASSET_CATEGORY_LABELS[asset.category]} ${asset.institution ? `· ${asset.institution}` : ''}`} 
      badge="Asset Details"
      action={
        <Link href="/assets" className="text-sm font-medium text-[#94A3B8] hover:text-white flex items-center gap-2 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Assets
        </Link>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Main Value Card */}
        <Card variant="elevated" className="lg:col-span-1 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl rounded-bl-full pointer-events-none opacity-40"
               style={{ backgroundImage: `linear-gradient(to bottom left, ${color}20, transparent)` }} />
          
          <div className="relative z-10">
            <p className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-2">Current Value</p>
            <h2 className="text-4xl font-extrabold text-white tracking-tight mb-2">
              {formatCurrency(asset.current_value)}
            </h2>
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm font-bold ${isPositive ? "bg-[#10B981]/10 text-[#10B981]" : "bg-[#EF4444]/10 text-[#EF4444]"}`}>
              {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {isPositive ? "+" : ""}{(asset.returns_percentage ?? 0).toFixed(2)}% Overall
            </div>
            
            <div className="mt-8 space-y-4 pt-6 border-t border-[#1F2937]">
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#94A3B8] flex items-center gap-2">
                   <PiggyBank className="w-4 h-4" /> Total Invested
                </span>
                <span className="text-sm font-bold text-white">{formatCurrency(asset.invested_value)}</span>
              </div>
              {asset.interest_rate > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#94A3B8] flex items-center gap-2">
                     <Percent className="w-4 h-4" /> Interest Rate
                  </span>
                  <span className="text-sm font-bold text-white">{asset.interest_rate}% p.a.</span>
                </div>
              )}
              {asset.maturity_date && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#94A3B8] flex items-center gap-2">
                     <Calendar className="w-4 h-4" /> Maturity Date
                  </span>
                  <span className="text-sm font-bold text-white">{new Date(asset.maturity_date).toLocaleDateString("en-IN")}</span>
                </div>
              )}
               {asset.units && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#94A3B8] flex items-center gap-2">
                     <Landmark className="w-4 h-4" /> Units / Qty
                  </span>
                  <span className="text-sm font-bold text-white">{asset.units}</span>
                </div>
              )}
            </div>

            {asset.notes && (
              <div className="mt-6 pt-4 border-t border-[#1F2937]">
                 <p className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-1.5">Notes</p>
                 <p className="text-sm text-[#E5E7EB] leading-relaxed bg-[#0B1020] p-3 rounded-xl border border-[#1F2937]">{asset.notes}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Performance Chart */}
        <Card variant="elevated" className="lg:col-span-2 p-6">
           <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-semibold text-white">Performance History</h3>
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
                      itemStyle={{ color: "#fff", fontWeight: 600 }}
                      labelStyle={{ color: "#94A3B8", marginBottom: "4px" }}
                      formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, "Value"]}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
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
                <TrendingUp className="w-8 h-8 text-[#374151] mb-2" />
                <p className="text-sm font-medium text-[#94A3B8]">History is being recorded</p>
                <p className="text-xs text-[#64748B] mt-1">Changes to this asset will appear here over time.</p>
             </div>
           )}
        </Card>

      </div>
    </PageWrapper>
  );
}
