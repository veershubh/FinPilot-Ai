"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, ExternalLink } from "lucide-react";
import Link from "next/link";

interface Notification {
  id: string;
  type: string;
  title?: string;
  message: string;
  is_read: boolean;
  created_at: string;
  commitment_id?: string;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unread = notifications.filter((n) => !n.is_read).length;

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json)) setNotifications(json);
      }
    } catch {}
  };

  const markAllRead = async () => {
    const ids = notifications.filter((n) => !n.is_read).map((n) => n.id);
    if (!ids.length) return;
    try {
      await fetch("/api/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch {}
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60_000);
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const typeIcon: Record<string, string> = {
    payment_recorded: "✅",
    commitment_completed: "🎉",
    payment_overdue: "⚠️",
    payment_due: "🔔",
    ai_insight_generated: "🤖",
    health_score_change: "📊",
  };

  const formatTime = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => { setOpen((o) => !o); if (!open) fetchNotifications(); }}
        className="relative p-2 rounded-xl text-[#64748B] hover:text-white hover:bg-white/5 transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#10B981] text-[#050816] text-[10px] font-bold flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 w-80 bg-[#111827] border border-[#1F2937] rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#1F2937]">
              <h3 className="text-sm font-semibold text-white">
                Notifications {unread > 0 && <span className="text-[#10B981]">({unread})</span>}
              </h3>
              {unread > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-[#10B981] hover:underline flex items-center gap-1"
                >
                  <Check className="w-3 h-3" /> Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-8 text-center">
                  <Bell className="w-8 h-8 text-[#374151] mx-auto mb-2" />
                  <p className="text-xs text-[#64748B]">No notifications yet</p>
                </div>
              ) : (
                notifications.slice(0, 15).map((n) => (
                  <div
                    key={n.id}
                    className={`flex gap-3 px-4 py-3 border-b border-[#1F2937] last:border-0 transition-colors ${
                      !n.is_read ? "bg-[#10B981]/5" : ""
                    }`}
                  >
                    <span className="text-base mt-0.5 shrink-0">
                      {typeIcon[n.type] ?? "🔔"}
                    </span>
                    <div className="flex-1 min-w-0">
                      {n.title && (
                        <p className="text-xs font-semibold text-white truncate">{n.title}</p>
                      )}
                      <p className="text-xs text-[#94A3B8] leading-relaxed line-clamp-2">{n.message}</p>
                      <p className="text-[10px] text-[#475569] mt-1">{formatTime(n.created_at)}</p>
                    </div>
                    {n.commitment_id && (
                      <Link
                        href={`/commitments/${n.commitment_id}`}
                        onClick={() => setOpen(false)}
                        className="text-[#64748B] hover:text-[#10B981] mt-0.5 shrink-0"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
