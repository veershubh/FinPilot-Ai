/**
 * FinPilot AI - Reusable Input Component
 */

import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
  hint?: string;
}

export function Input({ label, icon, hint, className = "", id, ...props }: InputProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-1.5">
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-300">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={`
            w-full rounded-xl border border-white/[0.08] bg-white/[0.04]
            px-4 py-2.5 text-sm text-white placeholder-gray-500
            transition-all duration-200
            focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30
            focus:bg-white/[0.06]
            ${icon ? "pl-10" : ""}
            ${className}
          `}
          {...props}
        />
      </div>
      {hint && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  );
}
