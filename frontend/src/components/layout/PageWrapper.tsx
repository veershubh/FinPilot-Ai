import React from "react";

interface PageWrapperProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  badge?: string;
}

export function PageWrapper({ children, title, subtitle, badge }: PageWrapperProps) {
  return (
    <div className="relative p-8 dashboard-bg">
      <div className="relative z-10">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            {badge && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#10B981]/20 bg-[#10B981]/5 text-[10px] font-semibold text-[#10B981] uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                {badge}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-[#94A3B8]">{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}
