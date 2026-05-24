"""
FinPilot AI - Pydantic Models for Purchase Analysis
======================================================
These models define the request and response schemas for the
EMI vs Full Payment Decision Engine endpoint.

Pydantic models provide:
  - Automatic input validation
  - Type checking
  - JSON serialization
  - Self-documenting API schemas (shown in Swagger UI)
"""

from pydantic import BaseModel, Field
from typing import List, Optional


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# REQUEST MODELS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


class PurchaseAnalysisRequest(BaseModel):
    """
    Input data for analyzing a purchase decision.

    The user provides their financial details and the product they
    want to purchase. The engine then evaluates whether EMI or
    full payment is the smarter choice.
    """

    product_price: float = Field(
        ...,
        gt=0,
        description="Total price of the product the user wants to buy (in ₹).",
        json_schema_extra={"example": 80000},
    )
    monthly_income: float = Field(
        ...,
        gt=0,
        description="User's total monthly income (in ₹).",
        json_schema_extra={"example": 15000},
    )
    monthly_expenses: float = Field(
        ...,
        ge=0,
        description="User's total monthly expenses (in ₹).",
        json_schema_extra={"example": 9000},
    )
    current_savings: float = Field(
        ...,
        ge=0,
        description="User's current total savings (in ₹).",
        json_schema_extra={"example": 95000},
    )
    emergency_fund: float = Field(
        ...,
        ge=0,
        description="Amount set aside as emergency fund (in ₹).",
        json_schema_extra={"example": 20000},
    )
    emi_months: int = Field(
        ...,
        gt=0,
        le=360,
        description="Number of months for EMI tenure.",
        json_schema_extra={"example": 12},
    )
    interest_rate: float = Field(
        ...,
        ge=0,
        le=100,
        description="Annual interest rate for EMI (in %).",
        json_schema_extra={"example": 12},
    )

    class Config:
        json_schema_extra = {
            "example": {
                "product_price": 80000,
                "monthly_income": 15000,
                "monthly_expenses": 9000,
                "current_savings": 95000,
                "emergency_fund": 20000,
                "emi_months": 12,
                "interest_rate": 12,
            }
        }


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# RESPONSE MODELS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


class FinancialBreakdown(BaseModel):
    """Detailed breakdown of the user's financial calculations."""

    monthly_disposable_income: float = Field(
        ..., description="Income minus expenses — what's left each month."
    )
    estimated_monthly_emi: float = Field(
        ..., description="Calculated monthly EMI amount (in ₹)."
    )
    total_emi_cost: float = Field(
        ..., description="Total amount paid over the EMI tenure (in ₹)."
    )
    interest_paid: float = Field(
        ..., description="Total interest paid over the EMI tenure (in ₹)."
    )
    savings_after_full_payment: float = Field(
        ..., description="Savings remaining after a full payment (in ₹)."
    )
    emi_to_income_ratio: float = Field(
        ..., description="EMI as a percentage of monthly income (%)."
    )
    emi_to_disposable_ratio: float = Field(
        ..., description="EMI as a percentage of disposable income (%)."
    )


class PurchaseAnalysisResponse(BaseModel):
    """
    Complete analysis result returned to the user.

    Contains the recommendation, risk assessment, financial
    health score, detailed breakdown, and reasoning.
    """

    recommendation: str = Field(
        ...,
        description="One of: 'Full Payment Recommended', 'EMI Preferred', or 'Delay Purchase'.",
    )
    risk_level: str = Field(
        ..., description="Risk assessment: 'Low', 'Medium', or 'High'."
    )
    monthly_emi: float = Field(
        ..., description="Estimated monthly EMI amount (in ₹)."
    )
    remaining_savings: float = Field(
        ..., description="Savings remaining after the recommended action (in ₹)."
    )
    financial_health_score: int = Field(
        ...,
        ge=0,
        le=100,
        description="Overall financial health score (0–100).",
    )
    reason: str = Field(
        ..., description="Primary reason for the recommendation."
    )
    detailed_reasons: List[str] = Field(
        default_factory=list,
        description="List of detailed reasoning points.",
    )
    financial_breakdown: FinancialBreakdown = Field(
        ..., description="Complete financial calculation breakdown."
    )
    tips: List[str] = Field(
        default_factory=list,
        description="Actionable financial tips for the user.",
    )

    class Config:
        json_schema_extra = {
            "example": {
                "recommendation": "EMI Preferred",
                "risk_level": "Low",
                "monthly_emi": 7105,
                "remaining_savings": 95000,
                "financial_health_score": 78,
                "reason": "EMI preserves emergency liquidity and maintains financial stability.",
                "detailed_reasons": [
                    "Full payment would reduce savings to ₹15,000, which is below safe emergency threshold.",
                    "Monthly EMI of ₹7,105 is 47.4% of disposable income — manageable.",
                    "Your emergency fund of ₹20,000 remains untouched with EMI.",
                ],
                "financial_breakdown": {
                    "monthly_disposable_income": 6000,
                    "estimated_monthly_emi": 7105,
                    "total_emi_cost": 85260,
                    "interest_paid": 5260,
                    "savings_after_full_payment": 15000,
                    "emi_to_income_ratio": 47.37,
                    "emi_to_disposable_ratio": 118.42,
                },
                "tips": [
                    "Consider increasing your emergency fund to cover 6 months of expenses.",
                    "Look for 0% interest EMI options to avoid paying extra.",
                ],
            }
        }


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ERROR RESPONSE MODEL
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


class ErrorResponse(BaseModel):
    """Standard error response format."""

    success: bool = Field(default=False, description="Always False for errors.")
    error: str = Field(..., description="Error type or code.")
    message: str = Field(..., description="Human-readable error message.")
    details: Optional[str] = Field(
        default=None, description="Additional error context."
    )
