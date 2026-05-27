import React from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Left side – Marketing */}
      <div className="hidden lg:flex flex-1 flex-col justify-center px-12 xl:px-20 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute top-20 right-20 w-[300px] h-[300px] bg-[#10B981]/5 rounded-full blur-[100px] pointer-events-none" />
        <h2 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-4">
          Master your{' '}
          <br />
          wealth with{' '}
          <span className="text-[#10B981]">AI-driven</span>{' '}
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
              <svg className="w-4 h-4 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
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
                <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-[#10B981]/30 to-[#10B981]" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
          <div className="absolute top-32 left-10 rounded-xl border border-[#10B981]/20 bg-[#10B981]/5 p-3 max-w-[250px] animate-float">
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-[#10B981]/20 flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
              </div>
              <div>
                <p className="text-xs font-semibold text-[#10B981] mb-0.5">AI Suggestion</p>
                <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                  Shift &#8377;15,000 to &#39;Growth Fund&#39;. Predicted 4.2% yield increase.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Right side – Form/content */}
      <div className="flex-1 flex items-center justify-center px-6 lg:px-12">
        {children}
      </div>
    </div>
  );
}
