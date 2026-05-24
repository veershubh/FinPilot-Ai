"""
FinPilot AI - Common Response Schemas
========================================
Reusable Pydantic models for standardized API responses.

These schemas ensure every API endpoint returns data in a consistent
format, making life easier for frontend developers who consume this API.

WHY STANDARDIZED RESPONSES?
────────────────────────────
Without a standard envelope, each endpoint returns a different shape.
With these schemas, the frontend always knows:
  - success/failure via `success` field
  - paginated lists via `PaginatedResponse`
  - validation errors via `ErrorDetail`
"""

from pydantic import BaseModel, Field
from typing import Any, Generic, List, Optional, TypeVar


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# GENERIC TYPE VARIABLE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# TypeVar allows us to make PaginatedResponse generic, so the `items`
# field can hold any type (e.g., List[User], List[PurchaseAnalysis], etc.)
T = TypeVar("T")


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SUCCESS RESPONSE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


class SuccessResponse(BaseModel):
    """
    Standard success response wrapper.

    Use this to wrap any successful API response so the frontend
    can always check `response.success` to determine outcome.

    Example:
        {
            "success": true,
            "message": "Purchase analysis completed successfully.",
            "data": { ... }
        }
    """

    success: bool = Field(
        default=True,
        description="Indicates whether the request was successful.",
    )
    message: str = Field(
        ...,
        description="Human-readable message describing the result.",
    )
    data: Optional[Any] = Field(
        default=None,
        description="The actual response payload. Can be any JSON-serializable object.",
    )

    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "message": "Purchase analysis completed successfully.",
                "data": {"recommendation": "EMI Preferred", "risk_level": "Low"},
            }
        }


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PAGINATED RESPONSE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


class PaginatedResponse(BaseModel, Generic[T]):
    """
    Standard paginated response for list endpoints.

    When an endpoint returns a list of items (e.g., transaction history),
    this schema adds pagination metadata so the frontend can implement
    "Load More" or page navigation.

    Example:
        {
            "items": [ ... ],
            "total": 150,
            "page": 1,
            "per_page": 20,
            "total_pages": 8
        }
    """

    items: List[T] = Field(
        ...,
        description="List of items for the current page.",
    )
    total: int = Field(
        ...,
        ge=0,
        description="Total number of items across all pages.",
    )
    page: int = Field(
        ...,
        ge=1,
        description="Current page number (1-indexed).",
    )
    per_page: int = Field(
        ...,
        ge=1,
        description="Number of items per page.",
    )
    total_pages: int = Field(
        ...,
        ge=0,
        description="Total number of pages available.",
    )

    class Config:
        json_schema_extra = {
            "example": {
                "items": [{"id": 1, "name": "Sample Item"}],
                "total": 150,
                "page": 1,
                "per_page": 20,
                "total_pages": 8,
            }
        }


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ERROR DETAIL
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


class ErrorDetail(BaseModel):
    """
    Detailed error information for a single field or validation issue.

    When a request fails validation, the API returns a list of these
    objects so the frontend can highlight exactly which fields have errors.

    Example:
        {
            "field": "monthly_income",
            "message": "Value must be greater than 0.",
            "error_type": "value_error"
        }
    """

    field: Optional[str] = Field(
        default=None,
        description="The field name that caused the error (None for general errors).",
    )
    message: str = Field(
        ...,
        description="Human-readable description of what went wrong.",
    )
    error_type: str = Field(
        ...,
        description="Machine-readable error type (e.g., 'value_error', 'missing').",
    )

    class Config:
        json_schema_extra = {
            "example": {
                "field": "monthly_income",
                "message": "Value must be greater than 0.",
                "error_type": "value_error",
            }
        }
