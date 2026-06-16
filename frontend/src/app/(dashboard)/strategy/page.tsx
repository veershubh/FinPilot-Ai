"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Target, Shield, Zap, Calculator, Plus, X, Pencil, Trash2,
  RefreshCw, ChevronDown, TrendingUp, CheckCircle2, PauseCircle,
  Clock, Flame, ArrowUpRight, PiggyBank,
} from "lucide-react";
import type {
  FinancialGoal, GoalInsert, GoalCategory, GoalPriority, StrategySummary,
} from "@/types/strategy";
import {
  GOAL_CATEGORIES, GOAL_CATEGORY_LABELS, GOAL_CATEGORY_COLORS,
  GOAL_PRIORITIES, GOAL_PRIORITY_COLORS,
} from "@/types/strategy";

const CATEGORY_ICONS: Record<GoalCategory, any> = {
  retirement: Shield,
  emergency_fund: Flame,
  debt_payoff: TrendingUp,
  investment: Zap,
  savings: PiggyBank,
  education: Calculator,
  home: Target,
  other: Target,
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

// ─── Goal Modal ──────────────────────────────────────────────────
function GoalModal({
  goal,
  onClose,
  onSave,
  saving,
}: {
  goal: FinancialGoal | null;
  onClose: () => void;
  onSave: (data: GoalInsert) => void;
  saving: boolean;
}) {
  const isEdit = !!goal;
  const [form, setForm] = useState<GoalInsert>({
    title: goal?.title ?? "",
    category: goal?.category ?? "savings",
    target_amount: goal?.target_amount ?? 0,
    current_amount: goal?.current_amount ?? 0,
    monthly_contribution: goal?.monthly_contribution ?? 0,
    target_date: goal?.target_date ? goal.target_date.split("T")[0] : "",
    priority: goal?.priority ?? "medium",
    notes: goal?.notes ?? "",
  });

  const handleChange = (field: string, value: any) => {
    setForm((p) => ({ ...p, [field]: value }));
  };

  const progress = form.target_amount > 0
    ? Math.min(100, Math.round((form.current_amount! / form.target_amount) * 100))
    : 0;

  const monthsToGoal = form.monthly_contribution && form.monthly_contribution > 0 && form.target_amount > (form.current_amount ?? 0)
    ? Math.ceil((form.target_amount - (form.current_amount ?? 0)) / form.monthly_contribution)
    : null;

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
            {isEdit ? "Edit Goal" : "Create Financial Goal"}
          </h2>
          <button onClick={onClose} className="text-[#64748B] hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <Input
            label="Goal Title"
            placeholder="e.g. Emergency Fund, Retirement Corpus"
            value={form.title}
            onChange={(e) => handleChange("title", e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-white">Category</label>
              <div className="relative">
                <select
                  value={form.category}
                  onChange={(e) => handleChange("category", e.target.value)}
                  className="w-full rounded-xl border border-[#1F2937] bg-[#0F172A] px-4 py-3 text-sm text-white appearance-none cursor-pointer focus:outline-none focus:border-[#10B981]/50"
                >
                  {GOAL_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{GOAL_CATEGORY_LABELS[c]}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-white">Priority</label>
              <div className="relative">
                <select
                  value={form.priority}
                  onChange={(e) => handleChange("priority", e.target.value)}
                  className="w-full rounded-xl border border-[#1F2937] bg-[#0F172A] px-4 py-3 text-sm text-white appearance-none cursor-pointer focus:outline-none focus:border-[#10B981]/50"
                >
                  {GOAL_PRIORITIES.map((p) => (
                    <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Target Amount (₹)"
              type="number"
              placeholder="0"
              value={form.target_amount || ""}
              onChange={(e) => handleChange("target_amount", parseFloat(e.target.value) || 0)}
            />
            <Input
              label="Current Saved (₹)"
              type="number"
              placeholder="0"
              value={form.current_amount || ""}
              onChange={(e) => handleChange("current_amount", parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Monthly Contribution (₹)"
              type="number"
              placeholder="0"
              value={form.monthly_contribution || ""}
              onChange={(e) => handleChange("monthly_contribution", parseFloat(e.target.value) || 0)}
            />
            <Input
              label="Target Date"
              type="date"
              value={form.target_date ?? ""}
              onChange={(e) => handleChange("target_date", e.target.value)}
            />
          </div>

          {/* Live preview */}
          {form.target_amount > 0 && (
            <div className="rounded-xl bg-[#111827] border border-[#1F2937] p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[#64748B]">Progress Preview</span>
                <span className="text-xs font-semibold text-[#10B981]">{progress}%</span>
              </div>
              <div className="h-2 rounded-full bg-[#1F2937] overflow-hidden mb-2">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#10B981] to-[#3B82F6] transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              {monthsToGoal && (
                <p className="text-xs text-[#94A3B8]">
                  At ₹{form.monthly_contribution?.toLocaleString("en-IN")}/mo, you&apos;ll reach your goal in <span className="text-white font-medium">{monthsToGoal} months</span>
                </p>
              )}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-white">Notes</label>
            <textarea
              value={form.notes ?? ""}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Strategy notes, milestones..."
              rows={2}
              className="w-full rounded-xl border border-[#1F2937] bg-[#0F172A] px-4 py-3 text-sm text-white placeholder-[#64748B] focus:outline-none focus:border-[#10B981]/50 resize-none"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[#1F2937] flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            loading={saving}
            disabled={!form.title || form.target_amount <= 0}
            onClick={() => onSave(form)}
          >
            {isEdit ? "Save Changes" : "Create Goal"}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Strategy Recommendations ────────────────────────────────────
function StrategyRecommendations({ summary }: { summary: StrategySummary | null }) {
  if (!summary) return null;

  const tips: { icon: any; title: string; description: string; color: string }[] = [];

  if (summary.activeGoals === 0) {
    tips.push({
      icon: Target,
      title: "Set Your First Goal",
      description: "Define financial milestones to stay focused and motivated. Start with an emergency fund.",
      color: "#3B82F6",
    });
  }

  if (summary.avgProgress < 25 && summary.activeGoals > 0) {
    tips.push({
      icon: Zap,
      title: "Boost Your Savings Rate",
      description: "Your average goal progress is below 25%. Consider automating monthly transfers.",
      color: "#F59E0B",
    });
  }

  if (summary.totalMonthlyContribution > 0 && summary.activeGoals > 3) {
    tips.push({
      icon: Target,
      title: "Focus Your Goals",
      description: "You have multiple active goals. Prioritize 2-3 key goals for faster progress.",
      color: "#8B5CF6",
    });
  }

  if (summary.completedGoals > 0) {
    tips.push({
      icon: CheckCircle2,
      title: "Great Progress!",
      description: `You've completed ${summary.completedGoals} goal${summary.completedGoals > 1 ? 's' : ''}. Keep the momentum going!`,
      color: "#10B981",
    });
  }

  // Always show a generic tip
  tips.push({
    icon: Shield,
    title: "Emergency Fund Rule",
    description: "Aim for 6 months of expenses in your emergency fund before aggressive investing.",
    color: "#14B8A6",
  });

  return (
    <Card className="p-6 mb-8">
      <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
        <Zap className="w-4 h-4 text-[#F59E0B]" /> Strategy Recommendations
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {tips.slice(0, 3).map((tip, i) => {
          const Icon = tip.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-xl bg-[#0F172A] border border-[#1F2937] p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${tip.color}15` }}>
                  <Icon className="w-3.5 h-3.5" style={{ color: tip.color }} />
                </div>
                <h4 className="text-xs font-semibold text-white">{tip.title}</h4>
              </div>
              <p className="text-xs text-[#94A3B8] leading-relaxed">{tip.description}</p>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}

// ─── Main Page ───────────────────────────────────────────────────
export default function StrategyPage() {
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [summary, setSummary] = useState<StrategySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalGoal, setModalGoal] = useState<FinancialGoal | null | "new">(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [listRes, summaryRes] = await Promise.all([
        fetch("/api/strategy"),
        fetch("/api/strategy?summary=true"),
      ]);

      if (!listRes.ok || !summaryRes.ok) {
        const errData = await listRes.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to load goals");
      }

      const [listData, summaryData] = await Promise.all([listRes.json(), summaryRes.json()]);
      setGoals(Array.isArray(listData) ? listData : []);
      setSummary(summaryData);
    } catch (e: any) {
      setError(e.message);
      setGoals([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async (data: GoalInsert) => {
    setSaving(true);
    try {
      const isEdit = modalGoal && modalGoal !== "new";
      const url = isEdit ? `/api/strategy/${(modalGoal as FinancialGoal).id}` : "/api/strategy";
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

      setModalGoal(null);
      fetchData();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this goal permanently?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/strategy/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      fetchData();
    } catch {
      alert("Failed to delete goal");
    } finally {
      setDeletingId(null);
    }
  };

  const statCards = [
    { label: "Active Goals", value: summary ? String(summary.activeGoals) : "—", icon: Target, color: "#8B5CF6" },
    { label: "Total Target", value: summary ? formatCurrency(summary.totalTarget) : "—", icon: ArrowUpRight, color: "#3B82F6" },
    { label: "Total Saved", value: summary ? formatCurrency(summary.totalSaved) : "—", icon: PiggyBank, color: "#10B981" },
    { label: "Avg. Progress", value: summary ? `${summary.avgProgress}%` : "—", icon: TrendingUp, color: "#F59E0B" },
  ];

  return (
    <PageWrapper title="Strategy" subtitle="AI-powered financial planning and goal tracking">
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

      {/* ── Strategy Recommendations ───────────────────── */}
      {!loading && <StrategyRecommendations summary={summary} />}

      {/* ── Header + Add Button ────────────────────────── */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">Your Goals</h3>
        <Button size="sm" onClick={() => setModalGoal("new")}>
          <Plus className="w-4 h-4" /> New Goal
        </Button>
      </div>

      {/* ── Goals List ─────────────────────────────────── */}
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
      ) : goals.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card className="p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#8B5CF6]/10 flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-[#8B5CF6]" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">No financial goals yet</h3>
            <p className="text-sm text-[#64748B] mb-4 max-w-sm mx-auto">
              Set goals for retirement, emergency fund, or debt payoff and track your progress.
            </p>
            <Button onClick={() => setModalGoal("new")}>
              <Plus className="w-4 h-4" /> Create Your First Goal
            </Button>
          </Card>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal, i) => {
            const Icon = CATEGORY_ICONS[goal.category] ?? Target;
            const color = GOAL_CATEGORY_COLORS[goal.category] ?? "#64748B";
            const progress = goal.target_amount > 0
              ? Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100))
              : 0;
            const priorityColor = GOAL_PRIORITY_COLORS[goal.priority];
            const isCompleted = goal.status === "completed";
            const isPaused = goal.status === "paused";

            const monthsToGoal = goal.monthly_contribution > 0 && goal.target_amount > goal.current_amount
              ? Math.ceil((goal.target_amount - goal.current_amount) / goal.monthly_contribution)
              : null;

            return (
              <motion.div key={goal.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Card hover className={`p-5 ${isCompleted ? "border-[#10B981]/30" : ""}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${color}15` }}>
                        <Icon className="w-5 h-5" style={{ color }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-white truncate">{goal.title}</h4>
                          {isCompleted && <CheckCircle2 className="w-4 h-4 text-[#10B981] flex-shrink-0" />}
                          {isPaused && <PauseCircle className="w-4 h-4 text-[#F59E0B] flex-shrink-0" />}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-[#64748B]">{GOAL_CATEGORY_LABELS[goal.category]}</span>
                          <span
                            className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md uppercase"
                            style={{ color: priorityColor, backgroundColor: `${priorityColor}15` }}
                          >
                            {goal.priority}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 ml-2">
                      <button
                        onClick={() => setModalGoal(goal)}
                        className="p-1.5 rounded-lg text-[#64748B] hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(goal.id)}
                        disabled={deletingId === goal.id}
                        className="p-1.5 rounded-lg text-[#64748B] hover:text-red-400 hover:bg-red-500/5 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-bold text-white">{formatCurrency(goal.current_amount)}</span>
                      <span className="text-xs text-[#64748B]">of {formatCurrency(goal.target_amount)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#1F2937] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{
                          background: isCompleted
                            ? "#10B981"
                            : `linear-gradient(90deg, ${color}, ${color}cc)`,
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-xs font-medium" style={{ color }}>{progress}% complete</span>
                      {monthsToGoal && !isCompleted && (
                        <span className="text-xs text-[#94A3B8] flex items-center gap-1">
                          <Clock className="w-3 h-3" /> ~{monthsToGoal}mo left
                        </span>
                      )}
                    </div>
                  </div>

                  {goal.monthly_contribution > 0 && (
                    <div className="mt-3 pt-3 border-t border-[#1F2937]">
                      <p className="text-xs text-[#64748B]">
                        Monthly: <span className="text-white font-medium">{formatCurrency(goal.monthly_contribution)}</span>
                        {goal.target_date && (
                          <> · Deadline: <span className="text-white">{new Date(goal.target_date).toLocaleDateString("en-IN")}</span></>
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

      {/* ── Modal ─────────────────────────────────────── */}
      <AnimatePresence>
        {modalGoal && (
          <GoalModal
            goal={modalGoal === "new" ? null : modalGoal}
            onClose={() => setModalGoal(null)}
            onSave={handleSave}
            saving={saving}
          />
        )}
      </AnimatePresence>
    </PageWrapper>
  );
}
