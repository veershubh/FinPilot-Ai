"""
FinPilot AI - Risk Assessment Agent
=======================================
AI agent for comprehensive financial risk analysis.

CURRENT STATUS: Starter Template
─────────────────────────────────
This agent will assess financial risks across multiple dimensions
and provide risk scores with mitigation strategies.

PLANNED FEATURES:
1. Multi-dimensional risk scoring (liquidity, debt, savings, income stability)
2. Risk tolerance profiling
3. Stress testing financial scenarios
4. Insurance gap analysis
5. LLM-powered risk narrative generation
"""

from typing import Dict, Any, List, Optional


class RiskAgent:
    """
    AI Agent for financial risk assessment.

    Evaluates user financial health across multiple risk dimensions
    and provides actionable mitigation strategies.
    """

    def __init__(self, llm_client: Optional[Any] = None):
        """
        Initialize the Risk Agent.

        Args:
            llm_client: Optional LLM client for AI-powered analysis.
        """
        self.llm_client = llm_client
        self.agent_name = "Risk Assessment Agent"
        self.agent_version = "0.1.0"

    async def assess_risk(
        self,
        monthly_income: float,
        monthly_expenses: float,
        current_savings: float,
        emergency_fund: float,
        total_debts: float = 0,
        dependents: int = 0,
    ) -> Dict[str, Any]:
        """
        Perform comprehensive financial risk assessment.

        TODO: Implement full multi-dimensional risk analysis.

        Args:
            monthly_income:  User's monthly income.
            monthly_expenses: User's monthly expenses.
            current_savings: Total savings.
            emergency_fund:  Emergency fund amount.
            total_debts:     Total outstanding debts.
            dependents:      Number of financial dependents.

        Returns:
            Risk assessment with scores and strategies.
        """
        risk_scores = {
            "liquidity_risk": self._assess_liquidity_risk(
                current_savings, monthly_expenses
            ),
            "debt_risk": self._assess_debt_risk(
                total_debts, monthly_income
            ),
            "emergency_preparedness": self._assess_emergency_risk(
                emergency_fund, monthly_expenses
            ),
            "income_stability": self._assess_income_risk(
                monthly_income, monthly_expenses, dependents
            ),
        }

        overall_score = sum(risk_scores.values()) / len(risk_scores)

        return {
            "overall_risk_score": round(overall_score, 1),
            "risk_level": self._score_to_level(overall_score),
            "dimension_scores": risk_scores,
            "mitigation_strategies": self._generate_strategies(risk_scores),
        }

    def _assess_liquidity_risk(
        self, savings: float, monthly_expenses: float
    ) -> float:
        """Score from 0 (high risk) to 100 (low risk)."""
        if monthly_expenses <= 0:
            return 100
        months_covered = savings / monthly_expenses
        return min(months_covered / 12 * 100, 100)

    def _assess_debt_risk(
        self, total_debts: float, monthly_income: float
    ) -> float:
        """Score from 0 (high risk) to 100 (low risk)."""
        if monthly_income <= 0:
            return 0
        debt_to_income = total_debts / (monthly_income * 12)
        return max(0, 100 - debt_to_income * 100)

    def _assess_emergency_risk(
        self, emergency_fund: float, monthly_expenses: float
    ) -> float:
        """Score from 0 (high risk) to 100 (low risk)."""
        if monthly_expenses <= 0:
            return 100
        months_covered = emergency_fund / monthly_expenses
        return min(months_covered / 6 * 100, 100)

    def _assess_income_risk(
        self, income: float, expenses: float, dependents: int
    ) -> float:
        """Score from 0 (high risk) to 100 (low risk)."""
        if income <= 0:
            return 0
        savings_rate = (income - expenses) / income
        dependent_factor = max(0, 1 - dependents * 0.1)
        return min(savings_rate * dependent_factor * 100, 100)

    def _score_to_level(self, score: float) -> str:
        """Convert score to risk level."""
        if score >= 70:
            return "Low Risk"
        elif score >= 40:
            return "Medium Risk"
        else:
            return "High Risk"

    def _generate_strategies(
        self, scores: Dict[str, float]
    ) -> List[str]:
        """Generate mitigation strategies based on weak areas."""
        strategies = []

        if scores.get("liquidity_risk", 100) < 50:
            strategies.append(
                "Build a larger savings buffer — aim for 6–12 months of expenses."
            )
        if scores.get("debt_risk", 100) < 50:
            strategies.append(
                "Prioritize debt repayment using the avalanche or snowball method."
            )
        if scores.get("emergency_preparedness", 100) < 50:
            strategies.append(
                "Strengthen your emergency fund to cover at least 6 months of expenses."
            )
        if scores.get("income_stability", 100) < 50:
            strategies.append(
                "Consider diversifying income sources or building passive income streams."
            )

        if not strategies:
            strategies.append(
                "Your financial risk profile looks strong. Focus on growth investments."
            )

        return strategies

    def get_agent_info(self) -> Dict[str, str]:
        """Get agent metadata."""
        return {
            "name": self.agent_name,
            "version": self.agent_version,
            "type": "risk",
            "status": "development",
        }
