// src/lib/utils.ts
// Utility helpers for the FinPilot AI project.

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * cn – combine class names with Tailwind merging.
 * Usage: cn('p-2', condition && 'bg-red-500')
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(...inputs));
}

/**
 * Simple fade-in animation variant for Framer Motion components.
 */
export const fadeInVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: (custom: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: custom * 0.1, duration: 0.5 },
  }),
};

/**
 * Helper to format numbers with commas and optional currency.
 */
export function formatCurrency(value: number, currency = '₹') {
  return `${currency}${value.toLocaleString('en-IN')}`;
}
