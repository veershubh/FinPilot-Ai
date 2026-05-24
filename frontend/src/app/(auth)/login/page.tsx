"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, Zap } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex-1 flex">
      {/* Left — Marketing */}
      <div className="hidden lg:flex flex-1 flex-col justify-center px-12 xl:px-20 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute top-20 right-20 w-[300px] h-[300px] bg-[#10B981]/5 rounded-full blur-[100px] pointer-events-none" />

        <h2 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-4">
          Master your{" "}
          <br />
          wealth with{" "}
          <span className="text-[#10B981]">AI-driven</span>{" "}
          precision.
        </h2>
        <p className="text-[#94A3B8] max-w-md leading-relaxed mb-12">
          Join 50,000+ investors using FinPilot to automate their financial growth and secure their future.
        </p>

        {/* Floating cards */}
        <div className="relative">
          <div className="rounded-xl border border-[#1F2937] bg-[#111827] p-4 w-48 animate-float">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-[#94A3B8]">Budget Score</p>
              <Zap className="w-4 h-4 text-[#10B981]" />
            </div>
            <p className="text-3xl font-bold text-white">854</p>
            <div className="mt-2 h-1.5 rounded-full bg-[#1F2937]">
              <div className="h-full w-[85%] rounded-full bg-[#10B981]" />
            </div>
          </div>

          <div className="absolute top-8 left-52 rounded-xl border border-[#1F2937] bg-[#111827] p-4 w-72 animate-float-delay">
            <p className="text-xs text-[#94A3B8] mb-2">Monthly Savings</p>
            <div className="flex items-end gap-[6px] h-24">
              {[30, 45, 35, 55, 50, 70, 65, 80].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t bg-gradient-to-t from-[#10B981]/30 to-[#10B981]"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>

          <div className="absolute top-32 left-10 rounded-xl border border-[#10B981]/20 bg-[#10B981]/5 p-3 max-w-[250px] animate-float">
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-[#10B981]/20 flex items-center justify-center shrink-0 mt-0.5">
                <Zap className="w-3 h-3 text-[#10B981]" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#10B981] mb-0.5">AI Suggestion</p>
                <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                  Shift &#8377;15,000 to &apos;Growth Fund&apos;. Predicted 4.2% yield increase.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right — Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 lg:px-12">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back 👋</h1>
          <p className="text-[#94A3B8] mb-8">Securely access your financial dashboard.</p>

          {/* Social auth */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: "Google", icon: "G" },
              { label: "Apple", icon: "🍎" },
              { label: "iOS", icon: "iOS" },
            ].map((provider) => (
              <button
                key={provider.label}
                className="flex items-center justify-center gap-2 py-3 rounded-xl border border-[#1F2937] bg-[#111827] text-sm text-[#94A3B8] hover:border-[#374151] hover:bg-[#162033] transition-all"
              >
                <span className="text-base">{provider.icon}</span>
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-[#1F2937]" />
            <span className="text-xs text-[#64748B] uppercase tracking-wider">Or Email</span>
            <div className="flex-1 h-px bg-[#1F2937]" />
          </div>

          {/* Form */}
          <form className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              placeholder="name@company.com"
              icon={<Mail className="w-4 h-4" />}
            />

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-white">Password</label>
                <Link href="/forgot-password" className="text-xs text-[#10B981] hover:text-[#059669] transition-colors">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#64748B]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-[#1F2937] bg-[#0F172A] pl-11 pr-11 py-3 text-sm text-white placeholder-[#64748B] focus:outline-none focus:border-[#10B981]/50 focus:ring-1 focus:ring-[#10B981]/20 hover:border-[#374151] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#64748B] hover:text-[#94A3B8]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded border-[#1F2937] bg-[#0F172A] text-[#10B981] focus:ring-[#10B981]/30" />
              <span className="text-sm text-[#94A3B8]">Remember me for 30 days</span>
            </label>

            <Button variant="primary" size="lg" className="w-full">
              Sign In
            </Button>
          </form>

          <p className="text-center text-sm text-[#94A3B8] mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-[#10B981] font-semibold hover:text-[#059669] transition-colors">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
