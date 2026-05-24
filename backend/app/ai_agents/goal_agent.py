"""
FinPilot AI - Goal Planning Agent
====================================
AI agent for financial goal planning and tracking.

CURRENT STATUS: Starter Template
─────────────────────────────────
This agent will help users set, plan, and track financial goals
such as buying a house, building an emergency fund, or saving
for education.

PLANNED FEATURES:
1. Goal setting and timeline planning
2. Monthly savings requirement calculation
3. Goal feasibility analysis
4. Progress tracking and projections
5. LLM-powered motivational insights
6. Multi-goal prioritization
"""

from typing import Dict, Any, List, Optional
from enum import Enum


class GoalPriority(str, Enum):
    """Priority levels for financial goals."""
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class GoalAgent:
    """
    AI Agent for financial goal planning.

    Helps users define financial goals, calculate required savings,
    assess feasibility, and track progress over time.
    """

    def __init__(self, llm_client: Optional[Any] = None):
        """
        Initialize the Goal Agent.

        Args:
            llm_client: Optional LLM client for AI-powered planning.
        """
        self.llm_client = llm_client
        self.agent_name = "Goal Planning Agent"
        self.agent_version = "0.1.0"

    async def plan_goal(
        self,
        goal_name: str,
        target_amount: float,
        timeline_months: int,
        current_savings: float = 0,
        monthly_contribution: float = 0,
        priority: GoalPriority = GoalPriority.MEDIUM,
    ) -> Dict[str, Any]:
        """
        Create a plan for achieving a financial goal.

        TODO: Implement full goal planning with investment returns.

        Args:
            goal_name:            Name of the financial goal.
            target_amount:        Amount needed to achieve the goal.
            timeline_months:      Number of months to achieve the goal.
            current_savings:      Amount already saved toward this goal.
            monthly_contribution: Current monthly savings toward this goal.
            priority:             Goal priority level.

        Returns:
            Goal plan with feasibility analysis.
        """
        remaining_amount = target_amount - current_savings
        required_monthly = (
            remaining_amount / timeline_months if timeline_months > 0 else 0
        )

        is_feasible = monthly_contribution >= required_monthly
        shortfall = max(0, required_monthly - monthly_contribution)

        # Calculate projected completion
        if monthly_contribution > 0:
            projected_months = remaining_amount / monthly_contribution
        else:
            projected_months = float("inf")

        return {
            "goal_name": goal_name,
            "target_amount": target_amount,
            "current_savings": current_savings,
            "remaining_amount": round(remaining_amount, 2),
            "timeline_months": timeline_months,
            "required_monthly_savings": round(required_monthly, 2),
            "current_monthly_contribution": monthly_contribution,
            "monthly_shortfall": round(shortfall, 2),
            "is_feasible": is_feasible,
            "projected_completion_months": (
                round(projected_months, 1) if projected_months != float("inf") else None
            ),
            "priority": priority.value,
            "progress_percentage": round(
                current_savings / target_amount * 100 if target_amount > 0 else 0, 1
            ),
            "recommendations": self._generate_goal_recommendations(
                is_feasible, shortfall, timeline_months, priority
            ),
        }

    def _generate_goal_recommendations(
        self,
        is_feasible: bool,
        shortfall: float,
        timeline_months: int,
        priority: GoalPriority,
    ) -> List[str]:
        """Generate goal-specific recommendations."""
        recommendations = []

        if not is_feasible:
            recommendations.append(
                f"Increase monthly savings by ₹{shortfall:,.0f} to stay on track."
            )
            if timeline_months < 24:
                recommendations.append(
                    "Consider extending the timeline to reduce monthly burden."
                )
            if priority == GoalPriority.HIGH:
                recommendations.append(
                    "This is a high-priority goal — consider reducing other expenses."
                )
        else:
            recommendations.append(
                "You're on track! Keep up the consistent savings."
            )
            recommendations.append(
                "Consider investing surplus in mutual funds for better returns."
            )

        return recommendations

    def get_agent_info(self) -> Dict[str, str]:
        """Get agent metadata."""
        return {
            "name": self.agent_name,
            "version": self.agent_version,
            "type": "goal",
            "status": "development",
        }
