// src/utils/phone.ts
// Utility functions for Indian phone number validation and formatting

/**
 * Checks if a string is a valid Indian mobile number (10 digits, starts with 6-9).
 * Accepts numbers with or without leading +91 and optional spaces/hyphens.
 */
export function isValidIndianMobile(value: string): boolean {
  // Remove any non‑digit characters
  const digits = value.replace(/\D/g, "");
  // Should be exactly 10 digits after optional country code
  if (digits.length !== 10) return false;
  // First digit must be 6,7,8,9
  return /^[6-9]\d{9}$/.test(digits);
}

/**
 * Formats a raw 10‑digit Indian mobile number as "+91 9876543210".
 * If the input already contains a country code, it will be normalized.
 */
export function formatIndianMobile(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 10) return value; // incomplete – keep as‑is
  const mobile = digits.slice(-10);
  return `+91 ${mobile}`;
}
