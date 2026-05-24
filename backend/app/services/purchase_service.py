"""
FinPilot AI - Purchase Analysis Service
==========================================
Core business logic for the EMI vs Full Payment Decision Engine.

This service layer is completely independent of FastAPI — it takes
plain data, processes it, and returns a result dict. This makes it:
  - Easy to test
  - Reusable across different interfaces (API, CLI, etc.)
  - Clean and maintainable
"""

from typing import Dict, Any, List

from app.utils.financial import (
    calculate_emi,
    calculate_financial_health_score,
    determine_risk_level,
    calculate_savings_months_coverage,
    format_currency,
)


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# CONSTANTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Minimum months of expenses the emergency fund should cover
SAFE_EMERGENCY_MONTHS = 3

# Maximum healthy ratio of EMI to disposable income
MAX_SAFE_EMI_RATIO = 0.50

# Minimum savings-to-expense months ratio after full payment
MIN_SAFE_SAVINGS_MONTHS = 3


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# MAIN SERVICE FUNCTION
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


def analyze_purchase_decision(
    product_price: float,
    monthly_income: float,
    monthly_expenses: float,
    current_savings: float,
    emergency_fund: float,
    emi_months: int,
    interest_rate: float,
) -> Dict[str, Any]:
    """
    Analyze whether a user should purchase via EMI, full payment, or wait.

    This is the core decision engine that:
    1. Calculates all financial metrics
    2. Evaluates full payment viability
    3. Evaluates EMI affordability
    4. Generates a recommendation with reasoning

    Args:
        product_price:   Cost of the product.
        monthly_income:  User's monthly income.
        monthly_expenses: User's monthly expenses.
        current_savings: User's total savings.
        emergency_fund:  Emergency fund amount.
        emi_months:      EMI tenure in months.
        interest_rate:   Annual interest rate (%).

    Returns:
        Dictionary matching the PurchaseAnalysisResponse schema.
    """

    # ── Step 1: Calculate Core Financial Metrics ─────────────────

    disposable_income = monthly_income - monthly_expenses

    monthly_emi, total_emi_cost, interest_paid = calculate_emi(
        principal=product_price,
        annual_rate=interest_rate,
        tenure_months=emi_months,
    )

    savings_after_full_payment = current_savings - product_price

    # Ratios
    emi_to_income_ratio = round(
        (monthly_emi / monthly_income * 100) if monthly_income > 0 else 100, 2
    )
    emi_to_disposable_ratio = round(
        (monthly_emi / disposable_income * 100) if disposable_income > 0 else 999, 2
    )

    # ── Step 2: Evaluate Full Payment Scenario ───────────────────

    can_afford_full_payment = savings_after_full_payment >= 0

    full_payment_safe = False
    if can_afford_full_payment:
        # Check if remaining savings still cover emergencies
        savings_months = calculate_savings_months_coverage(
            savings_after_full_payment, monthly_expenses
        )
        emergency_intact = savings_after_full_payment >= emergency_fund
        full_payment_safe = (
            savings_months >= MIN_SAFE_SAVINGS_MONTHS and emergency_intact
        )

    # ── Step 3: Evaluate EMI Scenario ────────────────────────────

    emi_affordable = (
        disposable_income > 0
        and (monthly_emi / disposable_income) <= MAX_SAFE_EMI_RATIO
    )
    emi_within_income = monthly_emi <= disposable_income

    # ── Step 4: Make Decision ────────────────────────────────────

    recommendation, reasons, tips = _make_decision(
        product_price=product_price,
        monthly_income=monthly_income,
        monthly_expenses=monthly_expenses,
        disposable_income=disposable_income,
        current_savings=current_savings,
        emergency_fund=emergency_fund,
        monthly_emi=monthly_emi,
        total_emi_cost=total_emi_cost,
        interest_paid=interest_paid,
        savings_after_full_payment=savings_after_full_payment,
        can_afford_full_payment=can_afford_full_payment,
        full_payment_safe=full_payment_safe,
        emi_affordable=emi_affordable,
        emi_within_income=emi_within_income,
        emi_months=emi_months,
    )

    # ── Step 5: Calculate Health Score & Risk ─────────────────────

    health_score = calculate_financial_health_score(
        disposable_income=disposable_income,
        monthly_emi=monthly_emi,
        savings_after_purchase=savings_after_full_payment,
        emergency_fund=emergency_fund,
        monthly_expenses=monthly_expenses,
    )
    risk_level = determine_risk_level(health_score)

    # Determine remaining savings based on recommendation
    if "Full Payment" in recommendation:
        remaining_savings = savings_after_full_payment
    else:
        remaining_savings = current_savings

    # ── Step 6: Build Response ───────────────────────────────────

    return {
        "recommendation": recommendation,
        "risk_level": risk_level,
        "monthly_emi": monthly_emi,
        "remaining_savings": round(remaining_savings, 2),
        "financial_health_score": health_score,
        "reason": reasons[0] if reasons else "Analysis complete.",
        "detailed_reasons": reasons,
        "financial_breakdown": {
            "monthly_disposable_income": round(disposable_income, 2),
            "estimated_monthly_emi": monthly_emi,
            "total_emi_cost": total_emi_cost,
            "interest_paid": interest_paid,
            "savings_after_full_payment": round(savings_after_full_payment, 2),
            "emi_to_income_ratio": emi_to_income_ratio,
            "emi_to_disposable_ratio": emi_to_disposable_ratio,
        },
        "tips": tips,
    }


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# DECISION ENGINE (Private)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


def _make_decision(
    product_price: float,
    monthly_income: float,
    monthly_expenses: float,
    disposable_income: float,
    current_savings: float,
    emergency_fund: float,
    monthly_emi: float,
    total_emi_cost: float,
    interest_paid: float,
    savings_after_full_payment: float,
    can_afford_full_payment: bool,
    full_payment_safe: bool,
    emi_affordable: bool,
    emi_within_income: bool,
    emi_months: int,
) -> tuple:
    """
    Internal decision logic that generates the recommendation,
    reasoning list, and financial tips.

    Returns:
        Tuple of (recommendation_str, reasons_list, tips_list).
    """
    reasons: List[str] = []
    tips: List[str] = []

    # ── Scenario A: Full Payment is Safe ─────────────────────────
    if can_afford_full_payment and full_payment_safe:
        recommendation = "Full Payment Recommended"
        reasons.append(
            f"You can afford the full payment of {format_currency(product_price)} "
            f"and still retain {format_currency(savings_after_full_payment)} in savings."
        )
        reasons.append(
            f"Your emergency fund of {format_currency(emergency_fund)} remains intact."
        )
        reasons.append(
            f"Full payment saves you {format_currency(interest_paid)} in interest charges."
        )

        # Extra insight
        if interest_paid > 0:
            tips.append(
                f"By paying in full, you avoid paying {format_currency(interest_paid)} "
                f"in interest over {emi_months} months."
            )
        tips.append(
            "Consider investing the amount you'd have paid as EMI for additional returns."
        )

    # ── Scenario B: EMI is the Safer Option ──────────────────────
    elif emi_within_income and emi_affordable:
        recommendation = "EMI Preferred"
        reasons.append(
            "EMI preserves emergency liquidity and maintains financial stability."
        )

        if can_afford_full_payment and not full_payment_safe:
            reasons.append(
                f"Full payment would reduce savings to {format_currency(savings_after_full_payment)}, "
                f"which is below the safe emergency threshold."
            )

        reasons.append(
            f"Monthly EMI of {format_currency(monthly_emi)} is "
            f"{round(monthly_emi / disposable_income * 100, 1)}% of your disposable income — manageable."
        )
        reasons.append(
            f"Your emergency fund of {format_currency(emergency_fund)} stays untouched with EMI."
        )

        tips.append(
            "Look for 0% interest or no-cost EMI options to minimize extra costs."
        )
        tips.append(
            f"You'll pay {format_currency(interest_paid)} extra in interest — "
            f"negotiate for a lower rate if possible."
        )
        if disposable_income - monthly_emi > 0:
            tips.append(
                f"After EMI, you'll have {format_currency(disposable_income - monthly_emi)} "
                f"monthly disposable income remaining."
            )

    # ── Scenario C: Both Options Are Risky ───────────────────────
    elif emi_within_income and not emi_affordable:
        recommendation = "EMI Preferred"
        reasons.append(
            f"EMI of {format_currency(monthly_emi)} fits within your disposable income "
            f"but uses a high portion ({round(monthly_emi / disposable_income * 100, 1)}%)."
        )
        reasons.append(
            "This purchase will put moderate strain on your monthly budget."
        )
        if not can_afford_full_payment:
            reasons.append(
                "Full payment is not possible — insufficient savings."
            )
        elif not full_payment_safe:
            reasons.append(
                f"Full payment would leave only {format_currency(savings_after_full_payment)} "
                f"in savings, which is financially risky."
            )

        tips.append(
            "Consider postponing the purchase until you have a larger savings cushion."
        )
        tips.append("Try to negotiate a longer EMI tenure to reduce monthly burden.")
        tips.append(
            f"Building an emergency fund of {format_currency(monthly_expenses * 6)} "
            f"(6 months of expenses) is recommended before large purchases."
        )

    # ── Scenario D: Delay Purchase ───────────────────────────────
    else:
        recommendation = "Delay Purchase"

        if not can_afford_full_payment:
            reasons.append(
                f"Your savings of {format_currency(current_savings)} are insufficient "
                f"for the full payment of {format_currency(product_price)}."
            )

        if not emi_within_income:
            reasons.append(
                f"Monthly EMI of {format_currency(monthly_emi)} exceeds your "
                f"disposable income of {format_currency(disposable_income)}."
            )

        if disposable_income <= 0:
            reasons.append(
                "Your expenses already meet or exceed your income — "
                "additional commitments are not advisable."
            )

        reasons.append(
            "Both EMI and full payment options pose significant financial risk."
        )

        tips.append(
            "Focus on increasing your savings before making this purchase."
        )
        tips.append(
            f"Target saving at least {format_currency(product_price * 0.3)} "
            f"(30% of product price) as a down payment buffer."
        )
        tips.append(
            "Review your monthly expenses for potential areas to cut costs."
        )
        tips.append(
            "Consider a more affordable alternative or wait for a sale/discount."
        )

    return recommendation, reasons, tips
