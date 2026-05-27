// src/types/insights.ts

/**
 * Types for AI insights payloads and results.
 */
export interface InsightPayload {
  // Generic payload – each insight type defines its own shape.
  [key: string]: any;
}

export type InsightType =
  | 'spending'
  | 'savings'
  | 'emi'
  | 'recommendations'
  | 'health';

// The streamed result is plain text, but we expose a wrapper for consistency.
export interface InsightResult {
  type: InsightType;
  content: string; // concatenated streamed chunks
}
