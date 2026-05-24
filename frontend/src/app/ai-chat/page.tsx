/**
 * FinPilot AI - AI Chat Assistant Page (Coming Soon)
 */

"use client";

import React from "react";
import { motion } from "framer-motion";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Card } from "@/components/ui/Card";
import { MessageSquare, Sparkles, BookOpen, Zap } from "lucide-react";

const planned = [
  { icon: Sparkles, label: "Smart Conversations", desc: "Ask financial questions in natural language" },
  { icon: BookOpen, label: "Contextual Knowledge", desc: "Understands your financial profile for personalized advice" },
  { icon: Zap, label: "Instant Analysis", desc: "Get quick analyses without filling out forms" },
  { icon: MessageSquare, label: "Multi-turn Chat", desc: "Have deep financial planning conversations" },
];

export default function AIChatPage() {
  return (
    <PageWrapper title="AI Chat Assistant" subtitle="Talk to FinPilot AI about your finances">
      <div className="flex flex-col items-center justify-center py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/30">
            <MessageSquare className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Coming Soon</h2>
          <p className="text-gray-400 max-w-md mx-auto text-sm">
            The AI Chat Assistant will let you have natural conversations about your finances, powered by advanced language models.
          </p>
        </motion.div>

        {/* Chat Preview Mockup */}
        <Card className="max-w-lg w-full p-5 mb-8">
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-[10px] font-bold text-white shrink-0">AI</div>
              <div className="bg-white/[0.04] rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-gray-300">
                Hi! I&apos;m FinPilot AI. How can I help with your financial planning today?
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl rounded-tr-sm px-4 py-3 text-sm text-gray-200">
                Should I buy a laptop for &#8377;80,000 on EMI?
              </div>
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white shrink-0">U</div>
            </div>
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-[10px] font-bold text-white shrink-0">AI</div>
              <div className="bg-white/[0.04] rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" style={{ animationDelay: "0.2s" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" style={{ animationDelay: "0.4s" }} />
                  </div>
                  Analyzing...
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl w-full">
          {planned.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
              >
                <Card hover className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{item.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                    </div>
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
