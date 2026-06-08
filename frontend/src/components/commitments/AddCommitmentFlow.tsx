"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TemplatePicker } from "@/components/commitments/TemplatePicker";
import {
  simulateNewCommitment,
  type SimulationResult,
} from "@/utils/commitment-calculator";
import {
  HEALTH_SCORE_IMPACT,
  type CommitmentTemplate,
  type CommitmentCategory,
} from "@/types/commitments";
import { createCommitmentAPI } from "@/hooks/useCommitments";
import { ArrowLeft, ArrowRight, Loader2, CheckCircle2, X } from "lucide-react";

interface FormData {
  title: string;
  category: CommitmentCategory;
  provider: string;
  description: string;
  original_amount: number;
  monthly_amount: number;
  interest_rate: number;
  start_date: string;
  end_date: string;
}

interface AddCommitmentFlowProps {
  onClose: () => void;
  onSuccess?: () => void;
  initialData?: Partial<FormData>;
}

export default function AddCommitmentFlow({
  onClose,
  onSuccess,
  initialData,
}: AddCommitmentFlowProps) {
  const router = useRouter();
  const hasInitialData = !!initialData;
  const [step, setStep] = useState(hasInitialData ? 2 : 1);
  const [selectedTemplate, setSelectedTemplate] =
    useState<CommitmentTemplate | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: initialData?.title ?? "",
    category: initialData?.category ?? "other",
    provider: initialData?.provider ?? "",
    description: initialData?.description ?? "",
    original_amount: initialData?.original_amount ?? 0,
    monthly_amount: initialData?.monthly_amount ?? 0,
    interest_rate: initialData?.interest_rate ?? 0,
    start_date: initialData?.start_date ?? new Date().toISOString().split("T")[0],
    end_date: initialData?.end_date ?? "",
  });
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1 → Template selection
  const handleTemplateSelect = (template: CommitmentTemplate) => {
    setSelectedTemplate(template);
    setFormData((prev) => ({
      ...prev,
      title: template.label,
      category: template.category,
      interest_rate: template.defaultRate,
    }));
    setStep(2);
  };

  // Step 2 → Form input
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    }));
  };

  // Step 2 → Step 3: Run simulation
  const handleSimulate = async () => {
    setLoading(true);
    setError(null);
    try {
      // Try the real API first (uses actual user financial data)
      const res = await fetch("/api/commitments/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          monthly_amount: formData.monthly_amount,
          original_amount: formData.original_amount,
          category: formData.category,
        }),
      });
      if (res.ok) {
        const result = await res.json();
        setSimulation(result);
      } else {
        // Fallback to local calculation
        const result = simulateNewCommitment(
          { income: 80000, totalExpenses: 15000, totalCommitments: 10000, totalDebt: 50000, savings: 20000 },
          { monthly_amount: formData.monthly_amount, original_amount: formData.original_amount, category: formData.category },
          HEALTH_SCORE_IMPACT
        );
        setSimulation(result);
      }
      setStep(3);
    } catch (err) {
      console.error("Simulation failed:", err);
      setError("Failed to calculate impact. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 3 → Submit
  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      console.log("[AddCommitmentFlow] Submitting commitment:", formData);
      await createCommitmentAPI({
        title: formData.title,
        category: formData.category,
        provider: formData.provider || null,
        description: formData.description || null,
        original_amount: formData.original_amount,
        monthly_amount: formData.monthly_amount,
        interest_rate: formData.interest_rate,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
      });
      console.log("[AddCommitmentFlow] Commitment created successfully");
      toast.success("Commitment created successfully!", {
        description: `"${formData.title}" is now being tracked.`,
      });
      onSuccess?.();
      onClose();
      router.push("/dashboard/commitments");
    } catch (err: any) {
      console.error("[AddCommitmentFlow] Creation failed:", err);
      const msg = err.message || "Failed to create commitment";
      if (msg.toLowerCase().includes("unauthenticated") || msg.includes("401")) {
        setError("Please sign in to save this commitment.");
        toast.error("Authentication required", {
          description: "Please sign in and try again.",
        });
      } else {
        setError(msg);
        toast.error("Failed to create commitment", {
          description: msg,
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const stepTitles = [
    "Choose Template",
    "Financial Details",
    "AI Impact Analysis",
  ];

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
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <Card className="p-0 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#1F2937]">
            <div>
              <h2 className="text-lg font-bold text-white">
                Add New Commitment
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                Step {step} of 3 — {stepTitles[step - 1]}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-[#64748B] hover:text-white hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Step Progress Bar */}
          <div className="px-6 pt-4">
            <div className="flex gap-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                    s <= step
                      ? "bg-gradient-to-r from-[#10B981] to-[#3B82F6]"
                      : "bg-[#1F2937]"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              {/* ── Step 1: Template Picker ── */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.2 }}
                >
                  <TemplatePicker
                    onSelect={handleTemplateSelect}
                    selectedCategory={selectedTemplate?.category}
                  />
                </motion.div>
              )}

              {/* ── Step 2: Financial Details ── */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <Input
                    label="Title"
                    name="title"
                    placeholder="e.g. iPhone 15 EMI"
                    value={formData.title}
                    onChange={handleChange}
                  />

                  <Input
                    label="Provider"
                    name="provider"
                    placeholder="e.g. HDFC Bank"
                    value={formData.provider}
                    onChange={handleChange}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Original Amount (₹)"
                      name="original_amount"
                      type="number"
                      placeholder="100000"
                      value={formData.original_amount || ""}
                      onChange={handleChange}
                    />
                    <Input
                      label="Monthly Amount (₹)"
                      name="monthly_amount"
                      type="number"
                      placeholder="8500"
                      value={formData.monthly_amount || ""}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Interest Rate (%)"
                      name="interest_rate"
                      type="number"
                      placeholder="0"
                      value={formData.interest_rate || ""}
                      onChange={handleChange}
                    />
                    <div />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Start Date"
                      name="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={handleChange}
                    />
                    <Input
                      label="End Date (optional)"
                      name="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={handleChange}
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-red-400 mt-2">{error}</p>
                  )}

                  <div className="flex justify-between pt-4">
                    {!hasInitialData && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setStep(1)}
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                      </Button>
                    )}
                    {hasInitialData && <div />}
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleSimulate}
                      loading={loading}
                      disabled={
                        !formData.title ||
                        !formData.monthly_amount ||
                        !formData.original_amount
                      }
                    >
                      Analyze Impact
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* ── Step 3: AI Impact Analysis ── */}
              {step === 3 && simulation && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5"
                >
                  {/* Score Impact */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 rounded-xl bg-[#0F172A] border border-[#1F2937]">
                      <p className="text-xs text-[#64748B] uppercase tracking-wide mb-1">
                        Current
                      </p>
                      <p className="text-3xl font-bold text-white">
                        {simulation.currentScore}
                      </p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-[#0F172A] border border-[#1F2937]">
                      <p className="text-xs text-[#64748B] uppercase tracking-wide mb-1">
                        Impact
                      </p>
                      <p
                        className={`text-3xl font-bold ${
                          simulation.scoreDelta >= 0
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {simulation.scoreDelta >= 0 ? "+" : ""}
                        {simulation.scoreDelta}
                      </p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-[#0F172A] border border-[#1F2937]">
                      <p className="text-xs text-[#64748B] uppercase tracking-wide mb-1">
                        Projected
                      </p>
                      <p className="text-3xl font-bold text-white">
                        {simulation.projectedScore}
                      </p>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-[#0F172A] border border-[#1F2937]">
                      <p className="text-xs text-[#64748B] uppercase tracking-wide mb-1">
                        Burden Ratio
                      </p>
                      <p className="text-lg font-semibold text-white">
                        {simulation.burdenRatio}
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-[#0F172A] border border-[#1F2937]">
                      <p className="text-xs text-[#64748B] uppercase tracking-wide mb-1">
                        Monthly Free Cash
                      </p>
                      <p className="text-lg font-semibold text-white">
                        ₹{simulation.monthlyFreeCash.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>

                  {/* Risk Level */}
                  <div
                    className={`p-4 rounded-xl border ${
                      simulation.riskLevel === "Low"
                        ? "bg-green-500/5 border-green-500/20"
                        : simulation.riskLevel === "Medium"
                        ? "bg-yellow-500/5 border-yellow-500/20"
                        : "bg-red-500/5 border-red-500/20"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`text-sm font-bold ${
                          simulation.riskLevel === "Low"
                            ? "text-green-400"
                            : simulation.riskLevel === "Medium"
                            ? "text-yellow-400"
                            : "text-red-400"
                        }`}
                      >
                        Risk: {simulation.riskLevel}
                      </span>
                    </div>
                    <p className="text-sm text-[#94A3B8] leading-relaxed">
                      {simulation.recommendation}
                    </p>
                  </div>

                  {error && (
                    <p className="text-sm text-red-400">{error}</p>
                  )}

                  <div className="flex justify-between pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setStep(2)}
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleSubmit}
                      loading={submitting}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Add Commitment
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