"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  MessageSquare, Send, Plus, Trash2, Bot, User,
  Sparkles, RefreshCw, ChevronLeft, Wallet, BarChart3,
  Target, TrendingUp, PiggyBank, ArrowRight,
  CheckCircle, ExternalLink, X,
} from "lucide-react";
import type { AIConversation, AIMessage } from "@/types/ai-assistant";

const SUGGESTED_PROMPTS = [
  { icon: Wallet, text: "What is my current net worth?", color: "#10B981" },
  { icon: BarChart3, text: "Analyze my debt situation", color: "#EF4444" },
  { icon: Target, text: "How are my financial goals progressing?", color: "#8B5CF6" },
  { icon: TrendingUp, text: "Suggest ways to reduce my monthly burden", color: "#F59E0B" },
  { icon: PiggyBank, text: "Create a savings plan for me", color: "#3B82F6" },
  { icon: Sparkles, text: "Give me a complete financial health report", color: "#EC4899" },
];

// ─── Toast Notification ────────────────────────────────────────────
interface ToastProps {
  message: string;
  type: "success" | "error";
  onDismiss: () => void;
}

function Toast({ message, type, onDismiss }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 5000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border max-w-sm ${
        type === "success"
          ? "bg-[#0F172A] border-[#10B981]/40 text-white"
          : "bg-[#0F172A] border-red-500/40 text-white"
      }`}
    >
      {type === "success" ? (
        <CheckCircle className="w-5 h-5 text-[#10B981] flex-shrink-0" />
      ) : (
        <X className="w-5 h-5 text-red-400 flex-shrink-0" />
      )}
      <p className="text-sm flex-1">{message}</p>
      <button onClick={onDismiss} className="text-[#64748B] hover:text-white transition-colors">
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

// ─── Commitment Action Card ────────────────────────────────────────
interface CommitmentActionCardProps {
  title: string;
  monthlyAmount: number;
  category: string;
  onNavigate: () => void;
}

function CommitmentActionCard({ title, monthlyAmount, category, onNavigate }: CommitmentActionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="mt-3 rounded-xl border border-[#10B981]/30 bg-[#10B981]/5 p-4"
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#10B981]/15 flex items-center justify-center flex-shrink-0">
          <CheckCircle className="w-5 h-5 text-[#10B981]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-[#10B981] uppercase tracking-wider mb-0.5">Commitment Added</p>
          <p className="text-sm font-bold text-white truncate">{title}</p>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            ₹{monthlyAmount.toLocaleString("en-IN")}/month · {category.replace(/_/g, " ")}
          </p>
        </div>
        <button
          onClick={onNavigate}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#10B981] hover:text-white bg-[#10B981]/10 hover:bg-[#10B981]/20 px-3 py-1.5 rounded-lg transition-all flex-shrink-0"
        >
          View <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </motion.div>
  );
}

type AssistantAction =
  | {
      type: "commitment_created";
      commitmentId: string;
      title: string;
      monthly_amount: number;
      category: string;
    }
  | {
      type: "pending_action";
      actionType: "create_commitment" | "create_asset" | "create_liability" | "create_goal";
      label: string;
      payload: Record<string, unknown>;
    }
  | {
      type: "record_created";
      recordType: "asset" | "liability" | "goal";
      recordId: string;
      title: string;
      amount: number;
      category: string;
    };

function PendingActionCard({
  action,
  onConfirm,
}: {
  action: Extract<AssistantAction, { type: "pending_action" }>;
  onConfirm: (action: Extract<AssistantAction, { type: "pending_action" }>) => void;
}) {
  const amount =
    Number(action.payload.monthly_amount ?? action.payload.current_value ?? action.payload.outstanding_balance ?? action.payload.target_amount ?? 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="mt-3 rounded-xl border border-[#3B82F6]/30 bg-[#3B82F6]/5 p-4"
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#3B82F6]/15 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-[#3B82F6]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-[#3B82F6] uppercase tracking-wider mb-0.5">Needs Confirmation</p>
          <p className="text-sm font-bold text-white">{action.label}</p>
          {amount > 0 && (
            <p className="text-xs text-[#94A3B8] mt-0.5">₹{amount.toLocaleString("en-IN")}</p>
          )}
        </div>
        <button
          onClick={() => onConfirm(action)}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#10B981] hover:text-white bg-[#10B981]/10 hover:bg-[#10B981]/20 px-3 py-1.5 rounded-lg transition-all flex-shrink-0"
        >
          Confirm <CheckCircle className="w-3 h-3" />
        </button>
      </div>
    </motion.div>
  );
}

// ─── Message Bubble ──────────────────────────────────────────────
interface MessageBubbleProps {
  message: AIMessage;
  action?: AssistantAction | null;
  onNavigateToCommitment?: (id: string) => void;
  onConfirmAction?: (action: Extract<AssistantAction, { type: "pending_action" }>) => void;
}

function MessageBubble({ message, action, onNavigateToCommitment, onConfirmAction }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}
    >
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
          isUser
            ? "bg-[#10B981]/10"
            : "bg-gradient-to-br from-[#3B82F6]/20 to-[#8B5CF6]/20 border border-[#3B82F6]/20"
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-[#10B981]" />
        ) : (
          <Bot className="w-4 h-4 text-[#3B82F6]" />
        )}
      </div>
      <div className={`max-w-[80%] ${isUser ? "" : "flex-1"}`}>
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? "bg-[#10B981]/10 border border-[#10B981]/20 text-white"
              : "bg-[#111827] border border-[#1F2937] text-[#E2E8F0]"
          }`}
        >
          <div className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content.split(/(\*\*.*?\*\*)/).map((part, i) => {
              if (part.startsWith("**") && part.endsWith("**")) {
                return <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
              }
              return <span key={i}>{part}</span>;
            })}
          </div>
          <p className="text-[10px] text-[#64748B] mt-1.5">
            {new Date(message.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>

        {/* Commitment Action Card — shown below the AI message */}
        {!isUser && action?.type === "commitment_created" && onNavigateToCommitment && (
          <CommitmentActionCard
            title={action.title}
            monthlyAmount={action.monthly_amount}
            category={action.category}
            onNavigate={() => onNavigateToCommitment(action.commitmentId)}
          />
        )}
        {!isUser && action?.type === "pending_action" && onConfirmAction && (
          <PendingActionCard action={action} onConfirm={onConfirmAction} />
        )}
        {!isUser && action?.type === "record_created" && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="mt-3 rounded-xl border border-[#10B981]/30 bg-[#10B981]/5 p-4"
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#10B981]/15 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-[#10B981]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#10B981] uppercase tracking-wider mb-0.5">
                  {action.recordType.replace("_", " ")} Created
                </p>
                <p className="text-sm font-bold text-white truncate">{action.title}</p>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  ₹{action.amount.toLocaleString("en-IN")} · {action.category.replace(/_/g, " ")}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Typing Indicator ────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#3B82F6]/20 to-[#8B5CF6]/20 border border-[#3B82F6]/20 flex items-center justify-center">
        <Bot className="w-4 h-4 text-[#3B82F6]" />
      </div>
      <div className="bg-[#111827] border border-[#1F2937] rounded-2xl px-4 py-3 flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full bg-[#64748B] animate-bounce" style={{ animationDelay: "0ms" }} />
        <div className="w-2 h-2 rounded-full bg-[#64748B] animate-bounce" style={{ animationDelay: "150ms" }} />
        <div className="w-2 h-2 rounded-full bg-[#64748B] animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  );
}

// ─── Extended message type with optional action ───────────────────
interface AIMessageWithAction extends AIMessage {
  action?: AssistantAction | null;
}

// ─── Main Page ───────────────────────────────────────────────────
export default function AIAssistantPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AIMessageWithAction[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ message, type });
  }, []);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    setLoadingConversations(true);
    try {
      const res = await fetch("/api/ai-assistant");
      if (res.ok) {
        const data = await res.json();
        setConversations(Array.isArray(data) ? data : []);
      }
    } catch {
      // silent
    } finally {
      setLoadingConversations(false);
    }
  }, []);

  // Fetch messages for active conversation
  const fetchMessages = useCallback(async (convId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/ai-assistant/chat?conversationId=${convId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(Array.isArray(data) ? data : []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (activeConversationId) {
      fetchMessages(activeConversationId);
    }
  }, [activeConversationId, fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Create new conversation
  const handleNewConversation = async () => {
    try {
      const res = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New Conversation" }),
      });
      if (res.ok) {
        const conv = await res.json();
        setConversations((prev) => [conv, ...prev]);
        setActiveConversationId(conv.id);
        setMessages([]);
        inputRef.current?.focus();
      }
    } catch {
      alert("Failed to create conversation");
    }
  };

  // Delete conversation
  const handleDeleteConversation = async (id: string) => {
    try {
      await fetch(`/api/ai-assistant?id=${id}`, { method: "DELETE" });
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConversationId === id) {
        setActiveConversationId(null);
        setMessages([]);
      }
    } catch {
      // silent
    }
  };

  // Navigate to a created commitment
  const handleNavigateToCommitment = useCallback((id: string) => {
    router.push(`/commitments/${id}`);
  }, [router]);

  const handleConfirmAction = useCallback(async (action: Extract<AssistantAction, { type: "pending_action" }>) => {
    try {
      const res = await fetch("/api/ai-assistant/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionType: action.actionType, payload: action.payload }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast(data.error || "Action failed. Please review the details and try again.", "error");
        return;
      }

      const record = data.record ?? {};
      const title = record.title || record.name || action.label;
      const createdAction: AssistantAction =
        action.actionType === "create_commitment"
          ? {
              type: "commitment_created",
              commitmentId: record.id,
              title,
              monthly_amount: Number(record.monthly_amount ?? action.payload.monthly_amount ?? 0),
              category: String(record.category ?? action.payload.category ?? "other"),
            }
          : {
              type: "record_created",
              recordType: action.actionType.replace("create_", "") as "asset" | "liability" | "goal",
              recordId: record.id,
              title,
              amount: Number(record.current_value ?? record.outstanding_balance ?? record.target_amount ?? 0),
              category: String(record.category ?? "other"),
            };

      setMessages((prev) =>
        prev.map((msg) => (msg.action === action ? { ...msg, action: createdAction } : msg))
      );

      showToast(`${title} created successfully.`, "success");
      fetchConversations();

      if (action.actionType === "create_asset") router.push(`/assets/${record.id}`);
      if (action.actionType === "create_liability") router.push(`/liabilities/${record.id}`);
      if (action.actionType === "create_goal") router.push("/strategy");
    } catch {
      showToast("Action failed. Please try again.", "error");
    }
  }, [fetchConversations, router, showToast]);

  // Send message
  const handleSend = async (text?: string) => {
    const messageText = text ?? input.trim();
    if (!messageText || sending) return;

    let convId = activeConversationId;

    // Auto-create conversation if none active
    if (!convId) {
      try {
        const res = await fetch("/api/ai-assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: messageText.substring(0, 50) }),
        });
        if (res.ok) {
          const conv = await res.json();
          setConversations((prev) => [conv, ...prev]);
          convId = conv.id;
          setActiveConversationId(conv.id);
        } else {
          return;
        }
      } catch {
        return;
      }
    }

    // Optimistic UI — add user message immediately
    const tempUserMsg: AIMessageWithAction = {
      id: `temp-${Date.now()}`,
      conversation_id: convId!,
      user_id: "",
      role: "user",
      content: messageText,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/ai-assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: convId, message: messageText }),
      });

      if (res.ok) {
        const data = await res.json();

        const assistantMsg: AIMessageWithAction = {
          id: `temp-${Date.now()}-assistant`,
          conversation_id: convId!,
          user_id: "",
          role: "assistant",
          content: data.content,
          created_at: new Date().toISOString(),
          action: data.action ?? null,
        };
        setMessages((prev) => [...prev, assistantMsg]);

        // Show toast if a commitment was created
        if (data.action?.type === "commitment_created") {
          showToast(
            `✅ Commitment "${data.action.title}" added successfully!`,
            "success"
          );
        }

        // Refresh conversations list to get updated title
        fetchConversations();
      } else {
        const err = await res.json().catch(() => ({}));
        const errorMsg: AIMessageWithAction = {
          id: `temp-${Date.now()}-error`,
          conversation_id: convId!,
          user_id: "",
          role: "assistant",
          content: `Sorry, I encountered an error: ${err.error || "Unknown error"}. Please try again.`,
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorMsg]);
        showToast("Failed to get a response. Please try again.", "error");
      }
    } catch {
      const errorMsg: AIMessageWithAction = {
        id: `temp-${Date.now()}-error`,
        conversation_id: convId!,
        user_id: "",
        role: "assistant",
        content: "Sorry, I'm unable to connect right now. Please try again later.",
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
      showToast("Connection failed. Please check your network.", "error");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-[calc(100vh-0px)] overflow-hidden">
      {/* ── Conversation Sidebar ─────────────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="border-r border-[#1F2937] bg-[#0B1020] flex flex-col overflow-hidden flex-shrink-0"
          >
            <div className="p-4 border-b border-[#1F2937]">
              <Button
                size="sm"
                className="w-full"
                onClick={handleNewConversation}
              >
                <Plus className="w-4 h-4" /> New Chat
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {loadingConversations ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-5 h-5 text-[#64748B] animate-spin" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-8 h-8 text-[#1F2937] mx-auto mb-2" />
                  <p className="text-xs text-[#64748B]">No conversations yet</p>
                </div>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                      activeConversationId === conv.id
                        ? "bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981]"
                        : "text-[#94A3B8] hover:bg-white/[0.04] hover:text-white border border-transparent"
                    }`}
                    onClick={() => setActiveConversationId(conv.id)}
                  >
                    <MessageSquare className="w-4 h-4 flex-shrink-0" />
                    <span className="text-xs font-medium truncate flex-1">{conv.title}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteConversation(conv.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-500/10 text-[#64748B] hover:text-red-400 transition-all"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Context badge */}
            <div className="p-3 border-t border-[#1F2937]">
              <div className="rounded-xl bg-[#111827] border border-[#1F2937] p-3">
                <p className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
                  AI has access to
                </p>
                <div className="flex flex-wrap gap-1">
                  {["Assets", "Liabilities", "Commitments", "Goals", "Profile"].map((item) => (
                    <span
                      key={item}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-[#10B981]/10 text-[#10B981] font-medium"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Chat Area ────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[#1F2937]">
          <button
            onClick={() => setSidebarOpen((p) => !p)}
            className="p-2 rounded-xl text-[#64748B] hover:text-white hover:bg-white/5 transition-colors"
          >
            <ChevronLeft className={`w-5 h-5 transition-transform ${sidebarOpen ? "" : "rotate-180"}`} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">FinPilot AI</h2>
              <p className="text-[10px] text-[#64748B]">Your personal financial advisor</p>
            </div>
          </div>

          {/* Quick hint */}
          <div className="ml-auto hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#10B981]/5 border border-[#10B981]/15">
            <CheckCircle className="w-3.5 h-3.5 text-[#10B981]" />
            <span className="text-[10px] text-[#10B981] font-medium">Say "Add this as commitment" to save</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {!activeConversationId && messages.length === 0 ? (
            // Welcome state
            <div className="flex flex-col items-center justify-center h-full">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center mb-8"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#3B82F6]/20 to-[#8B5CF6]/20 border border-[#3B82F6]/20 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-[#3B82F6]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-1">How can I help you today?</h3>
                <p className="text-sm text-[#94A3B8] max-w-md">
                  I have access to your assets, liabilities, commitments, and goals. Ask me anything — or discuss a purchase and I'll add it as a commitment.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl w-full">
                {SUGGESTED_PROMPTS.map((prompt, i) => {
                  const Icon = prompt.icon;
                  return (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + i * 0.05 }}
                      onClick={() => handleSend(prompt.text)}
                      className="group flex items-center gap-3 p-3.5 rounded-xl border border-[#1F2937] bg-[#111827] hover:border-[#374151] hover:bg-[#162033] transition-all text-left"
                    >
                      <div className="p-2 rounded-lg" style={{ backgroundColor: `${prompt.color}15` }}>
                        <Icon className="w-4 h-4" style={{ color: prompt.color }} />
                      </div>
                      <span className="text-xs text-[#94A3B8] group-hover:text-white transition-colors flex-1">
                        {prompt.text}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#64748B] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.button>
                  );
                })}
              </div>
            </div>
          ) : (
            <>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="w-6 h-6 text-[#64748B] animate-spin" />
                </div>
              ) : (
                messages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    action={msg.action}
                    onNavigateToCommitment={handleNavigateToCommitment}
                    onConfirmAction={handleConfirmAction}
                  />
                ))
              )}
              {sending && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Bar */}
        <div className="px-6 py-4 border-t border-[#1F2937]">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder='Ask about your finances... or say "Add this as commitment"'
                disabled={sending}
                className="w-full rounded-xl border border-[#1F2937] bg-[#0F172A] px-4 py-3 pr-12 text-sm text-white placeholder-[#64748B] focus:outline-none focus:border-[#10B981]/50 focus:ring-1 focus:ring-[#10B981]/20 disabled:opacity-50"
              />
            </div>
            <Button
              size="md"
              disabled={!input.trim() || sending}
              loading={sending}
              onClick={() => handleSend()}
              className="flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-[10px] text-[#64748B] mt-2 text-center">
            FinPilot AI uses your financial data to provide personalized insights. Responses are AI-generated and may not be financial advice.
          </p>
        </div>
      </div>

      {/* ── Toast Notifications ───────────────────────── */}
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onDismiss={() => setToast(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
