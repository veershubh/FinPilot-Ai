"use client";

import React from "react";
import { COMMITMENT_CATEGORIES, COMMITMENT_STATUSES } from "@/types/commitments";
import { motion } from "framer-motion";

interface CommitmentFiltersProps {
  selectedStatus: string;
  selectedCategory: string;
  sortBy: string;
  onStatusChange: (status: string) => void;
  onCategoryChange: (category: string) => void;
  onSortChange: (sort: string) => void;
}

const statusOptions = [
  { value: "all", label: "All" },
  ...COMMITMENT_STATUSES.map(s => ({ value: s, label: s.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) }))
];

const categoryOptions = [
  { value: "all", label: "All Categories" },
  ...COMMITMENT_CATEGORIES.map(c => ({ value: c, label: c.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) }))
];

const sortOptions = [
  { value: "due_date", label: "Due Date" },
  { value: "amount", label: "Amount" },
  { value: "progress", label: "Progress" },
  { value: "created", label: "Recently Added" },
];

export function CommitmentFilters({
  selectedStatus,
  selectedCategory,
  sortBy,
  onStatusChange,
  onCategoryChange,
  onSortChange
}: CommitmentFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-[#162033] rounded-xl border border-[#1F2937]">
      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2">
        {statusOptions.map((option) => (
          <motion.button
            key={option.value}
            onClick={() => onStatusChange(option.value)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`
              px-3 py-1.5 rounded-full text-xs font-medium transition-all
              ${selectedStatus === option.value
                ? "bg-[#3B82F6] text-white"
                : "bg-[#1F2937] text-[#A1A1AA] hover:bg-[#374151] hover:text-white"
              }
            `}
          >
            {option.label}
          </motion.button>
        ))}
      </div>

      {/* Category Dropdown */}
      <div className="flex-1 sm:w-48">
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="w-full px-4 py-2 rounded-lg bg-[#1F2937] border border-[#374151] text-white text-sm
            focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
        >
          {categoryOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      {/* Sort Dropdown */}
      <div className="flex-1 sm:w-40">
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="w-full px-4 py-2 rounded-lg bg-[#1F2937] border border-[#374151] text-white text-sm
            focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}