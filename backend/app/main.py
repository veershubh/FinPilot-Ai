"""
FinPilot AI - Main Application Entry Point
=============================================
This module creates and configures the FastAPI application instance.
It sets up middleware, includes routers, and defines application metadata.

Run the server:
    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routes import health, purchase_analysis


# ── Create FastAPI Application ────────────────────────────────────────────────

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "🚀 FinPilot AI - Your Intelligent Financial Co-Pilot.\n\n"
        "FinPilot AI helps users make smarter financial decisions by analyzing\n"
        "purchases, EMI options, budgets, and financial goals using intelligent\n"
        "decision engines and AI agents.\n\n"
        "**Key Features:**\n"
        "- EMI vs Full Payment Decision Engine\n"
        "- Financial Health Scoring\n"
        "- Risk Assessment\n"
        "- Budget Analysis (coming soon)\n"
        "- AI-Powered Goal Planning (coming soon)"
    ),
    docs_url="/docs",          # Swagger UI
    redoc_url="/redoc",        # ReDoc
    openapi_url="/openapi.json",
)


# ── CORS Middleware ───────────────────────────────────────────────────────────
# Allows the frontend (running on a different port) to communicate with the API.

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],       # Allow all HTTP methods
    allow_headers=["*"],       # Allow all headers
)


# ── Include Routers ──────────────────────────────────────────────────────────
# Each router handles a specific group of API endpoints.

app.include_router(health.router)
app.include_router(purchase_analysis.router)


# ── Root Endpoint ─────────────────────────────────────────────────────────────

@app.get("/", tags=["Root"])
async def root():
    """
    Root endpoint - Welcome message and API information.
    
    Returns a friendly JSON response with basic API details
    and links to documentation.
    """
    return {
        "message": f"Welcome to {settings.APP_NAME} 🚀",
        "version": settings.APP_VERSION,
        "environment": settings.APP_ENV,
        "docs": "/docs",
        "health": "/health",
        "endpoints": {
            "analyze_purchase": "POST /api/v1/analyze-purchase",
            "health_check": "GET /health",
        },
    }
