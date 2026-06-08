"use client";

import React from "react";
import { motion } from "framer-motion";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Card } from "@/components/ui/Card";
import { MessageSquare, Brain, FileText, Lightbulb } from "lucide-react";

const planned = [
  { icon: Brain, label: "Financial Advisor", desc: "Chat with AI about your finances" },
  { icon: Lightbulb, label: "Smart Insights", desc: "Personalized recommendations based on your data" },
  { icon: FileText, label: "Report Generation", desc: "Generate detailed financial reports" },
  { icon: MessageSquare, label: "Natural Language", desc: "Ask questions in plain English" },
];

export default function AIAssistantPage() {
  return (
    <PageWrapper title="AI Assistant" subtitle="Your personal AI-powered financial advisor">
      <div className="flex flex-col items-center justify-center py-12">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="text-center mb-12">
          <div className="w-20 h-20 rounded-3xl bg-[#3B82F6]/10 border border-[#3B82F6]/20 flex items-center justify-center mx-auto mb-6">
            <MessageSquare className="w-10 h-10 text-[#3B82F6]" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Coming Soon</h2>
          <p className="text-[#94A3B8] max-w-md mx-auto text-sm">
            The AI Assistant will let you have natural conversations about your finances, get instant insights, and generate comprehensive reports.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl w-full">
          {planned.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }}>
                <Card hover className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-[#3B82F6]/10 text-[#3B82F6]"><Icon className="w-5 h-5" /></div>
                    <div><p className="text-sm font-semibold text-white">{item.label}</p><p className="text-xs text-[#64748B] mt-0.5">{item.desc}</p></div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </PageWrapper>
  );
}
