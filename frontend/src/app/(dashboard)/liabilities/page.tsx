"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  BarChart3, CreditCard, Home, Car, GraduationCap, Briefcase,
  Plus, X, Pencil, Trash2, AlertTriangle, TrendingDown,
  RefreshCw, ChevronDown, IndianRupee, Percent,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";
import type { Liability, LiabilityInsert, LiabilityCategory, LiabilitySummary } from "@/types/liabilities";
import { LIABILITY_CATEGORIES, LIABILITY_CATEGORY_LABELS, LIABILITY_CATEGORY_COLORS } from "@/types/liabilities";

const CATEGORY_ICONS: Record<LiabilityCategory, any> = {
  home_loan: Home,
  vehicle_loan: Car,
  personal_loan: BarChart3,
  education_loan: GraduationCap,
  credit_card: CreditCard,
  business_loan: Briefcase,
  other: AlertTriangle,
};

function formatCurrency(n: number): string {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n.toLocaleString("en-IN")}`;
}

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
    category: liability?.category ?? "personal_loan",
    lender: liability?.lender ?? "",
    original_amount: liability?.original_amount ?? 0,
    outstanding_balance: liability?.outstanding_balance ?? 0,
    monthly_emi: liability?.monthly_emi ?? 0,
    interest_rate: liability?.interest_rate ?? 0,
    start_date: liability?.start_date ? liability.start_date.split("T")[0] : new Date().toISOString().split("T")[0],
    end_date: liability?.end_date ? liability.end_date.split("T")[0] : "",
    next_due_date: liability?.next_due_date ? liability.next_due_date.split("T")[0] : "",
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
            label="Liability Name"
            placeholder="e.g. Home Loan – SBI"
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
                {LIABILITY_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{LIABILITY_CATEGORY_LABELS[c]}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] pointer-events-none" />
            </div>
          </div>

          <Input
            label="Lender / Institution"
            placeholder="e.g. SBI, HDFC Bank"
            value={form.lender ?? ""}
            onChange={(e) => handleChange("lender", e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Original Amount (₹)"
              type="number"
              placeholder="0"
              value={form.original_amount || ""}
              onChange={(e) => handleChange("original_amount", parseFloat(e.target.value) || 0)}
            />
            <Input
              label="Outstanding Balance (₹)"
              type="number"
              placeholder="0"
              value={form.outstanding_balance || ""}
              onChange={(e) => handleChange("outstanding_balance", parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Monthly EMI (₹)"
              type="number"
              placeholder="0"
              value={form.monthly_emi || ""}
              onChange={(e) => handleChange("monthly_emi", parseFloat(e.target.value) || 0)}
            />
            <Input
              label="Interest Rate (%)"
              type="number"
              step="0.1"
              placeholder="0"
              value={form.interest_rate || ""}
              onChange={(e) => handleChange("interest_rate", parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={form.start_date}
              onChange={(e) => handleChange("start_date", e.target.value)}
            />
            <Input
              label="End Date"
              type="date"
              value={form.end_date ?? ""}
              onChange={(e) => handleChange("end_date", e.target.value)}
            />
          </div>

          <Input
            label="Next Due Date"
            type="date"
            value={form.next_due_date ?? ""}
            onChange={(e) => handleChange("next_due_date", e.target.value)}
          />

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
            disabled={!form.name || form.original_amount <= 0}
            onClick={() => onSave(form)}
          >
            {isEdit ? "Save Changes" : "Add Liability"}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────
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
      const [listRes, summaryRes] = await Promise.all([
        fetch(`/api/liabilities${activeCategory !== "all" ? `?category=${activeCategory}` : ""}`),
        fetch("/api/liabilities?summary=true"),
      ]);

      if (!listRes.ok || !summaryRes.ok) {
        const errData = await listRes.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to load liabilities");
      }

      const [listData, summaryData] = await Promise.all([
        listRes.json(),
        summaryRes.json(),
      ]);

      setLiabilities(Array.isArray(listData) ? listData : []);
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

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save");
      }

      setModalLiability(null);
      fetchData();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
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

  const statCards = [
    {
      label: "Total Debt",
      value: summary ? formatCurrency(summary.totalDebt) : "—",
      icon: TrendingDown,
      color: "#EF4444",
    },
    {
      label: "Monthly Obligation",
      value: summary ? formatCurrency(summary.totalMonthlyObligation) : "—",
      icon: IndianRupee,
      color: "#F59E0B",
    },
    {
      label: "Avg. Interest Rate",
      value: summary ? `${summary.weightedAvgRate}%` : "—",
      icon: Percent,
      color: "#8B5CF6",
    },
    {
      label: "Active Liabilities",
      value: summary ? String(summary.liabilityCount) : "—",
      icon: BarChart3,
      color: "#3B82F6",
    },
  ];

  return (
    <PageWrapper title="Liabilities" subtitle="Manage and reduce your debt obligations">
      {/* ── Stat Cards ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : statCards.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
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

      {/* ── Debt Breakdown Chart ───────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="p-6 mb-8">
          <h3 className="text-sm font-semibold text-white mb-4">Debt Breakdown by Category</h3>
          {loading ? (
            <div className="h-48 flex items-center justify-center">
              <RefreshCw className="w-6 h-6 text-[#64748B] animate-spin" />
            </div>
          ) : summary && summary.categoryBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={summary.categoryBreakdown} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" tickFormatter={(v) => formatCurrency(v)} tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="label" tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} width={110} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #374151", borderRadius: "12px", color: "#fff", fontSize: "12px" }}
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={20}>
                  {summary.categoryBreakdown.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-[#64748B] text-sm">
              No liabilities to display
            </div>
          )}
        </Card>
      </motion.div>

      {/* ── Category Filter + Add Button ────────────────── */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeCategory === "all"
                ? "bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20"
                : "text-[#64748B] hover:text-white border border-transparent"
            }`}
          >
            All
          </button>
          {LIABILITY_CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                activeCategory === c
                  ? "bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20"
                  : "text-[#64748B] hover:text-white border border-transparent"
              }`}
            >
              {LIABILITY_CATEGORY_LABELS[c]}
            </button>
          ))}
        </div>
        <Button size="sm" onClick={() => setModalLiability("new")}>
          <Plus className="w-4 h-4" /> Add Liability
        </Button>
      </div>

      {/* ── Liability List ─────────────────────────────── */}
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
      ) : liabilities.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card className="p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#F59E0B]/10 flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-[#F59E0B]" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">No liabilities yet</h3>
            <p className="text-sm text-[#64748B] mb-4 max-w-sm mx-auto">
              Start tracking your loans, credit cards, and other debts.
            </p>
            <Button onClick={() => setModalLiability("new")}>
              <Plus className="w-4 h-4" /> Add Your First Liability
            </Button>
          </Card>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {liabilities.map((liability, i) => {
            const Icon = CATEGORY_ICONS[liability.category] ?? AlertTriangle;
            const color = LIABILITY_CATEGORY_COLORS[liability.category] ?? "#64748B";
            const paidPercent = liability.original_amount > 0
              ? Math.round(((liability.original_amount - liability.outstanding_balance) / liability.original_amount) * 100)
              : 0;

            return (
              <motion.div key={liability.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Card hover className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${color}15` }}>
                        <Icon className="w-5 h-5" style={{ color }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-semibold text-white truncate">{liability.name}</h4>
                        <p className="text-xs text-[#64748B] mt-0.5">
                          {LIABILITY_CATEGORY_LABELS[liability.category]}
                          {liability.lender && ` · ${liability.lender}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 ml-2">
                      <button
                        onClick={() => setModalLiability(liability)}
                        className="p-1.5 rounded-lg text-[#64748B] hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(liability.id)}
                        disabled={deletingId === liability.id}
                        className="p-1.5 rounded-lg text-[#64748B] hover:text-red-400 hover:bg-red-500/5 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <div>
                      <p className="text-xs text-[#64748B] mb-0.5">Outstanding</p>
                      <p className="text-sm font-bold text-white">{formatCurrency(liability.outstanding_balance)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#64748B] mb-0.5">Monthly EMI</p>
                      <p className="text-sm font-semibold text-[#F59E0B]">{formatCurrency(liability.monthly_emi)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#64748B] mb-0.5">Interest</p>
                      <p className="text-sm font-semibold text-white">{liability.interest_rate}%</p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-[#64748B]">Repayment Progress</span>
                      <span className="text-xs font-medium text-[#10B981]">{paidPercent}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[#1F2937] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${paidPercent}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full rounded-full bg-[#10B981]"
                      />
                    </div>
                  </div>

                  {liability.next_due_date && (
                    <div className="mt-3 pt-3 border-t border-[#1F2937]">
                      <p className="text-xs text-[#64748B]">
                        Next due: <span className="text-white">{new Date(liability.next_due_date).toLocaleDateString("en-IN")}</span>
                      </p>
                    </div>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── Modal ─────────────────────────────────────── */}
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
