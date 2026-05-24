import React from "react";

interface PageWrapperProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function PageWrapper({ children, title, subtitle }: PageWrapperProps) {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-[#94A3B8]">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
