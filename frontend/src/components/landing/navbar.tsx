// src/components/landing/navbar.tsx
// Responsive landing page navigation bar.

'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export function LandingNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();

  // Check auth status client‑side for button rendering
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    fetchUser();
  }, []);

  const handleGetStarted = async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#050816]/90 backdrop-blur-xl border-b border-[#1F2937]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#10B981] flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-[#050816]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2" />
            </svg>
          </div>
          <span className="text-xl font-bold text-[#10B981]">FinPilot AI</span>
        </Link>
        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/" className="text-[#94A3B8] hover:text-white transition">
            Home
          </Link>
          <button
            onClick={handleGetStarted}
            className="px-4 py-2 bg-[#10B981] text-white rounded hover:bg-[#0f9e6e] transition"
          >
            Get Started
          </button>
          <Link
            href="/login"
            className="px-4 py-2 border border-[#1F2937] text-[#94A3B8] rounded hover:bg-white/5 transition"
          >
            Log In
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
        <div className="md:hidden bg-[#0B1020] border-t border-[#1F2937] px-6 py-4 space-y-3">
          <Link href="/" className="block text-[#94A3B8] hover:text-white" onClick={() => setMobileOpen(false)}>
            Home
          </Link>
          <button
            onClick={() => {
              setMobileOpen(false);
              handleGetStarted();
            }}
            className="w-full text-left px-4 py-2 bg-[#10B981] text-white rounded"
          >
            Get Started
          </button>
          <Link href="/login" className="block text-[#94A3B8] hover:text-white" onClick={() => setMobileOpen(false)}>
            Log In
          </Link>
        </div>
      )}
    </nav>
  );
}
