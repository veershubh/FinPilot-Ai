"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/Button";
import { CommitmentCard } from "@/components/commitments/CommitmentCard";
import { CommitmentFilters } from "@/components/commitments/CommitmentFilters";
import { CommitmentsSummaryCards } from "@/components/commitments/CommitmentsSummaryCards";
import AddCommitmentFlow from "@/components/commitments/AddCommitmentFlow";
import RecordPaymentModal from "@/components/commitments/RecordPaymentModal";
import {
  useCommitments,
  useCommitmentsSummary,
  deleteCommitmentAPI,
} from "@/hooks/useCommitments";
import type { Commitment } from "@/types/commitments";
import { Plus, TrendingUp, Search } from "lucide-react";

export default function CommitmentsPage() {
  // ── State ─────────────────────────────────────────────────────────────────
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("due_date");
  const [showAddFlow, setShowAddFlow] = useState(false);
  const [paymentTarget, setPaymentTarget] = useState<Commitment | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // ── Filters for API ───────────────────────────────────────────────────────
  const filters = {
    status: selectedStatus !== "all" ? [selectedStatus] : undefined,
    category: selectedCategory !== "all" ? [selectedCategory] : undefined,
  };

  // ── Data fetching ─────────────────────────────────────────────────────────
  const { commitments, loading, error, refresh } = useCommitments(filters);
  const { summary, loading: summaryLoading, refresh: refreshSummary } = useCommitmentsSummary();

  // ── Local sort + search ───────────────────────────────────────────────────
  const sortedCommitments = React.useMemo(() => {
    let items = [...commitments];

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          (c.provider && c.provider.toLowerCase().includes(q)) ||
          c.category.toLowerCase().includes(q)
      );
    }

    // Sort
    switch (sortBy) {
      case "amount":
        items.sort((a, b) => b.monthly_amount - a.monthly_amount);
        break;
      case "progress":
        items.sort((a, b) => b.progress_percentage - a.progress_percentage);
        break;
      case "created":
        items.sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
        );
        break;
      case "due_date":
      default:
        items.sort((a, b) => {
          if (!a.next_due_date) return 1;
          if (!b.next_due_date) return -1;
          return (
            new Date(a.next_due_date).getTime() -
            new Date(b.next_due_date).getTime()
          );
        });
    }

    return items;
  }, [commitments, searchQuery, sortBy]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleRefreshAll = useCallback(() => {
    refresh();
    refreshSummary();
  }, [refresh, refreshSummary]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this commitment?")) return;
    try {
      await deleteCommitmentAPI(id);
      handleRefreshAll();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleRecordPayment = (id: string) => {
    const commitment = commitments.find((c) => c.id === id);
    if (commitment) setPaymentTarget(commitment);
  };

  const handleEdit = (id: string) => {
    // TODO: open edit modal or navigate to detail page
    window.location.href = `/commitments/${id}`;
  };

  return (
    <PageWrapper
      title="Commitments"
      subtitle="Track and manage all your financial obligations"
    >
      {/* Summary Cards */}
      <CommitmentsSummaryCards summary={summary} loading={summaryLoading} />

      {/* Toolbar: Search + Add Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
          <input
            type="text"
            placeholder="Search commitments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#1F2937] bg-[#0F172A] text-sm text-white placeholder-[#64748B] focus:outline-none focus:border-[#10B981]/50 focus:ring-1 focus:ring-[#10B981]/20 transition-all"
          />
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowAddFlow(true)}
        >
          <Plus className="w-4 h-4" />
          Add Commitment
        </Button>
      </div>

      {/* Filters */}
      <CommitmentFilters
        selectedStatus={selectedStatus}
        selectedCategory={selectedCategory}
        sortBy={sortBy}
        onStatusChange={setSelectedStatus}
        onCategoryChange={setSelectedCategory}
        onSortChange={setSortBy}
      />

      {/* Commitment Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-64 rounded-2xl bg-[#111827] border border-[#1F2937] animate-pulse"
            />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <p className="text-red-400 mb-2">Failed to load commitments</p>
          <Button variant="ghost" size="sm" onClick={() => refresh()}>
            Retry
          </Button>
        </div>
      ) : sortedCommitments.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16"
        >
          <div className="w-20 h-20 rounded-3xl bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center mx-auto mb-6">
            <TrendingUp className="w-10 h-10 text-[#10B981]" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            No Commitments Yet
          </h2>
          <p className="text-sm text-[#94A3B8] max-w-md mx-auto mb-6">
            Add your first financial commitment — EMIs, loans, subscriptions, or
            recurring expenses — and let FinPilot AI analyze the impact on your
            financial health.
          </p>
          <Button
            variant="primary"
            size="md"
            onClick={() => setShowAddFlow(true)}
          >
            <Plus className="w-4 h-4" />
            Add Your First Commitment
          </Button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {sortedCommitments.map((commitment) => (
            <CommitmentCard
              key={commitment.id}
              commitment={commitment}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onRecordPayment={handleRecordPayment}
            />
          ))}
        </motion.div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showAddFlow && (
          <AddCommitmentFlow
            onClose={() => setShowAddFlow(false)}
            onSuccess={handleRefreshAll}
          />
        )}
        {paymentTarget && (
          <RecordPaymentModal
            commitment={paymentTarget}
            onClose={() => setPaymentTarget(null)}
            onSuccess={handleRefreshAll}
          />
        )}
      </AnimatePresence>
    </PageWrapper>
  );
}
