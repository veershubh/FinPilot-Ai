"""
FinPilot AI - Expense Tracking Agent
========================================
AI agent for tracking, categorizing, and analyzing expenses.

CURRENT STATUS: Starter Template
─────────────────────────────────
This agent will track user expenses, auto-categorize them,
detect unusual spending patterns, and generate reports.

PLANNED FEATURES:
1. Auto-categorization using ML classifiers
2. Anomaly detection for unusual spending
3. Monthly/weekly spending reports
4. Category-wise budget tracking
5. LLM-powered spending insights
"""

from typing import Dict, Any, List, Optional
from app.config.constants import EXPENSE_CATEGORIES


class ExpenseAgent:
    """
    AI Agent for expense tracking and analysis.

    Categorizes transactions, detects spending anomalies,
    and generates actionable spending reports.
    """

    def __init__(self, llm_client: Optional[Any] = None):
        """
        Initialize the Expense Agent.

        Args:
            llm_client: Optional LLM client for AI-powered categorization.
        """
        self.llm_client = llm_client
        self.agent_name = "Expense Tracking Agent"
        self.agent_version = "0.1.0"
        self.categories = EXPENSE_CATEGORIES

    async def categorize_expense(
        self,
        description: str,
        amount: float,
    ) -> Dict[str, Any]:
        """
        Categorize a single expense based on its description.

        Currently uses keyword matching. Future: ML classifier or LLM.

        Args:
            description: Text description of the expense.
            amount:      Amount spent.

        Returns:
            Dict with category, confidence, and metadata.
        """
        description_lower = description.lower()

        # Simple keyword-based categorization
        category_keywords = {
            "Housing": ["rent", "mortgage", "property", "maintenance"],
            "Food & Groceries": ["grocery", "food", "restaurant", "swiggy", "zomato", "meal"],
            "Transportation": ["fuel", "petrol", "uber", "ola", "metro", "bus", "taxi"],
            "Healthcare": ["doctor", "hospital", "medicine", "pharmacy", "medical"],
            "Education": ["course", "book", "tuition", "school", "college", "udemy"],
            "Entertainment": ["movie", "netflix", "spotify", "game", "concert"],
            "Shopping": ["amazon", "flipkart", "clothes", "electronics", "gadget"],
            "Utilities": ["electricity", "water", "internet", "wifi", "phone", "recharge"],
            "Insurance": ["insurance", "premium", "lic", "policy"],
            "EMI Payments": ["emi", "loan", "installment", "credit card"],
        }

        matched_category = "Miscellaneous"
        confidence = 0.3

        for category, keywords in category_keywords.items():
            if any(kw in description_lower for kw in keywords):
                matched_category = category
                confidence = 0.85
                break

        return {
            "description": description,
            "amount": amount,
            "category": matched_category,
            "confidence": confidence,
            "method": "keyword_matching",
        }

    async def detect_anomalies(
        self,
        expenses: List[Dict[str, Any]],
        threshold_multiplier: float = 2.0,
    ) -> List[Dict[str, Any]]:
        """
        Detect unusual spending patterns in a list of expenses.

        An expense is flagged as anomalous if its amount exceeds
        the category average by the given threshold multiplier.

        TODO: Replace with ML-based anomaly detection (Isolation Forest, etc.)

        Args:
            expenses:             List of expense dicts with 'category' and 'amount'.
            threshold_multiplier: How many times the average to flag as anomaly.

        Returns:
            List of anomalous expenses with explanations.
        """
        if not expenses:
            return []

        # Calculate category averages
        category_totals: Dict[str, List[float]] = {}
        for expense in expenses:
            cat = expense.get("category", "Miscellaneous")
            amt = expense.get("amount", 0)
            category_totals.setdefault(cat, []).append(amt)

        category_averages = {
            cat: sum(amounts) / len(amounts)
            for cat, amounts in category_totals.items()
        }

        # Find anomalies
        anomalies = []
        for expense in expenses:
            cat = expense.get("category", "Miscellaneous")
            amt = expense.get("amount", 0)
            avg = category_averages.get(cat, 0)

            if avg > 0 and amt > avg * threshold_multiplier:
                anomalies.append({
                    **expense,
                    "is_anomaly": True,
                    "category_average": round(avg, 2),
                    "deviation": round(amt / avg, 2),
                    "reason": f"Amount is {round(amt / avg, 1)}x the average for {cat}.",
                })

        return anomalies

    async def generate_spending_report(
        self,
        expenses: List[Dict[str, Any]],
        monthly_income: float,
    ) -> Dict[str, Any]:
        """
        Generate a spending report with category breakdown.

        Args:
            expenses:       List of categorized expense dicts.
            monthly_income: User's monthly income for ratio calculation.

        Returns:
            Report with totals, category breakdown, and insights.
        """
        if not expenses:
            return {
                "total_spent": 0,
                "category_breakdown": {},
                "spending_rate": 0,
                "insights": ["No expenses recorded yet."],
            }

        # Category breakdown
        category_breakdown: Dict[str, float] = {}
        for expense in expenses:
            cat = expense.get("category", "Miscellaneous")
            amt = expense.get("amount", 0)
            category_breakdown[cat] = category_breakdown.get(cat, 0) + amt

        total_spent = sum(category_breakdown.values())
        spending_rate = (total_spent / monthly_income * 100) if monthly_income > 0 else 0

        # Generate insights
        insights = []
        if spending_rate > 80:
            insights.append("You're spending over 80% of your income. Consider cutting back.")
        elif spending_rate > 60:
            insights.append("Spending is moderate. Look for opportunities to save more.")
        else:
            insights.append("Good spending habits! You're saving a healthy portion of income.")

        # Find top spending category
        if category_breakdown:
            top_category = max(category_breakdown, key=category_breakdown.get)  # type: ignore
            insights.append(f"Highest spending category: {top_category} ({round(category_breakdown[top_category], 0)}).")

        return {
            "total_spent": round(total_spent, 2),
            "category_breakdown": {k: round(v, 2) for k, v in sorted(category_breakdown.items(), key=lambda x: -x[1])},
            "spending_rate": round(spending_rate, 2),
            "savings": round(monthly_income - total_spent, 2),
            "insights": insights,
        }

    def get_agent_info(self) -> Dict[str, Any]:
        """Get agent metadata."""
        return {
            "name": self.agent_name,
            "version": self.agent_version,
            "type": "expense",
            "status": "development",
            "categories": self.categories,
        }
