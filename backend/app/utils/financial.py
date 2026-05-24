"""
FinPilot AI - Financial Utility Functions
============================================
Reusable utility functions for financial calculations.

These functions are pure (no side effects) and can be
unit-tested independently.
"""

import math
from typing import Tuple


def calculate_emi(
    principal: float, annual_rate: float, tenure_months: int
) -> Tuple[float, float, float]:
    """
    Calculate EMI using the standard reducing balance formula.

    Formula:
        EMI = P × r × (1 + r)^n / ((1 + r)^n - 1)

    Where:
        P = Principal loan amount
        r = Monthly interest rate (annual_rate / 12 / 100)
        n = Number of monthly installments

    Args:
        principal:      The loan / product amount (in ₹).
        annual_rate:    Annual interest rate (in %, e.g., 12 for 12%).
        tenure_months:  Number of EMI months.

    Returns:
        Tuple of (monthly_emi, total_payment, total_interest).
    """
    if annual_rate == 0:
        # Zero-interest EMI (e.g., no-cost EMI offers)
        monthly_emi = principal / tenure_months
        return round(monthly_emi, 2), round(principal, 2), 0.0

    # Convert annual rate to monthly decimal rate
    monthly_rate = annual_rate / 12 / 100

    # Standard EMI formula
    power = math.pow(1 + monthly_rate, tenure_months)
    monthly_emi = principal * monthly_rate * power / (power - 1)

    total_payment = monthly_emi * tenure_months
    total_interest = total_payment - principal

    return (
        round(monthly_emi, 2),
        round(total_payment, 2),
        round(total_interest, 2),
    )


def calculate_financial_health_score(
    disposable_income: float,
    monthly_emi: float,
    savings_after_purchase: float,
    emergency_fund: float,
    monthly_expenses: float,
) -> int:
    """
    Calculate a financial health score from 0 to 100.

    The score is a weighted composite of four sub-scores:

    1. **Savings Safety (30%)** — How many months of expenses
       can the user survive on remaining savings?
    2. **EMI Affordability (30%)** — What fraction of disposable
       income is consumed by the EMI?
    3. **Emergency Fund Adequacy (20%)** — Does the emergency
       fund cover at least 3–6 months of expenses?
    4. **Disposable Income Health (20%)** — Ratio of disposable
       income to total income (higher is better).

    Args:
        disposable_income:      Monthly income minus expenses.
        monthly_emi:            Estimated monthly EMI.
        savings_after_purchase: Savings left after full payment.
        emergency_fund:         Emergency fund amount.
        monthly_expenses:       Monthly expenses.

    Returns:
        An integer score between 0 and 100.
    """
    # ── 1. Savings Safety Score (30 points) ──────────────────────
    if monthly_expenses > 0:
        months_covered = savings_after_purchase / monthly_expenses
        savings_score = min(months_covered / 6 * 30, 30)
    else:
        savings_score = 30  # No expenses = safe

    # ── 2. EMI Affordability Score (30 points) ───────────────────
    if disposable_income > 0:
        emi_ratio = monthly_emi / disposable_income
        if emi_ratio <= 0.3:
            emi_score = 30          # Very comfortable
        elif emi_ratio <= 0.5:
            emi_score = 22          # Manageable
        elif emi_ratio <= 0.7:
            emi_score = 14          # Tight but possible
        elif emi_ratio <= 1.0:
            emi_score = 7           # Risky
        else:
            emi_score = 0           # EMI exceeds disposable income
    else:
        emi_score = 0

    # ── 3. Emergency Fund Adequacy Score (20 points) ─────────────
    if monthly_expenses > 0:
        ef_months = emergency_fund / monthly_expenses
        ef_score = min(ef_months / 6 * 20, 20)
    else:
        ef_score = 20

    # ── 4. Disposable Income Health (20 points) ──────────────────
    if disposable_income > 0:
        income_health = min(disposable_income / (disposable_income + monthly_expenses) * 20, 20)
    else:
        income_health = 0

    total_score = savings_score + emi_score + ef_score + income_health
    return max(0, min(100, round(total_score)))


def determine_risk_level(health_score: int) -> str:
    """
    Map a financial health score to a human-readable risk level.

    Args:
        health_score: Financial health score (0–100).

    Returns:
        'Low', 'Medium', or 'High'.
    """
    if health_score >= 70:
        return "Low"
    elif health_score >= 40:
        return "Medium"
    else:
        return "High"


def calculate_savings_months_coverage(
    savings: float, monthly_expenses: float
) -> float:
    """
    How many months of expenses can the given savings cover?

    Args:
        savings:          Total available savings.
        monthly_expenses: Monthly expense amount.

    Returns:
        Number of months the savings can sustain.
    """
    if monthly_expenses <= 0:
        return float("inf")
    return round(savings / monthly_expenses, 2)


def format_currency(amount: float) -> str:
    """
    Format a number as Indian Rupee currency string.

    Args:
        amount: Numeric amount.

    Returns:
        Formatted string, e.g. '₹80,000.00'.
    """
    return f"₹{amount:,.2f}"
