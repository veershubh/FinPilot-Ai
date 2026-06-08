"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { recordPaymentAPI } from "@/hooks/useCommitments";
import type { Commitment } from "@/types/commitments";
import { X, CheckCircle2, Banknote, CreditCard, Wallet, Smartphone } from "lucide-react";

interface RecordPaymentModalProps {
  commitment: Commitment;
  onClose: () => void;
  onSuccess?: () => void;
}

const paymentModes = [
  { value: "upi", label: "UPI", icon: Smartphone },
  { value: "bank_transfer", label: "Bank Transfer", icon: Banknote },
  { value: "card", label: "Card", icon: CreditCard },
  { value: "cash", label: "Cash", icon: Wallet },
];

export default function RecordPaymentModal({
  commitment,
  onClose,
  onSuccess,
}: RecordPaymentModalProps) {
  const [amount, setAmount] = useState(commitment.monthly_amount);
  const [paymentMode, setPaymentMode] = useState("upi");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (amount <= 0) {
      setError("Amount must be greater than 0");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await recordPaymentAPI(commitment.id, {
        amount,
        payment_mode: paymentMode,
        notes: notes || undefined,
      });
      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to record payment");
    } finally {
      setLoading(false);
    }
  };

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
        className="w-full max-w-md"
      >
        <Card className="p-0 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#1F2937]">
            <div>
              <h2 className="text-lg font-bold text-white">Record Payment</h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                {commitment.title}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-[#64748B] hover:text-white hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-5">
            <AnimatePresence mode="wait">
              {success ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center py-8"
                >
                  <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-1">
                    Payment Recorded!
                  </h3>
                  <p className="text-sm text-[#64748B]">
                    ₹{amount.toLocaleString("en-IN")} paid via{" "}
                    {paymentModes.find((m) => m.value === paymentMode)?.label}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-5"
                >
                  {/* Outstanding info */}
                  <div className="flex justify-between items-center p-3 rounded-xl bg-[#0F172A] border border-[#1F2937]">
                    <div>
                      <p className="text-xs text-[#64748B]">Outstanding</p>
                      <p className="text-lg font-bold text-white">
                        ₹
                        {commitment.outstanding_balance.toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[#64748B]">Progress</p>
                      <p className="text-lg font-bold text-[#10B981]">
                        {commitment.progress_percentage}%
                      </p>
                    </div>
                  </div>

                  {/* Amount */}
                  <Input
                    label="Payment Amount (₹)"
                    type="number"
                    value={amount || ""}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    placeholder="Enter amount"
                    icon={<Banknote className="w-4 h-4" />}
                  />

                  {/* Payment Mode */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white">
                      Payment Mode
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {paymentModes.map((mode) => {
                        const Icon = mode.icon;
                        const isSelected = paymentMode === mode.value;
                        return (
                          <button
                            key={mode.value}
                            type="button"
                            onClick={() => setPaymentMode(mode.value)}
                            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-all ${
                              isSelected
                                ? "border-[#10B981]/50 bg-[#10B981]/10 text-[#10B981]"
                                : "border-[#1F2937] bg-[#0F172A] text-[#64748B] hover:border-[#374151] hover:text-white"
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                            {mode.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Notes */}
                  <Input
                    label="Notes (optional)"
                    name="notes"
                    placeholder="e.g. March EMI"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />

                  {error && (
                    <p className="text-sm text-red-400">{error}</p>
                  )}

                  <div className="flex justify-end gap-3 pt-2">
                    <Button variant="ghost" size="sm" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleSubmit}
                      loading={loading}
                      disabled={amount <= 0}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Record ₹{amount.toLocaleString("en-IN")}
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
