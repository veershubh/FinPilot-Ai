"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { prepayCommitmentAPI } from "@/hooks/useCommitments";
import type { Commitment } from "@/types/commitments";
import {
  X,
  CheckCircle2,
  TrendingDown,
  Calculator,
  Calendar,
  Banknote,
  Sparkles,
} from "lucide-react";

interface PrepaymentModalProps {
  commitment: Commitment;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function PrepaymentModal({
  commitment,
  onClose,
  onSuccess,
}: PrepaymentModalProps) {
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const monthlyRate = (commitment.interest_rate ?? 0) / 100 / 12;

  // Live preview calculations
  const preview = useMemo(() => {
    if (!amount || amount <= 0 || amount > commitment.outstanding_balance) {
      return null;
    }

    const newOutstanding = Math.max(0, commitment.outstanding_balance - amount);
    const remainingMonths = commitment.months_remaining ?? 0;

    let interestSaved = 0;
    if (monthlyRate > 0 && remainingMonths > 0) {
      interestSaved = Math.round(amount * monthlyRate * remainingMonths);
    }

    let newTenure = remainingMonths;
    let monthsReduced = 0;
    if (commitment.monthly_amount > 0 && newOutstanding > 0) {
      if (monthlyRate > 0) {
        const ratio =
          1 - (newOutstanding * monthlyRate) / commitment.monthly_amount;
        if (ratio > 0) {
          newTenure = Math.ceil(
            -Math.log(ratio) / Math.log(1 + monthlyRate)
          );
        } else {
          newTenure = Math.ceil(newOutstanding / commitment.monthly_amount);
        }
      } else {
        newTenure = Math.ceil(newOutstanding / commitment.monthly_amount);
      }
      monthsReduced = Math.max(0, remainingMonths - newTenure);
    } else if (newOutstanding <= 0) {
      newTenure = 0;
      monthsReduced = remainingMonths;
    }

    const closureDate = new Date();
    closureDate.setMonth(closureDate.getMonth() + newTenure);

    return {
      newOutstanding,
      interestSaved,
      monthsReduced,
      newTenure,
      closureDate: closureDate.toLocaleDateString("en-IN", {
        month: "short",
        year: "numeric",
      }),
      isFullPayoff: newOutstanding <= 0,
    };
  }, [amount, commitment, monthlyRate]);

  const handleSubmit = async () => {
    if (!amount || amount <= 0) {
      setError("Enter a valid amount");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await prepayCommitmentAPI(commitment.id, amount);
      setResult(res.summary);
    } catch (err: any) {
      setError(err.message || "Prepayment failed");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (n: number) =>
    `₹${n.toLocaleString("en-IN")}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-lg"
      >
        <Card className="p-0 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#1F2937]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-[#8B5CF6]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Reduce Loan</h2>
                <p className="text-xs text-[#64748B]">{commitment.title}</p>
              </div>
            </div>
            <button
              onClick={result ? () => { onSuccess?.(); onClose(); } : onClose}
              className="p-2 rounded-lg text-[#64748B] hover:text-white hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              {result ? (
                /* ── Success State ── */
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-5"
                >
                  <div className="flex flex-col items-center py-4">
                    <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-4">
                      <CheckCircle2 className="w-8 h-8 text-green-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {result.statusChanged && result.newStatus === "completed"
                        ? "🎉 Loan Closed Early!"
                        : "Prepayment Recorded!"}
                    </h3>
                    <p className="text-sm text-[#64748B] text-center">
                      {formatCurrency(result.amount)} principal reduction applied
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-[#0F172A] border border-[#1F2937] text-center">
                      <p className="text-xs text-[#64748B]">Interest Saved</p>
                      <p className="text-lg font-bold text-green-400">
                        {formatCurrency(result.interestSaved)}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-[#0F172A] border border-[#1F2937] text-center">
                      <p className="text-xs text-[#64748B]">Months Reduced</p>
                      <p className="text-lg font-bold text-[#8B5CF6]">
                        {result.monthsReduced}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-[#0F172A] border border-[#1F2937] text-center">
                      <p className="text-xs text-[#64748B]">New Balance</p>
                      <p className="text-lg font-bold text-white">
                        {formatCurrency(result.newOutstanding)}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-[#0F172A] border border-[#1F2937] text-center">
                      <p className="text-xs text-[#64748B]">New Tenure</p>
                      <p className="text-lg font-bold text-white">
                        {result.newTenureMonths} mo
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full"
                    onClick={() => { onSuccess?.(); onClose(); }}
                  >
                    Done
                  </Button>
                </motion.div>
              ) : (
                /* ── Form State ── */
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-5"
                >
                  {/* Current Loan Summary */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-[#0F172A] border border-[#1F2937] text-center">
                      <p className="text-xs text-[#64748B]">Outstanding</p>
                      <p className="text-sm font-bold text-white">
                        {formatCurrency(commitment.outstanding_balance)}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-[#0F172A] border border-[#1F2937] text-center">
                      <p className="text-xs text-[#64748B]">Monthly EMI</p>
                      <p className="text-sm font-bold text-white">
                        {formatCurrency(commitment.monthly_amount)}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-[#0F172A] border border-[#1F2937] text-center">
                      <p className="text-xs text-[#64748B]">Remaining</p>
                      <p className="text-sm font-bold text-white">
                        {commitment.months_remaining} mo
                      </p>
                    </div>
                  </div>

                  {/* Amount Input */}
                  <Input
                    label="Extra Payment Amount (₹)"
                    type="number"
                    value={amount || ""}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    placeholder="e.g. 50000"
                    icon={<Banknote className="w-4 h-4" />}
                  />

                  {/* Quick amount buttons */}
                  <div className="flex gap-2">
                    {[
                      { label: "1 EMI", value: commitment.monthly_amount },
                      { label: "3 EMI", value: commitment.monthly_amount * 3 },
                      { label: "6 EMI", value: commitment.monthly_amount * 6 },
                      { label: "25%", value: Math.round(commitment.outstanding_balance * 0.25) },
                    ]
                      .filter((q) => q.value <= commitment.outstanding_balance && q.value > 0)
                      .map((q) => (
                        <button
                          key={q.label}
                          type="button"
                          onClick={() => setAmount(q.value)}
                          className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                            amount === q.value
                              ? "border-[#8B5CF6]/50 bg-[#8B5CF6]/10 text-[#8B5CF6]"
                              : "border-[#1F2937] bg-[#0F172A] text-[#64748B] hover:border-[#374151] hover:text-white"
                          }`}
                        >
                          {q.label}
                        </button>
                      ))}
                  </div>

                  {/* Live Preview */}
                  {preview && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-xl bg-gradient-to-br from-[#8B5CF6]/5 to-[#10B981]/5 border border-[#8B5CF6]/20"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
                        <p className="text-sm font-semibold text-white">
                          Impact Preview
                        </p>
                      </div>

                      {preview.isFullPayoff ? (
                        <p className="text-sm text-green-400 font-medium">
                          🎉 This will fully close your loan! You save{" "}
                          {formatCurrency(preview.interestSaved)} in interest.
                        </p>
                      ) : (
                        <p className="text-sm text-[#E5E7EB]">
                          You save{" "}
                          <span className="font-bold text-green-400">
                            {formatCurrency(preview.interestSaved)}
                          </span>{" "}
                          interest and finish{" "}
                          <span className="font-bold text-[#8B5CF6]">
                            {preview.monthsReduced} month
                            {preview.monthsReduced !== 1 ? "s" : ""}
                          </span>{" "}
                          earlier. New closure:{" "}
                          <span className="font-medium text-white">
                            {preview.closureDate}
                          </span>
                        </p>
                      )}
                    </motion.div>
                  )}

                  {amount > commitment.outstanding_balance && (
                    <p className="text-sm text-red-400">
                      Amount exceeds outstanding balance (
                      {formatCurrency(commitment.outstanding_balance)})
                    </p>
                  )}

                  {error && <p className="text-sm text-red-400">{error}</p>}

                  <div className="flex justify-end gap-3 pt-2">
                    <Button variant="ghost" size="sm" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleSubmit}
                      loading={loading}
                      disabled={
                        !amount ||
                        amount <= 0 ||
                        amount > commitment.outstanding_balance
                      }
                    >
                      <Calculator className="w-4 h-4" />
                      Confirm Prepayment
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
