import React from "react";
import Link from "next/link";
import { TrendingUp } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-[#1F2937] bg-[#050816]">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-[#10B981] flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-[#050816]" />
              </div>
              <span className="text-base font-bold text-[#10B981]">FinPilot AI</span>
            </Link>
            <p className="text-sm text-[#64748B] leading-relaxed">
              AI-powered financial intelligence built for the next generation of wealth builders.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Platform</h4>
            <ul className="space-y-2.5">
              {["Dashboard", "EMI Analyzer", "Budget Planner", "AI Chat"].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-sm text-[#64748B] hover:text-[#10B981] transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-2.5">
              {["Privacy Policy", "Terms of Service", "API Documentation", "Contact Support"].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-sm text-[#64748B] hover:text-[#10B981] transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Stay Updated */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Stay Updated</h4>
            <p className="text-sm text-[#64748B] mb-3">Get the latest features and updates.</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 rounded-lg border border-[#1F2937] bg-[#0F172A] px-3 py-2 text-sm text-white placeholder-[#64748B] focus:outline-none focus:border-[#10B981]/50"
              />
              <button className="px-4 py-2 rounded-lg bg-[#10B981] text-[#050816] text-sm font-semibold hover:bg-[#059669] transition-colors">
                Go
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-[#1F2937] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#64748B]">
            &copy; {new Date().getFullYear()} FinPilot AI. Secure 256-bit AES Encryption.
          </p>
          <div className="flex items-center gap-6">
            {["Privacy Policy", "Terms of Service", "Trust & Security"].map((item) => (
              <Link key={item} href="#" className="text-xs text-[#64748B] hover:text-[#94A3B8] transition-colors">
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
