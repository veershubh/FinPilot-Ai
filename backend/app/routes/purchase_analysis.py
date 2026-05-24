"""
FinPilot AI - Purchase Analysis Route
========================================
API endpoint for the EMI vs Full Payment Decision Engine.

This route acts as a thin controller layer:
  - Receives and validates the request (handled by Pydantic)
  - Delegates to the service layer for business logic
  - Returns the structured response

Architecture:
  Route (thin) → Service (logic) → Utils (calculations)
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse

from app.models.purchase import (
    PurchaseAnalysisRequest,
    PurchaseAnalysisResponse,
    ErrorResponse,
)
from app.services.purchase_service import analyze_purchase_decision


router = APIRouter(
    prefix="/api/v1",
    tags=["Purchase Analysis"],
    responses={
        400: {"model": ErrorResponse, "description": "Invalid input data"},
        500: {"model": ErrorResponse, "description": "Internal server error"},
    },
)


@router.post(
    "/analyze-purchase",
    response_model=PurchaseAnalysisResponse,
    summary="Analyze EMI vs Full Payment Decision",
    description=(
        "Submit your financial details and product information to receive "
        "an intelligent recommendation on whether to purchase via EMI, "
        "full payment, or delay the purchase. The engine calculates "
        "financial health scores, risk levels, and provides actionable tips."
    ),
)
async def analyze_purchase(request: PurchaseAnalysisRequest):
    """
    EMI vs Full Payment Decision Engine.

    Accepts user financial data, runs the decision engine, and returns
    a comprehensive analysis with recommendation, risk assessment,
    and financial health scoring.

    **Example Request:**
    ```json
    {
        "product_price": 80000,
        "monthly_income": 15000,
        "monthly_expenses": 9000,
        "current_savings": 95000,
        "emergency_fund": 20000,
        "emi_months": 12,
        "interest_rate": 12
    }
    ```
    """
    try:
        # Validate: expenses should not exceed income (warning, not blocking)
        if request.monthly_expenses > request.monthly_income:
            # We still process but the engine will handle this scenario
            pass

        # Validate: emergency fund should be within savings
        if request.emergency_fund > request.current_savings:
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "INVALID_EMERGENCY_FUND",
                    "message": (
                        "Emergency fund cannot exceed current savings. "
                        f"Emergency fund: ₹{request.emergency_fund:,.0f}, "
                        f"Savings: ₹{request.current_savings:,.0f}"
                    ),
                },
            )

        # Delegate to the service layer
        result = analyze_purchase_decision(
            product_price=request.product_price,
            monthly_income=request.monthly_income,
            monthly_expenses=request.monthly_expenses,
            current_savings=request.current_savings,
            emergency_fund=request.emergency_fund,
            emi_months=request.emi_months,
            interest_rate=request.interest_rate,
        )

        return result

    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise

    except Exception as e:
        # Catch unexpected errors and return a clean JSON response
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": "INTERNAL_ERROR",
                "message": "An unexpected error occurred while analyzing the purchase.",
                "details": str(e),
            },
        )
