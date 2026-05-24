"""
FinPilot AI - Main Application Entry Point
=============================================
This module creates and configures the FastAPI application instance.
It sets up middleware, includes routers, registers AI agents,
and defines application metadata.

Run the server:
    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routes import health, purchase_analysis
from app.middleware.request_logger import RequestLoggerMiddleware
from app.middleware.rate_limiter import RateLimiterMiddleware

# ── AI Agent Imports ──────────────────────────────────────────────────────────

from app.ai_agents.agent_orchestrator import AgentOrchestrator
from app.ai_agents.emi_decision_agent import EMIDecisionAgent
from app.ai_agents.budget_agent import BudgetAgent
from app.ai_agents.risk_agent import RiskAgent
from app.ai_agents.goal_agent import GoalAgent
from app.ai_agents.expense_agent import ExpenseAgent
from app.ai_agents.chat_agent import ChatAgent


# ── Agent Orchestrator Singleton ──────────────────────────────────────────────
# Create a global orchestrator instance that all routes can access.

orchestrator = AgentOrchestrator()


# ── Application Lifespan ─────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.

    Runs setup tasks on startup (register agents, connect DB, etc.)
    and teardown tasks on shutdown (close connections, flush logs, etc.)
    """
    # ── STARTUP ───────────────────────────────────────────────────
    print(f"\n>> {settings.APP_NAME} v{settings.APP_VERSION} starting up...")

    # Register all AI agents with the orchestrator
    orchestrator.register_agent("emi_decision", EMIDecisionAgent())
    orchestrator.register_agent("budget", BudgetAgent())
    orchestrator.register_agent("risk", RiskAgent())
    orchestrator.register_agent("goal", GoalAgent())
    orchestrator.register_agent("expense", ExpenseAgent())
    orchestrator.register_agent("chat", ChatAgent())

    print(f"   Registered {orchestrator.agent_count} AI agents")
    print(f"   Environment: {settings.APP_ENV}")
    print(f"   API Docs: http://localhost:{settings.PORT}/docs\n")

    yield  # Application runs here

    # ── SHUTDOWN ──────────────────────────────────────────────────
    print(f"\n>> {settings.APP_NAME} shutting down...")


# ── Create FastAPI Application ────────────────────────────────────────────────

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "FinPilot AI - Your Intelligent Financial Co-Pilot.\n\n"
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
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)


# ── Middleware Stack ──────────────────────────────────────────────────────────
# Order matters: middleware is executed in reverse order of registration.
# So the first added middleware runs outermost (first on request, last on response).

# 1. CORS — must be outermost so preflight requests work
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Request Logger — logs every request with timing
app.add_middleware(RequestLoggerMiddleware)

# 3. Rate Limiter — protects against abuse (60 req/min per IP)
app.add_middleware(RateLimiterMiddleware, max_requests=60, window_seconds=60)


# ── Include Routers ──────────────────────────────────────────────────────────

app.include_router(health.router)
app.include_router(purchase_analysis.router)


# ── Root Endpoint ─────────────────────────────────────────────────────────────

@app.get("/", tags=["Root"])
async def root():
    """
    Root endpoint - Welcome message and API information.

    Returns a friendly JSON response with basic API details,
    links to documentation, and registered agent count.
    """
    return {
        "message": f"Welcome to {settings.APP_NAME}",
        "version": settings.APP_VERSION,
        "environment": settings.APP_ENV,
        "agents_registered": orchestrator.agent_count,
        "docs": "/docs",
        "health": "/health",
        "endpoints": {
            "analyze_purchase": "POST /api/v1/analyze-purchase",
            "health_check": "GET /health",
            "agents": "GET /api/v1/agents",
        },
    }


# ── Agents Info Endpoint ─────────────────────────────────────────────────────

@app.get("/api/v1/agents", tags=["Agents"])
async def list_agents():
    """
    List all registered AI agents and their status.

    Returns metadata for each agent including name, version,
    type, and current status.
    """
    return {
        "success": True,
        "total_agents": orchestrator.agent_count,
        "agents": orchestrator.get_all_agents(),
    }
