"""
FinPilot AI - Application Constants
=======================================
Centralized constants used across the application.

Keep all magic numbers and configuration values here so they
can be easily found, documented, and modified in one place.
"""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# API VERSIONING
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

API_VERSION = "v1"
API_PREFIX = f"/api/{API_VERSION}"


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# FINANCIAL THRESHOLDS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Minimum months of expenses the emergency fund should cover
SAFE_EMERGENCY_MONTHS = 3

# Maximum healthy ratio of EMI to disposable income (50%)
MAX_SAFE_EMI_RATIO = 0.50

# Minimum months of expenses savings should cover after full payment
MIN_SAFE_SAVINGS_MONTHS = 3

# Ideal savings rate as percentage of income
IDEAL_SAVINGS_RATE = 20.0

# Recommended emergency fund coverage (6 months)
RECOMMENDED_EMERGENCY_MONTHS = 6


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# RISK LEVEL DEFINITIONS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RISK_LEVELS = {
    "LOW": {"min_score": 70, "label": "Low", "color": "#10b981"},
    "MEDIUM": {"min_score": 40, "label": "Medium", "color": "#f59e0b"},
    "HIGH": {"min_score": 0, "label": "High", "color": "#ef4444"},
}

# Health score boundaries
HEALTH_SCORE_EXCELLENT = 70
HEALTH_SCORE_FAIR = 40


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# AI AGENT REGISTRY
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

AGENT_REGISTRY = {
    "emi_decision": {
        "name": "EMI Decision Agent",
        "version": "1.0.0",
        "status": "active",
    },
    "budget": {
        "name": "Budget Agent",
        "version": "0.1.0",
        "status": "development",
    },
    "risk": {
        "name": "Risk Assessment Agent",
        "version": "0.1.0",
        "status": "development",
    },
    "goal": {
        "name": "Goal Planning Agent",
        "version": "0.1.0",
        "status": "development",
    },
    "expense": {
        "name": "Expense Tracking Agent",
        "version": "0.1.0",
        "status": "development",
    },
    "chat": {
        "name": "Chat Assistant Agent",
        "version": "0.1.0",
        "status": "development",
    },
}


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# EXPENSE CATEGORIES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EXPENSE_CATEGORIES = [
    "Housing",
    "Food & Groceries",
    "Transportation",
    "Healthcare",
    "Education",
    "Entertainment",
    "Shopping",
    "Utilities",
    "Insurance",
    "Investments",
    "EMI Payments",
    "Personal Care",
    "Miscellaneous",
]
