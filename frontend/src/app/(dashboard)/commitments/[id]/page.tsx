"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useCommitmentDetail } from "@/hooks/useCommitments";
import RecordPaymentModal from "@/components/commitments/RecordPaymentModal";
import PrepaymentModal from "@/components/commitments/PrepaymentModal";
import { LOAN_CATEGORIES } from "@/types/commitments";
import type { CommitmentCategory } from "@/types/commitments";
import {
  ArrowLeft,
  Banknote,
  Calendar,
  TrendingUp,
  TrendingDown,
  Clock,
  CreditCard,
  FileText,
  Loader2,
} from "lucide-react";

const statusStyles: Record<string, string> = {
  upcoming: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  active: "bg-green-500/20 text-green-400 border-green-500/30",
  due_soon: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  overdue: "bg-red-500/20 text-red-400 border-red-500/30",
  paused: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  completed: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  closed_early: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  refinanced: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
};

const statusLabels: Record<string, string> = {
  upcoming: "Upcoming",
  active: "Active",
  due_soon: "Due Soon",
  overdue: "Overdue",
  paused: "Paused",
  completed: "Completed",
  closed_early: "Closed Early",
  refinanced: "Refinanced",
};

export default function CommitmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { detail, loading, error, refresh } = useCommitmentDetail(id);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPrepayModal, setShowPrepayModal] = useState(false);

  if (loading) {
    return (
      <PageWrapper title="Loading..." subtitle="">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#10B981] animate-spin" />
        </div>
      </PageWrapper>
    );
  }

  if (error || !detail) {
    return (
      <PageWrapper title="Commitment Not Found" subtitle="">
        <div className="text-center py-16">
          <p className="text-[#94A3B8] mb-4">
            This commitment could not be found or may have been deleted.
          </p>
          <Button variant="ghost" onClick={() => router.push("/commitments")}>
            <ArrowLeft className="w-4 h-4" />
            Back to Commitments
          </Button>
        </div>
      </PageWrapper>
    );
  }

  const { commitment, payments, insights } = detail;
  const isLoan = LOAN_CATEGORIES.includes(commitment.category as CommitmentCategory);
  const isActive = commitment.status !== "completed" && commitment.status !== "closed_early";

  // Calculate total prepayments from payment history (payment_mode === 'prepayment')
  const prepayments = payments.filter((p) => p.payment_mode === "prepayment");
  const totalPrepaid = prepayments.reduce((sum, p) => sum + p.amount, 0);

  const formatDate = (d: string | null) =>
    d
      ? new Date(d).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "—";

  const formatCurrency = (n: number) => `₹${n.toLocaleString("en-IN")}`;

  return (
    <PageWrapper
      title={commitment.title}
      subtitle={
        commitment.provider
          ? `${commitment.provider} · ${commitment.category.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}`
          : commitment.category.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
      }
    >
      {/* Back Button */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/commitments")}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Commitments
        </Button>
      </div>

      {/* Status + Actions Row */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <Badge
          className={`${statusStyles[commitment.status] ?? statusStyles.active} border px-3 py-1`}
        >
          {statusLabels[commitment.status] ?? commitment.status}
        </Badge>
        {isActive && (
          <div className="flex gap-2">
            {isLoan && commitment.outstanding_balance > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPrepayModal(true)}
                className="border border-[#8B5CF6]/20 text-[#8B5CF6] hover:bg-[#8B5CF6]/10"
              >
                <TrendingDown className="w-4 h-4" />
                Reduce Loan
              </Button>
            )}
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowPaymentModal(true)}
            >
              <Banknote className="w-4 h-4" />
              Record Payment
            </Button>
          </div>
        )}
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Original Amount",
            value: formatCurrency(commitment.original_amount),
            icon: Banknote,
            color: "#3B82F6",
          },
          {
            label: "Outstanding",
            value: formatCurrency(commitment.outstanding_balance),
            icon: TrendingUp,
            color: "#F59E0B",
          },
          {
            label: "Monthly EMI",
            value: formatCurrency(commitment.monthly_amount),
            icon: CreditCard,
            color: "#10B981",
          },
          {
            label: "Interest Rate",
            value: `${commitment.interest_rate}%`,
            icon: FileText,
            color: "#8B5CF6",
          },
        ].map((metric, i) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Card className="p-5">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ backgroundColor: `${metric.color}15` }}
                >
                  <Icon className="w-5 h-5" style={{ color: metric.color }} />
                </div>
                <p className="text-xl font-bold text-white">{metric.value}</p>
                <p className="text-xs text-[#64748B] mt-0.5">{metric.label}</p>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Loan Summary (for loan categories with prepayments) */}
      {isLoan && totalPrepaid > 0 && (
        <Card className="p-6 mb-8 border-[#8B5CF6]/20 bg-gradient-to-br from-[#8B5CF6]/5 to-transparent">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="w-5 h-5 text-[#8B5CF6]" />
            <h3 className="text-sm font-semibold text-white">Loan Prepayment Summary</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-[#64748B]">Original Loan</p>
              <p className="text-lg font-bold text-white">{formatCurrency(commitment.original_amount)}</p>
            </div>
            <div>
              <p className="text-xs text-[#64748B]">Current Balance</p>
              <p className="text-lg font-bold text-[#F59E0B]">{formatCurrency(commitment.outstanding_balance)}</p>
            </div>
            <div>
              <p className="text-xs text-[#64748B]">Total Prepayments</p>
              <p className="text-lg font-bold text-[#8B5CF6]">{formatCurrency(totalPrepaid)}</p>
            </div>
            <div>
              <p className="text-xs text-[#64748B]">Remaining Tenure</p>
              <p className="text-lg font-bold text-white">{commitment.months_remaining} months</p>
            </div>
          </div>
        </Card>
      )}

      {/* Progress + Timeline Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Progress Card */}
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Progress</h3>
          <div className="flex items-end gap-4 mb-4">
            <p className="text-4xl font-bold text-white">
              {commitment.progress_percentage}%
            </p>
            <p className="text-sm text-[#64748B] pb-1">complete</p>
          </div>
          <div className="h-3 bg-[#1F2937] rounded-full overflow-hidden mb-4">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${commitment.progress_percentage}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-[#10B981] to-[#3B82F6] rounded-full"
            />
          </div>
          <div className="flex justify-between text-sm text-[#64748B]">
            <span>{commitment.months_completed} months paid</span>
            <span>{commitment.months_remaining} months left</span>
          </div>
        </Card>

        {/* Timeline Card */}
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Timeline</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-[#64748B]" />
              <div>
                <p className="text-xs text-[#64748B]">Start Date</p>
                <p className="text-sm font-medium text-white">
                  {formatDate(commitment.start_date)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-[#64748B]" />
              <div>
                <p className="text-xs text-[#64748B]">End Date</p>
                <p className="text-sm font-medium text-white">
                  {formatDate(commitment.end_date ?? null)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-[#F59E0B]" />
              <div>
                <p className="text-xs text-[#64748B]">Next Due</p>
                <p className="text-sm font-medium text-white">
                  {formatDate(commitment.next_due_date ?? null)}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Payment History */}
      <Card className="p-6 mb-8">
        <h3 className="text-sm font-semibold text-white mb-4">
          Payment History ({payments.length})
        </h3>
        {payments.length === 0 ? (
          <p className="text-sm text-[#64748B] py-4 text-center">
            No payments recorded yet.
          </p>
        ) : (
          <div className="space-y-3">
            {payments.map((payment, i) => {
              const isPrepay = payment.payment_mode === "prepayment";
              return (
                <motion.div
                  key={payment.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex items-center justify-between p-3 rounded-xl border ${
                    isPrepay
                      ? "bg-[#8B5CF6]/5 border-[#8B5CF6]/20"
                      : "bg-[#0F172A] border-[#1F2937]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isPrepay ? "bg-[#8B5CF6]/10" : "bg-[#10B981]/10"
                      }`}
                    >
                      {isPrepay ? (
                        <TrendingDown className="w-4 h-4 text-[#8B5CF6]" />
                      ) : (
                        <Banknote className="w-4 h-4 text-[#10B981]" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {formatCurrency(payment.amount)}
                        {isPrepay && (
                          <span className="ml-2 text-xs text-[#8B5CF6]">
                            Prepayment
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-[#64748B]">
                        {payment.payment_mode ?? "—"}{" "}
                        {payment.notes ? `· ${payment.notes}` : ""}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-[#64748B]">
                    {formatDate(payment.paid_date)}
                  </p>
                </motion.div>
              );
            })}
          </div>
        )}
      </Card>

      {/* AI Insights */}
      {insights.length > 0 && (
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-white mb-4">
            AI Insights ({insights.length})
          </h3>
          <div className="space-y-3">
            {insights.map((insight) => (
              <div
                key={insight.id}
                className="p-4 rounded-xl bg-[#0F172A] border border-[#1F2937]"
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  {insight.affordability_score != null && (
                    <div>
                      <p className="text-xs text-[#64748B]">Affordability</p>
                      <p className="text-lg font-bold text-white">
                        {insight.affordability_score}
                      </p>
                    </div>
                  )}
                  {insight.risk_score != null && (
                    <div>
                      <p className="text-xs text-[#64748B]">Risk</p>
                      <p className="text-lg font-bold text-white">
                        {insight.risk_score}
                      </p>
                    </div>
                  )}
                  {insight.health_score_impact != null && (
                    <div>
                      <p className="text-xs text-[#64748B]">Health Impact</p>
                      <p
                        className={`text-lg font-bold ${
                          insight.health_score_impact >= 0
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {insight.health_score_impact >= 0 ? "+" : ""}
                        {insight.health_score_impact}
                      </p>
                    </div>
                  )}
                  {insight.projected_health_score != null && (
                    <div>
                      <p className="text-xs text-[#64748B]">Projected Score</p>
                      <p className="text-lg font-bold text-white">
                        {insight.projected_health_score}
                      </p>
                    </div>
                  )}
                </div>
                {insight.recommendation && (
                  <p className="text-sm text-[#94A3B8] leading-relaxed">
                    {insight.recommendation}
                  </p>
                )}
                <p className="text-xs text-[#475569] mt-2">
                  Generated {formatDate(insight.generated_at)}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showPaymentModal && (
          <RecordPaymentModal
            commitment={commitment}
            onClose={() => setShowPaymentModal(false)}
            onSuccess={refresh}
          />
        )}
        {showPrepayModal && (
          <PrepaymentModal
            commitment={commitment}
            onClose={() => setShowPrepayModal(false)}
            onSuccess={refresh}
          />
        )}
      </AnimatePresence>
    </PageWrapper>
  );
}
