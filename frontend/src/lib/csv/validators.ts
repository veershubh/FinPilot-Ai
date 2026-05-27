import { ParsedTransaction } from './types';

/**
 * Validate a raw CSV row (as a plain object of strings) and return a list of errors.
 */
export function validateRow(row: Record<string, string>): string[] {
  const errors: string[] = [];
  // Date validation – must be a valid ISO date or recognizable format
  if (!row.date) {
    errors.push('Missing date');
  } else {
    const date = new Date(row.date);
    if (isNaN(date.getTime())) errors.push('Invalid date');
  }
  // Amount validation – must be a number
  if (!row.amount) {
    errors.push('Missing amount');
  } else if (isNaN(parseFloat(row.amount))) {
    errors.push('Amount is not a number');
  }
  // Description/merchant validation
  if (!row.description || row.description.trim() === '') {
    errors.push('Missing merchant/description');
  }
  // Type validation – should be debit or credit
  if (row.type && !['debit', 'credit', 'Dr', 'Cr', 'DR', 'CR'].includes(row.type)) {
    errors.push('Invalid transaction type');
  }
  return errors;
}

/**
 * Filter out completely empty rows (all fields blank).
 */
export function isEmptyRow(row: Record<string, string>): boolean {
  return Object.values(row).every(v => !v || v.trim() === '');
}
