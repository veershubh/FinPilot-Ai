"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StatsCard } from "@/components/dashboard/StatsCard";
import {
  Wallet, Landmark, Plus, X, Pencil, Trash2, Home,
  Car, GraduationCap, CreditCard, PieChart, Calendar, RefreshCw, ChevronDown,
  BarChart3, Activity
} from "lucide-react";
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { Liability, LiabilityInsert, LiabilityCategory, LiabilitySummary } from "@/types/liabilities";
import { LIABILITY_CATEGORIES, LIABILITY_CATEGORY_LABELS, LIABILITY_CATEGORY_COLORS } from "@/types/liabilities";
import Link from "next/link";

const CATEGORY_ICONS: Record<LiabilityCategory, any> = {
  home_loan: Home,
  auto_loan: Car,
  education_loan: GraduationCap,
  personal_loan: Wallet,
  credit_card: CreditCard,
  other: Landmark,
};

function formatCurrency(n: number): string {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n.toLocaleString("en-IN")}`;
}

function SkeletonCard() {
  return (
    <Card variant="elevated" className="p-5 animate-pulse">
      <div className="h-4 bg-[#1F2937] rounded w-1/3 mb-3" />
      <div className="h-8 bg-[#1F2937] rounded w-1/2 mb-2" />
      <div className="h-3 bg-[#1F2937] rounded w-2/3" />
    </Card>
  );
}

function LiabilityModal({
  liability,
  onClose,
  onSave,
  saving,
}: {
  liability: Liability | null;
  onClose: () => void;
  onSave: (data: LiabilityInsert) => void;
  saving: boolean;
}) {
  const isEdit = !!liability;
  const [form, setForm] = useState<LiabilityInsert>({
    name: liability?.name ?? "",
    category: liability?.category ?? "home_loan",
    institution: liability?.institution ?? "",
    outstanding_balance: liability?.outstanding_balance ?? 0,
    original_amount: liability?.original_amount ?? 0,
    interest_rate: liability?.interest_rate ?? 0,
    monthly_emi: liability?.monthly_emi ?? 0,
    start_date: liability?.start_date ?? "",
    end_date: liability?.end_date ?? "",
    notes: liability?.notes ?? "",
    status: liability?.status ?? "active",
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
            {isEdit ? "Edit Liability" : "Add New Liability"}
          </h2>
          <button onClick={onClose} className="text-[#64748B] hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <Input
            label="Loan / Card Name"
            placeholder="e.g. HDFC Home Loan"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[#94A3B8]">Category</label>
            <div className="relative">
              <select
                value={form.category}
                onChange={(e) => handleChange("category", e.target.value)}
                className="w-full rounded-xl border border-[#1F2937] bg-[#0B1020] px-4 py-3 text-sm text-white appearance-none cursor-pointer focus:outline-none focus:border-[#EF4444]/50"
              >
                {LIABILITY_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{LIABILITY_CATEGORY_LABELS[c]}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] pointer-events-none" />
            </div>
          </div>

          <Input
            label="Institution / Bank"
            placeholder="e.g. SBI, HDFC"
            value={form.institution ?? ""}
            onChange={(e) => handleChange("institution", e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Outstanding Balance (₹)"
              type="number"
              placeholder="0"
              value={form.outstanding_balance || ""}
              onChange={(e) => handleChange("outstanding_balance", parseFloat(e.target.value) || 0)}
            />
            <Input
              label="Original Amount (₹)"
              type="number"
              placeholder="Optional"
              value={form.original_amount || ""}
              onChange={(e) => handleChange("original_amount", parseFloat(e.target.value) || 0)}
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
              label={form.category === "credit_card" ? "Min. Payment / EMI" : "Monthly EMI (₹)"}
              type="number"
              placeholder="0"
              value={form.monthly_emi || ""}
              onChange={(e) => handleChange("monthly_emi", parseFloat(e.target.value) || 0)}
            />
          </div>

          {(form.category !== "credit_card") && (
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Start Date"
                type="date"
                value={form.start_date ?? ""}
                onChange={(e) => handleChange("start_date", e.target.value)}
              />
              <Input
                label="End Date"
                type="date"
                value={form.end_date ?? ""}
                onChange={(e) => handleChange("end_date", e.target.value)}
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[#94A3B8]">Notes</label>
            <textarea
              value={form.notes ?? ""}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Any additional details..."
              rows={2}
              className="w-full rounded-xl border border-[#1F2937] bg-[#0B1020] px-4 py-3 text-sm text-white placeholder-[#64748B] focus:outline-none focus:border-[#EF4444]/50 resize-none"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[#1F2937] flex justify-end gap-3 bg-[#0B1020]/50">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            loading={saving}
            disabled={!form.name || form.outstanding_balance <= 0}
            onClick={() => onSave(form)}
          >
            {isEdit ? "Save Changes" : "Add Liability"}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function LiabilitiesPage() {
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [summary, setSummary] = useState<LiabilitySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [modalLiability, setModalLiability] = useState<Liability | null | "new">(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [liabilitiesRes, summaryRes] = await Promise.all([
        fetch(`/api/liabilities${activeCategory !== "all" ? `?category=${activeCategory}` : ""}`),
        fetch("/api/liabilities?summary=true"),
      ]);

      if (!liabilitiesRes.ok || !summaryRes.ok) throw new Error("Failed to load liabilities");

      const [liabilitiesData, summaryData] = await Promise.all([
        liabilitiesRes.json(),
        summaryRes.json(),
      ]);

      setLiabilities(Array.isArray(liabilitiesData) ? liabilitiesData : []);
      setSummary(summaryData);
    } catch (e: any) {
      setError(e.message);
      setLiabilities([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [activeCategory]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async (data: LiabilityInsert) => {
    setSaving(true);
    try {
      const isEdit = modalLiability && modalLiability !== "new";
      const url = isEdit ? `/api/liabilities/${(modalLiability as Liability).id}` : "/api/liabilities";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to save");

      setModalLiability(null);
      fetchData();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this liability permanently?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/liabilities/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      fetchData();
    } catch {
      alert("Failed to delete liability");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <PageWrapper title="Liabilities Dashboard" subtitle="Manage your loans and credit cards" badge="Debt">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatsCard
          title="Total Outstanding"
          value={summary ? formatCurrency(summary.totalOutstanding) : "—"}
          icon={<CreditCard className="w-5 h-5" />}
          accentColor="amber"
          delay={0}
        />
        <StatsCard
          title="Monthly Debt Burden"
          value={summary ? formatCurrency(summary.totalMonthlyEmi) : "—"}
          icon={<Calendar className="w-5 h-5" />}
          accentColor="blue"
          delay={0.05}
        />
        <StatsCard
          title="Active Loans"
          value={summary ? String(summary.activeLoans ?? summary.liabilityCount) : "—"}
          icon={<Activity className="w-5 h-5" />}
          accentColor="emerald"
          delay={0.1}
        />
        <StatsCard
          title="Debt-to-Income"
          value={summary?.debtToIncomeRatio != null ? `${summary.debtToIncomeRatio}%` : "—"}
          icon={<BarChart3 className="w-5 h-5" />}
          accentColor="violet"
          delay={0.15}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card variant="elevated" className="p-6 h-full relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#EF4444]/5 to-transparent rounded-bl-full pointer-events-none" />

            <div className="flex items-center gap-2.5 mb-6 relative z-10">
              <div className="w-8 h-8 rounded-lg border border-[#EF4444]/20 bg-[#EF4444]/[0.06] flex items-center justify-center">
                <PieChart className="w-4 h-4 text-[#EF4444]" />
              </div>
              <h3 className="text-sm font-semibold text-white">Debt Distribution</h3>
            </div>
            
            {loading ? (
              <div className="h-48 flex items-center justify-center">
                <RefreshCw className="w-6 h-6 text-[#64748B] animate-spin" />
              </div>
            ) : summary && summary.allocation.length > 0 ? (
              <div className="flex flex-col items-center relative z-10">
                <ResponsiveContainer width="100%" height={220}>
                  <RePieChart>
                    <Pie
                      data={summary.allocation}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={90}
                      dataKey="value"
                      paddingAngle={3}
                      stroke="none"
                      cornerRadius={4}
                    >
                      {summary.allocation.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: "#0B1020",
                        border: "1px solid #1F2937",
                        borderRadius: "12px",
                        color: "#fff",
                        fontSize: "12px",
                      }}
                      itemStyle={{ color: "#E5E7EB" }}
                    />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-[#64748B] text-sm relative z-10">
                No debts to display
              </div>
            )}
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="lg:col-span-2">
          <Card variant="elevated" className="p-6 h-full relative overflow-hidden">
             <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-[#F59E0B]/5 to-transparent rounded-bl-full pointer-events-none" />

            <div className="flex items-center gap-2.5 mb-6 relative z-10">
              <div className="w-8 h-8 rounded-lg border border-[#F59E0B]/20 bg-[#F59E0B]/[0.06] flex items-center justify-center">
                <Wallet className="w-4 h-4 text-[#F59E0B]" />
              </div>
              <h3 className="text-sm font-semibold text-white">Debt Breakdown</h3>
            </div>

            {loading ? (
              <div className="space-y-4 relative z-10">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-[#1F2937] rounded w-full mb-2" />
                  </div>
                ))}
              </div>
            ) : summary && summary.allocation.length > 0 ? (
              <div className="space-y-4 relative z-10">
                {summary.allocation
                  .sort((a, b) => b.value - a.value)
                  .map((a) => {
                    const pct = summary.totalOutstanding > 0 ? (a.value / summary.totalOutstanding) * 100 : 0;
                    return (
                      <div key={a.category}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm font-medium text-[#E5E7EB] flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full" style={{ backgroundColor: a.color }} />
                             {a.label}
                          </span>
                          <span className="text-sm font-bold text-white">
                            {formatCurrency(a.value)} <span className="text-xs font-normal text-[#64748B] ml-1">({pct.toFixed(1)}%)</span>
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-[#0B1020] border border-[#1F2937] overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: a.color, boxShadow: `0 0 10px ${a.color}80` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center text-[#64748B] text-sm relative z-10">
                Add liabilities to see the breakdown
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              activeCategory === "all"
                ? "bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/30 shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                : "bg-[#0B1020] text-[#94A3B8] hover:text-white border border-[#1F2937] hover:border-[#374151]"
            }`}
          >
            All Debts
          </button>
          {LIABILITY_CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeCategory === c
                  ? "bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/30 shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                  : "bg-[#0B1020] text-[#94A3B8] hover:text-white border border-[#1F2937] hover:border-[#374151]"
              }`}
            >
              {LIABILITY_CATEGORY_LABELS[c]}
            </button>
          ))}
        </div>
        <Button onClick={() => setModalLiability("new")} className="shadow-lg shadow-[#EF4444]/20 !bg-[#EF4444] hover:!bg-[#DC2626] text-white">
          <Plus className="w-4 h-4" /> Add Liability
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : error ? (
        <Card className="p-8 text-center border-red-500/20 bg-red-500/[0.02]">
          <p className="text-red-400 text-sm mb-3">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="w-4 h-4" /> Retry
          </Button>
        </Card>
      ) : liabilities.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card variant="elevated" className="p-12 text-center">
            <div className="w-16 h-16 rounded-2xl border border-[#EF4444]/20 bg-[#EF4444]/[0.06] flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-[#EF4444]" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">No liabilities found</h3>
            <p className="text-sm text-[#94A3B8] mb-6 max-w-sm mx-auto">
              {activeCategory === "all" 
                ? "Start tracking your loans and credit cards to stay on top of your debt." 
                : `You don't have any ${LIABILITY_CATEGORY_LABELS[activeCategory as LiabilityCategory]}s yet.`}
            </p>
            <Button onClick={() => setModalLiability("new")} className="!bg-[#EF4444] hover:!bg-[#DC2626]">
              <Plus className="w-4 h-4" /> Add Liability
            </Button>
          </Card>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {liabilities.map((liability, i) => {
            const Icon = CATEGORY_ICONS[liability.category] ?? Wallet;
            const color = LIABILITY_CATEGORY_COLORS[liability.category] ?? "#64748B";

            return (
              <motion.div
                key={liability.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={`/liabilities/${liability.id}`}>
                  <Card hover variant="elevated" className="p-5 h-full flex flex-col cursor-pointer group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div 
                          className="w-10 h-10 rounded-xl border flex items-center justify-center bg-[#0B1020] transition-colors group-hover:bg-[#111827]" 
                          style={{ borderColor: `${color}30` }}
                        >
                          <Icon className="w-5 h-5" style={{ color }} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-[15px] font-bold text-white truncate group-hover:text-[#EF4444] transition-colors">{liability.name}</h4>
                          <p className="text-xs font-medium text-[#94A3B8] mt-0.5 truncate">
                            {LIABILITY_CATEGORY_LABELS[liability.category]}
                            {liability.institution && ` · ${liability.institution}`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setModalLiability(liability); }}
                          className="p-1.5 rounded-lg text-[#64748B] hover:text-white hover:bg-white/10 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(liability.id, e)}
                          disabled={deletingId === liability.id}
                          className="p-1.5 rounded-lg text-[#64748B] hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-auto flex items-end justify-between pt-2">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B] mb-1">Outstanding</p>
                        <p className="text-xl font-bold text-[#EF4444] tracking-tight">{formatCurrency(liability.outstanding_balance)}</p>
                      </div>
                      <div className="text-right">
                         <p className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B] mb-1">EMI</p>
                        <p className="text-sm font-semibold text-white">{formatCurrency(liability.monthly_emi)}/mo</p>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {modalLiability && (
          <LiabilityModal
            liability={modalLiability === "new" ? null : modalLiability}
            onClose={() => setModalLiability(null)}
            onSave={handleSave}
            saving={saving}
          />
        )}
      </AnimatePresence>
    </PageWrapper>
  );
}
