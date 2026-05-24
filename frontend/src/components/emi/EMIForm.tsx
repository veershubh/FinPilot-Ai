"use client";

import React, { useState } from "react";
import { IndianRupee, Banknote, Receipt, PiggyBank, ShieldCheck, CalendarClock, Percent } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import type { PurchaseAnalysisRequest } from "@/types";

interface EMIFormProps {
  onSubmit: (data: PurchaseAnalysisRequest) => void;
  loading: boolean;
}

const defaultValues: PurchaseAnalysisRequest = {
  product_price: 80000,
  monthly_income: 15000,
  monthly_expenses: 9000,
  current_savings: 95000,
  emergency_fund: 20000,
  emi_months: 12,
  interest_rate: 12,
};

export function EMIForm({ onSubmit, loading }: EMIFormProps) {
  const [form, setForm] = useState<PurchaseAnalysisRequest>(defaultValues);

  const update = (field: keyof PurchaseAnalysisRequest, value: string) => {
    setForm((prev) => ({ ...prev, [field]: Number(value) || 0 }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold text-white">Purchase Details</h2>
        <p className="text-sm text-[#94A3B8]">Enter your financial information to get a smart recommendation.</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input label="Product Price" type="number" value={form.product_price} onChange={(e) => update("product_price", e.target.value)} placeholder="e.g., 80000" icon={<IndianRupee className="w-4 h-4" />} hint="Total cost of the product" required />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Monthly Income" type="number" value={form.monthly_income} onChange={(e) => update("monthly_income", e.target.value)} placeholder="e.g., 15000" icon={<Banknote className="w-4 h-4" />} required />
            <Input label="Monthly Expenses" type="number" value={form.monthly_expenses} onChange={(e) => update("monthly_expenses", e.target.value)} placeholder="e.g., 9000" icon={<Receipt className="w-4 h-4" />} required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Current Savings" type="number" value={form.current_savings} onChange={(e) => update("current_savings", e.target.value)} placeholder="e.g., 95000" icon={<PiggyBank className="w-4 h-4" />} required />
            <Input label="Emergency Fund" type="number" value={form.emergency_fund} onChange={(e) => update("emergency_fund", e.target.value)} placeholder="e.g., 20000" icon={<ShieldCheck className="w-4 h-4" />} required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="EMI Tenure (months)" type="number" value={form.emi_months} onChange={(e) => update("emi_months", e.target.value)} placeholder="e.g., 12" icon={<CalendarClock className="w-4 h-4" />} required />
            <Input label="Interest Rate (%)" type="number" step="0.1" value={form.interest_rate} onChange={(e) => update("interest_rate", e.target.value)} placeholder="e.g., 12" icon={<Percent className="w-4 h-4" />} required />
          </div>

          <Button type="submit" size="lg" className="w-full mt-2" loading={loading}>
            Analyze Purchase
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
