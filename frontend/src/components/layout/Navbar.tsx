"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { TrendingUp, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

const navLinks = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Advisor", href: "/emi-analyzer" },
  { label: "Markets", href: "/insights" },
  { label: "Intelligence", href: "/ai-chat" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#1F2937]/50 bg-[#050816]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-[#10B981] flex items-center justify-center group-hover:shadow-lg group-hover:shadow-[#10B981]/30 transition-shadow">
            <TrendingUp className="w-4.5 h-4.5 text-[#050816]" />
          </div>
          <span className="text-lg font-bold text-[#10B981]">FinPilot AI</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "text-[#10B981] bg-[#10B981]/10"
                    : "text-[#94A3B8] hover:text-white hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">Log in</Button>
          </Link>
          <Link href="/signup">
            <Button variant="primary" size="sm">Get Started</Button>
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 text-[#94A3B8] hover:text-white"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#1F2937] bg-[#0B1020] px-6 py-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block px-4 py-2.5 rounded-lg text-sm text-[#94A3B8] hover:text-white hover:bg-white/5"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-[#1F2937] flex gap-3">
            <Link href="/login" className="flex-1">
              <Button variant="secondary" size="sm" className="w-full">Log in</Button>
            </Link>
            <Link href="/signup" className="flex-1">
              <Button variant="primary" size="sm" className="w-full">Get Started</Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
