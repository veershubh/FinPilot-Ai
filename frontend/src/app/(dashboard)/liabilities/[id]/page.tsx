"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  ArrowLeft, Calendar, Landmark, Percent, RefreshCw, Wallet, CreditCard,
  X, Banknote, ChevronDown, Clock
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import type { Liability, LiabilityHistory, LiabilityPayment } from "@/types/liabilities";
import { LIABILITY_CATEGORY_LABELS, LIABILITY_CATEGORY_COLORS } from "@/types/liabilities";
import Link from "next/link";

function formatCurrency(n: number): string {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n.toLocaleString("en-IN")}`;
}

function PaymentModal({
  liabilityId,
  onClose,
  onSuccess,
}: {
  liabilityId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [amount, setAmount] = useState(0);
  const [paymentType, setPaymentType] = useState<string>("emi");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (amount <= 0) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/liabilities/${liabilityId}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, payment_type: paymentType, payment_date: paymentDate, notes: notes || undefined }),
      });
      if (!res.ok) throw new Error("Failed to record payment");
      onSuccess();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
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
        className="bg-[#0F172A] border border-[#1F2937] rounded-2xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1F2937]">
          <h2 className="text-lg font-bold text-white">Make Payment</h2>
          <button onClick={onClose} className="text-[#64748B] hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <Input
            label="Amount (₹)"
            type="number"
            placeholder="0"
            value={amount || ""}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
          />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[#94A3B8]">Payment Type</label>
            <div className="relative">
              <select
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value)}
                className="w-full rounded-xl border border-[#1F2937] bg-[#0B1020] px-4 py-3 text-sm text-white appearance-none cursor-pointer focus:outline-none focus:border-[#10B981]/50"
              >
                <option value="emi">Regular EMI</option>
                <option value="prepayment">Prepayment</option>
                <option value="closure">Full Closure</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] pointer-events-none" />
            </div>
          </div>
          <Input
            label="Payment Date"
            type="date"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
          />
          <Input
            label="Notes (optional)"
            placeholder="e.g. Extra payment from bonus"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        <div className="px-6 py-4 border-t border-[#1F2937] flex justify-end gap-3 bg-[#0B1020]/50">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button loading={saving} disabled={amount <= 0} onClick={handleSubmit}>
            Record Payment
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function LiabilityDetailsPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [liability, setLiability] = useState<Liability | null>(null);
  const [history, setHistory] = useState<LiabilityHistory[]>([]);
  const [payments, setPayments] = useState<LiabilityPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [liabilityRes, historyRes, paymentsRes] = await Promise.all([
        fetch(`/api/liabilities/${id}`),
        fetch(`/api/liabilities/${id}/history`),
        fetch(`/api/liabilities/${id}/payments`),
      ]);

      if (!liabilityRes.ok) throw new Error("Failed to load liability details");
      const data = await liabilityRes.json();
      const historyData = historyRes.ok ? await historyRes.json() : [];
      const paymentsData = paymentsRes.ok ? await paymentsRes.json() : [];

      setLiability(data);
      setHistory(Array.isArray(historyData) ? historyData : []);
      setPayments(Array.isArray(paymentsData) ? paymentsData : []);
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

  const chartData = history.map(h => ({
    date: new Date(h.recorded_date).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
    balance: h.outstanding_balance
  }));

  const progress = liability.original_amount > 0 
    ? Math.max(0, Math.min(100, ((liability.original_amount - liability.outstanding_balance) / liability.original_amount) * 100))
    : 0;

  const paymentTypeLabels: Record<string, string> = { emi: "EMI", prepayment: "Prepayment", closure: "Closure" };
  const paymentTypeColors: Record<string, string> = { emi: "#3B82F6", prepayment: "#10B981", closure: "#8B5CF6" };

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
        <Card variant="elevated" className="lg:col-span-1 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl rounded-bl-full pointer-events-none opacity-40"
               style={{ backgroundImage: `linear-gradient(to bottom left, ${color}20, transparent)` }} />
          
          <div className="relative z-10">
            <p className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-2">Outstanding Balance</p>
            <h2 className="text-4xl font-extrabold text-[#EF4444] tracking-tight mb-2">
              {formatCurrency(liability.outstanding_balance)}
            </h2>

            {liability.status === "active" && (
              <Button
                size="sm"
                onClick={() => setShowPaymentModal(true)}
                className="mt-2 mb-4 !bg-[#10B981] hover:!bg-[#059669] text-white"
              >
                <Banknote className="w-4 h-4" /> Make Payment
              </Button>
            )}

            {liability.original_amount > 0 && (
              <div className="mb-6">
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
            
            <div className="space-y-4 pt-4 border-t border-[#1F2937]">
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
              {liability.next_due_date && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#94A3B8] flex items-center gap-2">
                     <Clock className="w-4 h-4" /> Next Due Date
                  </span>
                  <span className="text-sm font-bold text-[#F59E0B]">{new Date(liability.next_due_date).toLocaleDateString("en-IN")}</span>
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
                      <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={color} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                    <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} minTickGap={30} />
                    <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false}
                      tickFormatter={(val) => `₹${val >= 1000 ? (val/1000).toFixed(0) + 'k' : val}`}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#0B1020", borderColor: "#1F2937", borderRadius: "12px", color: "#fff" }}
                      itemStyle={{ color: "#EF4444", fontWeight: 600 }}
                      labelStyle={{ color: "#94A3B8", marginBottom: "4px" }}
                      formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, "Balance"]}
                    />
                    <Area type="monotone" dataKey="balance" stroke={color} strokeWidth={3} fillOpacity={1} fill="url(#colorBalance)" animationDuration={1500} />
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

      {payments.length > 0 && (
        <Card variant="elevated" className="p-6">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Banknote className="w-4 h-4 text-[#10B981]" /> Payment History
          </h3>
          <div className="space-y-2">
            {payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-3 px-4 rounded-xl border border-[#1F2937] bg-[#0B1020]/50 hover:bg-[#111827] transition-colors">
                <div className="flex items-center gap-3">
                  <span
                    className="text-[10px] font-bold px-2 py-1 rounded-md uppercase"
                    style={{
                      color: paymentTypeColors[p.payment_type] ?? "#64748B",
                      backgroundColor: `${paymentTypeColors[p.payment_type] ?? "#64748B"}15`,
                    }}
                  >
                    {paymentTypeLabels[p.payment_type] ?? p.payment_type}
                  </span>
                  <span className="text-sm text-[#94A3B8]">
                    {new Date(p.payment_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                  {p.notes && <span className="text-xs text-[#64748B]">— {p.notes}</span>}
                </div>
                <span className="text-sm font-bold text-[#10B981]">-{formatCurrency(p.amount)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <AnimatePresence>
        {showPaymentModal && (
          <PaymentModal
            liabilityId={id}
            onClose={() => setShowPaymentModal(false)}
            onSuccess={() => {
              setShowPaymentModal(false);
              fetchData();
            }}
          />
        )}
      </AnimatePresence>
    </PageWrapper>
  );
}
