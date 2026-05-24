import Link from "next/link";
import { TrendingUp } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#050816]">
      {/* Top bar */}
      <header className="h-16 px-6 flex items-center justify-between border-b border-[#1F2937]/30 bg-[#050816]">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#10B981] flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-[#050816]" />
          </div>
          <span className="text-base font-bold text-[#10B981]">FinPilot AI</span>
        </Link>
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-lg text-[#64748B] hover:text-[#94A3B8] transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="1.5"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 16v-4m0-4h.01"/></svg>
          </button>
          <button className="p-2 rounded-lg text-[#64748B] hover:text-[#94A3B8] transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex">{children}</main>

      {/* Footer */}
      <footer className="h-14 px-6 flex items-center justify-between border-t border-[#1F2937]/30 text-xs text-[#64748B]">
        <p>&copy; {new Date().getFullYear()} FinPilot AI. Secure 256-bit AES Encryption.</p>
        <div className="flex gap-6">
          <Link href="#" className="hover:text-[#94A3B8] transition-colors">Privacy Policy</Link>
          <Link href="#" className="hover:text-[#94A3B8] transition-colors">Terms of Service</Link>
          <Link href="#" className="hover:text-[#94A3B8] transition-colors">Trust &amp; Security</Link>
        </div>
      </footer>
    </div>
  );
}
