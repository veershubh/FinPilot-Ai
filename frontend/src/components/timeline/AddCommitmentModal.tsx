// src/components/timeline/AddCommitmentModal.tsx
"use client";

import React, { useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { addToTimeline } from "@/actions/timeline";
import type { FinancialTimelineInsert } from "@/types/database";

interface AddCommitmentModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void; // refresh list after adding
}

export function AddCommitmentModal({ open, onClose, onSuccess }: AddCommitmentModalProps) {
  const [form, setForm] = useState<Partial<FinancialTimelineInsert>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Basic validation – required fields
      const required = ["title", "category", "monthly_amount", "start_date", "total_months"];
      for (const field of required) {
        if (!form[field as keyof typeof form]) {
          throw new Error(`${field} is required`);
        }
      }
      await addToTimeline(form as FinancialTimelineInsert);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to add commitment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition appear show={open} as={React.Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-[#111827] p-6 text-left align-middle shadow-xl transition-all border border-[#1F2937]">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-white mb-4">
                  Add New Commitment
                </Dialog.Title>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    label="Title"
                    name="title"
                    required
                    value={form.title ?? ""}
                    onChange={handleChange}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <select
                      name="category"
                      required
                      className="rounded-md border border-[#1F2937] bg-[#111827] text-white p-2"
                      value={form.category ?? ""}
                      onChange={handleChange}
                    >
                      <option value="" disabled>Select Category</option>
                      <option value="emi">EMI</option>
                      <option value="loan">Loan</option>
                      <option value="subscription">Subscription</option>
                      <option value="sip">SIP</option>
                      <option value="investment">Investment</option>
                      <option value="other">Other</option>
                    </select>
                    <Input
                      label="Provider"
                      name="provider"
                      value={form.provider ?? ""}
                      onChange={handleChange}
                    />
                  </div>
                  <Input
                    label="Monthly Amount"
                    name="monthly_amount"
                    type="number"
                    required
                    min="0"
                    value={form.monthly_amount ?? ""}
                    onChange={handleChange}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Start Date"
                      name="start_date"
                      type="date"
                      required
                      value={form.start_date ?? ""}
                      onChange={handleChange}
                    />
                    <Input
                      label="Total Months"
                      name="total_months"
                      type="number"
                      required
                      min="1"
                      value={form.total_months ?? ""}
                      onChange={handleChange}
                    />
                  </div>
                  {error && <p className="text-sm text-red-400">{error}</p>}
                  <div className="mt-4 flex justify-end space-x-2">
                    <Button variant="secondary" onClick={onClose} disabled={loading}>
                      Cancel
                    </Button>
                    <Button variant="primary" type="submit" loading={loading} disabled={loading}>
                      Add
                    </Button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
