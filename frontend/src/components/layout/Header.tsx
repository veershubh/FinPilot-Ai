"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Settings, LogOut, User, ChevronDown } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { NotificationBell } from "@/components/layout/NotificationBell";

export function Header() {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<{ email?: string; name?: string } | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch user on mount
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        // Try to get the profile name
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", authUser.id)
          .single();

        setUser({
          email: authUser.email,
          name: profile?.full_name || undefined,
        });
      }
    };
    fetchUser();
  }, [supabase]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const displayName = user?.name || user?.email?.split("@")[0] || "User";
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="h-16 border-b border-[#1F2937] bg-[#050816]/60 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-40">
      {/* Search */}
      <div className="relative w-80">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
        <input
          type="text"
          placeholder="Search features, tools..."
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0F172A] border border-[#1F2937] text-sm text-white placeholder-[#64748B] focus:outline-none focus:border-[#10B981]/40 hover:border-[#374151] transition-colors"
        />
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        <NotificationBell />

        {/* Profile Avatar & Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center text-xs font-bold text-[#050816] ring-2 ring-transparent group-hover:ring-[#10B981]/30 transition-all">
              {initials}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-white leading-tight truncate max-w-[120px]">
                {displayName}
              </p>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 text-[#64748B] transition-transform duration-200 ${
                dropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-[#1F2937] bg-[#0F172A] shadow-2xl shadow-black/40 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              {/* User Info */}
              <div className="px-4 py-3 border-b border-[#1F2937]">
                <p className="text-sm font-medium text-white truncate">{displayName}</p>
                <p className="text-xs text-[#64748B] truncate">{user?.email}</p>
              </div>

              {/* Menu Items */}
              <div className="py-1">
                <Link
                  href="/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#94A3B8] hover:text-white hover:bg-white/[0.04] transition-colors"
                >
                  <User className="w-4 h-4" />
                  Profile
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#94A3B8] hover:text-white hover:bg-white/[0.04] transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
              </div>

              {/* Logout */}
              <div className="border-t border-[#1F2937] py-1">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#94A3B8] hover:text-red-400 hover:bg-red-500/5 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
