/**
 * FinPilot AI - API Service
 * ============================
 * Centralized API client for communicating with the FastAPI backend.
 * All backend calls go through this module.
 */

import type { PurchaseAnalysisRequest, PurchaseAnalysisResponse } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Generic fetch wrapper with error handling.
 */
async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData?.detail?.message ||
        errorData?.message ||
        `API Error: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

/**
 * Check backend health status.
 */
export async function checkHealth() {
  return apiRequest<{ status: string; app_name: string; version: string }>(
    "/health"
  );
}

/**
 * Analyze a purchase — EMI vs Full Payment decision.
 */
export async function analyzePurchase(
  data: PurchaseAnalysisRequest
): Promise<PurchaseAnalysisResponse> {
  return apiRequest<PurchaseAnalysisResponse>("/api/v1/analyze-purchase", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
