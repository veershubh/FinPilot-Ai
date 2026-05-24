"""
FinPilot AI - Budget Agent
==============================
AI agent for analyzing and optimizing user budgets.

CURRENT STATUS: Starter Template
─────────────────────────────────
This agent will analyze monthly budgets, categorize expenses,
and suggest optimizations to help users save more money.

PLANNED FEATURES:
1. Expense categorization (needs vs wants)
2. Budget optimization suggestions
3. Spending pattern analysis
4. Savings goal tracking
5. LLM-powered personalized budget advice
"""

from typing import Dict, Any, List, Optional


class BudgetAgent:
    """
    AI Agent for budget analysis and optimization.

    Analyzes user spending patterns and provides actionable
    recommendations to optimize their monthly budget.
    """

    def __init__(self, llm_client: Optional[Any] = None):
        """
        Initialize the Budget Agent.

        Args:
            llm_client: Optional LLM client for AI-powered analysis.
        """
        self.llm_client = llm_client
        self.agent_name = "Budget Agent"
        self.agent_version = "0.1.0"

    async def analyze_budget(
        self,
        monthly_income: float,
        expenses: Dict[str, float],
        savings_goal: Optional[float] = None,
    ) -> Dict[str, Any]:
        """
        Analyze user budget and provide optimization suggestions.

        TODO: Implement full budget analysis logic.

        Args:
            monthly_income: User's monthly income.
            expenses:       Dict of expense categories and amounts.
            savings_goal:   Optional monthly savings target.

        Returns:
            Budget analysis with recommendations.
        """
        total_expenses = sum(expenses.values())
        savings = monthly_income - total_expenses
        savings_rate = (savings / monthly_income * 100) if monthly_income > 0 else 0

        return {
            "total_income": monthly_income,
            "total_expenses": total_expenses,
            "monthly_savings": savings,
            "savings_rate": round(savings_rate, 2),
            "budget_status": self._get_budget_status(savings_rate),
            "recommendations": self._generate_recommendations(
                savings_rate, expenses, savings_goal
            ),
        }

    def _get_budget_status(self, savings_rate: float) -> str:
        """Determine budget health status based on savings rate."""
        if savings_rate >= 30:
            return "Excellent"
        elif savings_rate >= 20:
            return "Good"
        elif savings_rate >= 10:
            return "Fair"
        elif savings_rate > 0:
            return "Needs Improvement"
        else:
            return "Critical"

    def _generate_recommendations(
        self,
        savings_rate: float,
        expenses: Dict[str, float],
        savings_goal: Optional[float],
    ) -> List[str]:
        """Generate budget recommendations."""
        recommendations = []

        if savings_rate < 20:
            recommendations.append(
                "Aim to save at least 20% of your income each month."
            )

        if savings_rate < 0:
            recommendations.append(
                "Your expenses exceed your income. Review and cut non-essential spending."
            )

        if savings_goal and savings_rate < (savings_goal * 100):
            recommendations.append(
                f"You're below your savings goal. Consider reducing discretionary expenses."
            )

        if not recommendations:
            recommendations.append(
                "Great job! Your budget looks healthy. Consider investing surplus savings."
            )

        return recommendations

    def get_agent_info(self) -> Dict[str, str]:
        """Get agent metadata."""
        return {
            "name": self.agent_name,
            "version": self.agent_version,
            "type": "budget",
            "status": "development",
        }
