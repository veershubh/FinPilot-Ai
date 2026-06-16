"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Wallet, Building2, Gem, Landmark, TrendingUp, TrendingDown,
  Plus, X, Pencil, Trash2, Banknote, BarChart3, PiggyBank,
  RefreshCw, ChevronDown,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { Asset, AssetInsert, AssetCategory, AssetSummary } from "@/types/assets";
import { ASSET_CATEGORIES, ASSET_CATEGORY_LABELS, ASSET_CATEGORY_COLORS } from "@/types/assets";

const CATEGORY_ICONS: Record<AssetCategory, any> = {
  bank_account: Banknote,
  fixed_deposit: Landmark,
  mutual_fund: BarChart3,
  stock: TrendingUp,
  gold: Gem,
  real_estate: Building2,
  other: Wallet,
};

function formatCurrency(n: number): string {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n.toLocaleString("en-IN")}`;
}

// ─── Skeleton Loader ─────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-[#1F2937] bg-[#111827] p-5 animate-pulse">
      <div className="h-4 bg-[#1F2937] rounded w-1/3 mb-3" />
      <div className="h-8 bg-[#1F2937] rounded w-1/2 mb-2" />
      <div className="h-3 bg-[#1F2937] rounded w-2/3" />
    </div>
  );
}

// ─── Add/Edit Modal ──────────────────────────────────────────────
function AssetModal({
  asset,
  onClose,
  onSave,
  saving,
}: {
  asset: Asset | null;
  onClose: () => void;
  onSave: (data: AssetInsert) => void;
  saving: boolean;
}) {
  const isEdit = !!asset;
  const [form, setForm] = useState<AssetInsert>({
    name: asset?.name ?? "",
    category: asset?.category ?? "bank_account",
    institution: asset?.institution ?? "",
    current_value: asset?.current_value ?? 0,
    invested_value: asset?.invested_value ?? 0,
    interest_rate: asset?.interest_rate ?? 0,
    maturity_date: asset?.maturity_date ?? "",
    units: asset?.units ?? null,
    notes: asset?.notes ?? "",
    status: asset?.status ?? "active",
  });

  const handleChange = (field: string, value: any) => {
    setForm((p) => ({ ...p, [field]: value }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-[#0F172A] border border-[#1F2937] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1F2937]">
          <h2 className="text-lg font-bold text-white">
            {isEdit ? "Edit Asset" : "Add New Asset"}
          </h2>
          <button onClick={onClose} className="text-[#64748B] hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <Input
            label="Asset Name"
            placeholder="e.g. HDFC Savings Account"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-white">Category</label>
            <div className="relative">
              <select
                value={form.category}
                onChange={(e) => handleChange("category", e.target.value)}
                className="w-full rounded-xl border border-[#1F2937] bg-[#0F172A] px-4 py-3 text-sm text-white appearance-none cursor-pointer focus:outline-none focus:border-[#10B981]/50"
              >
                {ASSET_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{ASSET_CATEGORY_LABELS[c]}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] pointer-events-none" />
            </div>
          </div>

          <Input
            label="Institution / Broker"
            placeholder="e.g. HDFC Bank, Zerodha"
            value={form.institution ?? ""}
            onChange={(e) => handleChange("institution", e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Current Value (₹)"
              type="number"
              placeholder="0"
              value={form.current_value || ""}
              onChange={(e) => handleChange("current_value", parseFloat(e.target.value) || 0)}
            />
            <Input
              label="Invested Value (₹)"
              type="number"
              placeholder="0"
              value={form.invested_value || ""}
              onChange={(e) => handleChange("invested_value", parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Interest Rate (%)"
              type="number"
              step="0.1"
              placeholder="0"
              value={form.interest_rate || ""}
              onChange={(e) => handleChange("interest_rate", parseFloat(e.target.value) || 0)}
            />
            <Input
              label="Units / Quantity"
              type="number"
              placeholder="Optional"
              value={form.units ?? ""}
              onChange={(e) => handleChange("units", e.target.value ? parseFloat(e.target.value) : null)}
            />
          </div>

          {(form.category === "fixed_deposit") && (
            <Input
              label="Maturity Date"
              type="date"
              value={form.maturity_date ?? ""}
              onChange={(e) => handleChange("maturity_date", e.target.value)}
            />
          )}

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-white">Notes</label>
            <textarea
              value={form.notes ?? ""}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Any additional details..."
              rows={2}
              className="w-full rounded-xl border border-[#1F2937] bg-[#0F172A] px-4 py-3 text-sm text-white placeholder-[#64748B] focus:outline-none focus:border-[#10B981]/50 resize-none"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[#1F2937] flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            loading={saving}
            disabled={!form.name || form.current_value <= 0}
            onClick={() => onSave(form)}
          >
            {isEdit ? "Save Changes" : "Add Asset"}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────
export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [summary, setSummary] = useState<AssetSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [modalAsset, setModalAsset] = useState<Asset | null | "new">(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [assetsRes, summaryRes] = await Promise.all([
        fetch(`/api/assets${activeCategory !== "all" ? `?category=${activeCategory}` : ""}`),
        fetch("/api/assets?summary=true"),
      ]);

      if (!assetsRes.ok || !summaryRes.ok) {
        const errData = await assetsRes.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to load assets");
      }

      const [assetsData, summaryData] = await Promise.all([
        assetsRes.json(),
        summaryRes.json(),
      ]);

      setAssets(Array.isArray(assetsData) ? assetsData : []);
      setSummary(summaryData);
    } catch (e: any) {
      setError(e.message);
      setAssets([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [activeCategory]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async (data: AssetInsert) => {
    setSaving(true);
    try {
      const isEdit = modalAsset && modalAsset !== "new";
      const url = isEdit ? `/api/assets/${(modalAsset as Asset).id}` : "/api/assets";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save");
      }

      setModalAsset(null);
      fetchData();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this asset permanently?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/assets/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      fetchData();
    } catch {
      alert("Failed to delete asset");
    } finally {
      setDeletingId(null);
    }
  };

  const statCards = [
    {
      label: "Total Asset Value",
      value: summary ? formatCurrency(summary.totalValue) : "—",
      icon: Wallet,
      color: "#10B981",
    },
    {
      label: "Total Invested",
      value: summary ? formatCurrency(summary.totalInvested) : "—",
      icon: PiggyBank,
      color: "#3B82F6",
    },
    {
      label: "Overall Returns",
      value: summary ? `${summary.overallReturns >= 0 ? "+" : ""}${summary.overallReturns}%` : "—",
      icon: summary && summary.overallReturns >= 0 ? TrendingUp : TrendingDown,
      color: summary && summary.overallReturns >= 0 ? "#10B981" : "#EF4444",
    },
    {
      label: "Total Assets",
      value: summary ? String(summary.assetCount) : "—",
      icon: BarChart3,
      color: "#8B5CF6",
    },
  ];

  return (
    <PageWrapper title="Assets" subtitle="Track and manage your asset portfolio">
      {/* ── Stat Cards ────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : statCards.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">{s.label}</p>
                      <div className="p-2 rounded-lg" style={{ backgroundColor: `${s.color}15` }}>
                        <Icon className="w-4 h-4" style={{ color: s.color }} />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-white">{s.value}</p>
                  </Card>
                </motion.div>
              );
            })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* ── Allocation Chart ──────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 h-full">
            <h3 className="text-sm font-semibold text-white mb-4">Asset Allocation</h3>
            {loading ? (
              <div className="h-48 flex items-center justify-center">
                <RefreshCw className="w-6 h-6 text-[#64748B] animate-spin" />
              </div>
            ) : summary && summary.allocation.length > 0 ? (
              <div className="flex flex-col items-center">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={summary.allocation}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      dataKey="value"
                      paddingAngle={2}
                      stroke="none"
                    >
                      {summary.allocation.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: "#1F2937",
                        border: "1px solid #374151",
                        borderRadius: "12px",
                        color: "#fff",
                        fontSize: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-2 mt-3 justify-center">
                  {summary.allocation.map((a) => (
                    <div key={a.category} className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: a.color }} />
                      {a.label}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-[#64748B] text-sm">
                No assets to display
              </div>
            )}
          </Card>
        </motion.div>

        {/* ── Category Breakdown ────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="lg:col-span-2"
        >
          <Card className="p-6 h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Category Breakdown</h3>
            </div>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-[#1F2937] rounded w-full mb-2" />
                  </div>
                ))}
              </div>
            ) : summary && summary.allocation.length > 0 ? (
              <div className="space-y-3">
                {summary.allocation
                  .sort((a, b) => b.value - a.value)
                  .map((a) => {
                    const pct = summary.totalValue > 0 ? (a.value / summary.totalValue) * 100 : 0;
                    return (
                      <div key={a.category}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-[#94A3B8]">{a.label}</span>
                          <span className="text-sm font-medium text-white">
                            {formatCurrency(a.value)} <span className="text-xs text-[#64748B]">({pct.toFixed(1)}%)</span>
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-[#1F2937] overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: a.color }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center text-[#64748B] text-sm">
                Add assets to see the breakdown
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      {/* ── Category Filter + Add Button ────────────────── */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeCategory === "all"
                ? "bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20"
                : "text-[#64748B] hover:text-white border border-transparent"
            }`}
          >
            All
          </button>
          {ASSET_CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                activeCategory === c
                  ? "bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20"
                  : "text-[#64748B] hover:text-white border border-transparent"
              }`}
            >
              {ASSET_CATEGORY_LABELS[c]}
            </button>
          ))}
        </div>
        <Button size="sm" onClick={() => setModalAsset("new")}>
          <Plus className="w-4 h-4" /> Add Asset
        </Button>
      </div>

      {/* ── Asset List ──────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : error ? (
        <Card className="p-8 text-center">
          <p className="text-red-400 text-sm mb-3">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="w-4 h-4" /> Retry
          </Button>
        </Card>
      ) : assets.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card className="p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#10B981]/10 flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-8 h-8 text-[#10B981]" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">No assets yet</h3>
            <p className="text-sm text-[#64748B] mb-4 max-w-sm mx-auto">
              Start tracking your bank accounts, investments, and properties.
            </p>
            <Button onClick={() => setModalAsset("new")}>
              <Plus className="w-4 h-4" /> Add Your First Asset
            </Button>
          </Card>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assets.map((asset, i) => {
            const Icon = CATEGORY_ICONS[asset.category] ?? Wallet;
            const color = ASSET_CATEGORY_COLORS[asset.category] ?? "#64748B";
            const returns = asset.returns_percentage ?? 0;
            const isPositive = returns >= 0;

            return (
              <motion.div
                key={asset.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card hover className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${color}15` }}>
                        <Icon className="w-5 h-5" style={{ color }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-semibold text-white truncate">{asset.name}</h4>
                        <p className="text-xs text-[#64748B] mt-0.5">
                          {ASSET_CATEGORY_LABELS[asset.category]}
                          {asset.institution && ` · ${asset.institution}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 ml-2">
                      <button
                        onClick={() => setModalAsset(asset)}
                        className="p-1.5 rounded-lg text-[#64748B] hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(asset.id)}
                        disabled={deletingId === asset.id}
                        className="p-1.5 rounded-lg text-[#64748B] hover:text-red-400 hover:bg-red-500/5 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <p className="text-xs text-[#64748B] mb-0.5">Current Value</p>
                      <p className="text-lg font-bold text-white">{formatCurrency(asset.current_value)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[#64748B] mb-0.5">Returns</p>
                      <p className={`text-sm font-semibold ${isPositive ? "text-[#10B981]" : "text-[#EF4444]"}`}>
                        {isPositive ? "+" : ""}{returns.toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  {asset.interest_rate > 0 && (
                    <div className="mt-3 pt-3 border-t border-[#1F2937]">
                      <p className="text-xs text-[#64748B]">
                        Interest Rate: <span className="text-white">{asset.interest_rate}% p.a.</span>
                        {asset.maturity_date && (
                          <> · Matures: <span className="text-white">{new Date(asset.maturity_date).toLocaleDateString("en-IN")}</span></>
                        )}
                      </p>
                    </div>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── Modal ─────────────────────────────────────────── */}
      <AnimatePresence>
        {modalAsset && (
          <AssetModal
            asset={modalAsset === "new" ? null : modalAsset}
            onClose={() => setModalAsset(null)}
            onSave={handleSave}
            saving={saving}
          />
        )}
      </AnimatePresence>
    </PageWrapper>
  );
}
