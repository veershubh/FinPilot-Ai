"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Lock, Eye, EyeOff, ArrowLeft, ArrowRight, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ResetPasswordPage() {
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [password, setPassword] = useState("");

  const getStrength = (pw: string) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };

  const strength = getStrength(password);
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["bg-[#1F2937]", "bg-[#EF4444]", "bg-[#F59E0B]", "bg-[#3B82F6]", "bg-[#10B981]"];
  const strengthTextColors = ["text-[#64748B]", "text-[#EF4444]", "text-[#F59E0B]", "text-[#3B82F6]", "text-[#10B981]"];

  return (
    <div className="flex-1 flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="rounded-2xl border border-[#1F2937] bg-[#111827] p-8 shadow-2xl">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 rounded-full bg-[#10B981]/10 flex items-center justify-center">
              <KeyRound className="w-7 h-7 text-[#10B981]" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-white text-center mb-2">Create New Password</h1>
          <p className="text-sm text-[#94A3B8] text-center mb-8">
            Your new password must be different from previous passwords.
          </p>

          <form className="space-y-5">
            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-white mb-1.5">New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#64748B]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showNew ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your new password"
                  className="w-full rounded-xl border border-[#1F2937] bg-[#0F172A] pl-11 pr-11 py-3 text-sm text-white placeholder-[#64748B] focus:outline-none focus:border-[#10B981]/50 hover:border-[#374151] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#64748B] hover:text-[#94A3B8]"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Strength meter */}
            {password.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#64748B] uppercase tracking-wider font-semibold">Strength</span>
                  <span className={`text-xs font-semibold ${strengthTextColors[strength]}`}>
                    {strengthLabels[strength]}
                  </span>
                </div>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full transition-colors ${
                        i <= strength ? strengthColors[strength] : "bg-[#1F2937]"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-white mb-1.5">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#64748B]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm your new password"
                  className="w-full rounded-xl border border-[#1F2937] bg-[#0F172A] pl-11 pr-11 py-3 text-sm text-white placeholder-[#64748B] focus:outline-none focus:border-[#10B981]/50 hover:border-[#374151] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#64748B] hover:text-[#94A3B8]"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button variant="primary" size="lg" className="w-full">
              Reset Password <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          {/* Divider */}
          <div className="h-px bg-[#1F2937] my-6" />

          <Link
            href="/login"
            className="flex items-center justify-center gap-2 text-sm text-[#94A3B8] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
