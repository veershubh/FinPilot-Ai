"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import {
  CreditCard,
  Smartphone,
  Laptop,
  Car,
  Home,
  Shield,
  TrendingUp,
  Repeat,
  GraduationCap,
  Banknote,
  Users,
  Briefcase,
  Plus
} from "lucide-react";

interface CommitmentCardProps {
  commitment: {
    id: string;
    title: string;
    category: string;
    provider: string | null;
    monthly_amount: number;
    progress_percentage: number;
    months_remaining: number;
    next_due_date: string | null;
    status: string;
  };
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onRecordPayment?: (id: string) => void;
}

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  phone_emi: Smartphone,
  laptop_emi: Laptop,
  vehicle_loan: Car,
  home_loan: Home,
  credit_card_emi: CreditCard,
  insurance: Shield,
  sip: TrendingUp,
  subscription: Repeat,
  education_loan: GraduationCap,
  personal_loan: Banknote,
  family_expense: Users,
  business_expense: Briefcase,
  other: Plus,
};

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

export function CommitmentCard({
  commitment,
  onEdit,
  onDelete,
  onRecordPayment
}: CommitmentCardProps) {
  const IconComponent = categoryIcons[commitment.category] || Plus;
  const statusClass = statusStyles[commitment.status] || statusStyles.active;
  const statusLabel = statusLabels[commitment.status] || commitment.status;

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)} days`;
    if (diffDays === 0) return "Due today";
    if (diffDays <= 7) return `Due in ${diffDays} day${diffDays !== 1 ? 's' : ''}`;
    return date.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card hover className="overflow-hidden">
        <div className="p-5">
          {/* Header with icon and status */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#1F2937] flex items-center justify-center">
                <IconComponent className="w-6 h-6 text-[#A1A1AA]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{commitment.title}</h3>
                <p className="text-sm text-[#A1A1AA]">{commitment.provider || "No provider"}</p>
              </div>
            </div>
            <Badge className={`${statusClass} border`}>
              {statusLabel}
            </Badge>
          </div>

          {/* Monthly amount and progress */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-[#A1A1AA] uppercase tracking-wide">Monthly Amount</p>
              <p className="text-2xl font-bold text-white">
                ₹{commitment.monthly_amount.toLocaleString("en-IN")}/mo
              </p>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <p className="text-xs text-[#A1A1AA] uppercase tracking-wide">Progress</p>
                <p className="text-sm font-medium text-white">
                  {commitment.progress_percentage}%
                </p>
              </div>
              <div className="h-2 bg-[#1F2937] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${commitment.progress_percentage}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] rounded-full"
                />
              </div>
            </div>
          </div>

          {/* Details row */}
          <div className="flex items-center justify-between text-sm text-[#A1A1AA] border-t border-[#1F2937] pt-4 mb-4">
            <div className="flex items-center gap-1">
              <span>Remaining:</span>
              <span className="font-medium text-white">{commitment.months_remaining} months</span>
            </div>
            <div className="flex items-center gap-1">
              <span>Next due:</span>
              <span className="font-medium text-white">{formatDate(commitment.next_due_date)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="flex-1"
              onClick={() => onRecordPayment?.(commitment.id)}
            >
              Record Payment
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex-1"
              onClick={() => onEdit?.(commitment.id)}
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 text-red-400 hover:text-red-300"
              onClick={() => onDelete?.(commitment.id)}
            >
              Delete
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}