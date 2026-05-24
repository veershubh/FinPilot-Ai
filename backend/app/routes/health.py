"""
FinPilot AI - Health Check Route
===================================
Simple health check endpoint for monitoring and uptime verification.
"""

from fastapi import APIRouter
from datetime import datetime, timezone

from app.config import settings


router = APIRouter(tags=["Health"])


@router.get("/health")
async def health_check():
    """
    Health check endpoint.

    Returns the current status of the API server along with
    application metadata. Useful for load balancers, monitoring
    tools, and deployment health checks.
    """
    return {
        "status": "healthy",
        "app_name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.APP_ENV,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
