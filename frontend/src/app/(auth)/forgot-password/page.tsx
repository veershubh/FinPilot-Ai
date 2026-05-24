"use client";

import React from "react";
import Link from "next/link";
import { Mail, ArrowLeft, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function ForgotPasswordPage() {
  return (
    <div className="flex-1 flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="rounded-2xl border border-[#1F2937] bg-[#111827] p-8 shadow-2xl">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full border-2 border-[#1F2937] bg-[#0B1020] flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-[#10B981]" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-white text-center mb-2">Forgot Password?</h1>
          <p className="text-sm text-[#94A3B8] text-center mb-8">
            Enter your email to receive a reset link.
          </p>

          <form className="space-y-5">
            <Input
              label="Email"
              type="email"
              placeholder="name@company.com"
              icon={<Mail className="w-4 h-4" />}
            />

            <Button variant="primary" size="lg" className="w-full">
              Send Reset Link
            </Button>
          </form>

          <Link
            href="/login"
            className="flex items-center justify-center gap-2 mt-6 text-sm text-[#94A3B8] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </div>

        {/* Security badges */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#10B981]/20 bg-[#10B981]/5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
            <span className="text-xs text-[#10B981]">Verified Secure</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#10B981]/20 bg-[#10B981]/5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
            <span className="text-xs text-[#10B981]">AES-256</span>
          </div>
        </div>
      </div>
    </div>
  );
}
