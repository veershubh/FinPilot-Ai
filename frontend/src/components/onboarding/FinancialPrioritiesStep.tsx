"use client"

import React, { useState } from "react"
import { ArrowLeft, ArrowRight, Check } from "lucide-react"
import { Button } from "@/components/ui/Button"

// Define a set of possible financial priorities for the user to choose from
const PRIORITY_OPTIONS = [
  { id: "budget", label: "Budget Optimization", description: "Fine‑tune your monthly budget for maximum savings" },
  { id: "invest", label: "Investments", description: "Get personalized investment suggestions and risk profiling" },
  { id: "debt", label: "Debt Reduction", description: "Create a strategic plan to pay down loans and credit cards" },
  { id: "savings", label: "Savings Growth", description: "Automate savings and discover high‑yield accounts" },
  { id: "retire", label: "Retirement Planning", description: "Project long‑term goals and optimal retirement accounts" },
  { id: "tax", label: "Tax Optimization", description: "Identify deductions and strategies to keep more of your earnings" },
]

interface Props {
  data: any // OnboardingData – passed from parent
  updateData: (partial: Partial<any>) => void
  onNext: () => void
  onBack: () => void
}

export function FinancialPrioritiesStep({ data, updateData, onNext, onBack }: Props) {
  // Local state mirrors the persisted onboarding data
  const [selected, setSelected] = useState<string[]>(data.priorities || [])

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const handleNext = () => {
    // Persist the chosen priorities before moving forward
    updateData({ priorities: selected })
    onNext()
  }

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-2xl font-semibold text-white mb-2">
        What are your top financial priorities?
      </h2>
      <p className="text-[#94A3B8] mb-6 max-w-lg">
        Choose the areas you want FinPilot AI to focus on first. You can select multiple options – the AI will tailor the dashboard to match these goals.
      </p>

      {/* Grid of selectable cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
        {PRIORITY_OPTIONS.map((opt) => {
          const isSelected = selected.includes(opt.id)
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => toggle(opt.id)}
              className={`p-4 text-left rounded-xl border border-[#1F2937] bg-[#111827] transition-all duration-200 hover:border-[#10B981] hover:shadow-xl ${
                isSelected ? "border-[#10B981] bg-[#10B981]/10" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-white">{opt.label}</h3>
                {isSelected && <Check className="w-5 h-5 text-[#10B981]" />}
              </div>
              <p className="text-xs text-[#94A3B8]">{opt.description}</p>
            </button>
          )
        })}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6 pt-4 border-t border-[#1F2937]">
        <Button variant="secondary" size="lg" onClick={onBack}>
          <ArrowLeft className="mr-2 w-4 h-4" /> Back
        </Button>
        <Button
          variant="primary"
          size="lg"
          onClick={handleNext}
          disabled={selected.length === 0}
        >
          Continue <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
