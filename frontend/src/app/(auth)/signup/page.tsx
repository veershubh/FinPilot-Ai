"use client";

import React, { useState } from "react";
import Link from "next/link";
import { User, Mail, Phone, Lock, Eye, EyeOff, ShieldCheck, Bot, Fingerprint, KeyRound } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const badges = [
  { label: "Secure", icon: ShieldCheck },
  { label: "AI Powered", icon: Bot },
  { label: "Financial Privacy", icon: Fingerprint },
  { label: "Encrypted", icon: KeyRound },
];

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex-1 flex">
      {/* Left — Marketing */}
      <div className="hidden lg:flex flex-1 flex-col justify-center px-12 xl:px-20 relative overflow-hidden">
        <div className="absolute top-20 left-20 w-[400px] h-[400px] bg-[#10B981]/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-20 right-10 w-[200px] h-[200px] bg-[#9333EA]/5 rounded-full blur-[80px] pointer-events-none" />

        <h2 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-4">
          Secure Intelligent{" "}
          <br />
          Wealth Management
        </h2>
        <p className="text-[#94A3B8] max-w-md leading-relaxed mb-10">
          Experience the future of personal finance with 256-bit encryption and real-time AI insights.
        </p>

        {/* Badges */}
        <div className="grid grid-cols-2 gap-3 max-w-sm">
          {badges.map((badge) => {
            const Icon = badge.icon;
            return (
              <div
                key={badge.label}
                className="flex items-center gap-2.5 px-4 py-3 rounded-xl border border-[#1F2937] bg-[#111827]/60 text-sm text-[#94A3B8]"
              >
                <Icon className="w-4 h-4 text-[#10B981]" />
                {badge.label}
              </div>
            );
          })}
        </div>

        {/* AI Core indicator */}
        <div className="mt-12 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          <span className="text-xs text-[#64748B]">AI Core Active</span>
        </div>
      </div>

      {/* Right — Sign Up Form */}
      <div className="flex-1 flex items-center justify-center px-6 lg:px-12">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-bold text-white mb-1">Create Your FinPilot Account</h1>
          <p className="text-[#94A3B8] mb-8">Start your journey to financial freedom today.</p>

          <form className="space-y-5">
            <Input
              label="Full Name"
              type="text"
              placeholder="John Doe"
              icon={<User className="w-4 h-4" />}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              icon={<Mail className="w-4 h-4" />}
            />

            <Input
              label="Phone Number"
              type="tel"
              placeholder="+1 (555) 000-0000"
              icon={<Phone className="w-4 h-4" />}
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-1.5">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#64748B]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-[#1F2937] bg-[#0F172A] pl-11 pr-4 py-3 text-sm text-white placeholder-[#64748B] focus:outline-none focus:border-[#10B981]/50 hover:border-[#374151] transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1.5">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#64748B]">
                    <Eye className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-[#1F2937] bg-[#0F172A] pl-11 pr-4 py-3 text-sm text-white placeholder-[#64748B] focus:outline-none focus:border-[#10B981]/50 hover:border-[#374151] transition-all"
                  />
                </div>
              </div>
            </div>

            <Button variant="primary" size="lg" className="w-full">
              Create Account
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-[#1F2937]" />
            <span className="text-xs text-[#64748B] uppercase tracking-wider">Or Continue With</span>
            <div className="flex-1 h-px bg-[#1F2937]" />
          </div>

          {/* Social auth */}
          <div className="grid grid-cols-2 gap-3">
            {["Google", "Apple"].map((provider) => (
              <button
                key={provider}
                className="flex items-center justify-center gap-2 py-3 rounded-xl border border-[#1F2937] bg-[#111827] text-sm text-[#94A3B8] hover:border-[#374151] hover:bg-[#162033] transition-all"
              >
                {provider}
              </button>
            ))}
          </div>

          <p className="text-center text-sm text-[#94A3B8] mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-[#10B981] font-semibold hover:text-[#059669] transition-colors">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
