import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  hint?: string;
  error?: string;
}

export function Input({ label, icon, hint, error, className = "", id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-white">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#64748B]">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={`
            w-full rounded-xl border border-[#1F2937] bg-[#0F172A]
            px-4 py-3 text-sm text-white placeholder-[#64748B]
            transition-all duration-200
            focus:outline-none focus:border-[#10B981]/50 focus:ring-1 focus:ring-[#10B981]/20
            hover:border-[#374151]
            ${icon ? "pl-11" : ""}
            ${error ? "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20" : ""}
            ${className}
          `}
          {...props}
        />
      </div>
      {hint && !error && <p className="text-xs text-[#64748B]">{hint}</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
