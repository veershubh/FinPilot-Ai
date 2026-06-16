import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  variant?: "solid" | "glass" | "elevated";
  glow?: "none" | "green" | "violet" | "blue" | "amber";
  noPadding?: boolean;
}

export function Card({
  children,
  className = "",
  hover = false,
  variant = "solid",
  glow = "none",
  noPadding = false,
}: CardProps) {
  const variantStyles = {
    solid: "bg-[#111827] border border-[#1F2937]",
    glass: "bg-[#111827]/60 backdrop-blur-xl border border-[#1F2937]",
    elevated: "bg-gradient-to-br from-[#111827] to-[#0B1020] border border-[#1F2937]",
  };

  const glowStyles = {
    none: "",
    green: "glow-green-subtle",
    violet: "glow-violet",
    blue: "glow-blue",
    amber: "glow-amber",
  };

  return (
    <div
      className={`
        rounded-2xl
        ${variantStyles[variant]}
        ${glowStyles[glow]}
        ${hover ? "transition-all duration-300 hover:border-[#374151] hover:bg-[#162033] hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/20 cursor-pointer" : ""}
        ${noPadding ? "" : ""}
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
