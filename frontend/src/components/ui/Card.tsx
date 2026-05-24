/**
 * FinPilot AI - Reusable Card Component
 */

import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className = "", hover = false }: CardProps) {
  return (
    <div
      className={`
        rounded-2xl border border-white/[0.06] bg-white/[0.03]
        backdrop-blur-xl shadow-lg
        ${hover ? "transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.05] hover:shadow-xl hover:-translate-y-0.5" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`px-6 pt-6 pb-2 ${className}`}>{children}</div>;
}

export function CardContent({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`px-6 pb-6 ${className}`}>{children}</div>;
}
