"""
FinPilot AI - Chat Assistant Agent
======================================
AI agent for conversational financial assistance.

CURRENT STATUS: Starter Template
─────────────────────────────────
This agent handles natural language chat interactions,
routing queries to the appropriate specialized agent
and generating conversational responses.

FUTURE INTEGRATION PLAN:
1. Connect to OpenAI / Gemini for natural language understanding
2. Maintain conversation context across messages
3. Route complex queries to specialized agents
4. Generate personalized financial advice
5. Support multi-turn financial planning conversations
"""

from typing import Dict, Any, List, Optional
from datetime import datetime


class ChatAgent:
    """
    AI Agent for conversational financial assistance.

    This agent acts as the primary interface between the user
    and the multi-agent system. It understands user intent,
    routes queries to specialized agents, and generates
    human-friendly responses.
    """

    def __init__(self, llm_client: Optional[Any] = None):
        """
        Initialize the Chat Agent.

        Args:
            llm_client: Optional LLM client (OpenAI, Gemini, etc.)
        """
        self.llm_client = llm_client
        self.agent_name = "Chat Assistant Agent"
        self.agent_version = "0.1.0"
        self.conversation_history: List[Dict[str, str]] = []

    async def process_message(
        self,
        user_message: str,
        user_context: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Process a user message and generate a response.

        Currently uses keyword-based intent detection.
        Future: LLM-based natural language understanding.

        Args:
            user_message:  The user's text message.
            user_context:  Optional financial context (income, savings, etc.)

        Returns:
            Response dict with message, intent, and optional data.
        """
        # Store in conversation history
        self.conversation_history.append({
            "role": "user",
            "content": user_message,
            "timestamp": datetime.now().isoformat(),
        })

        # Detect intent
        intent = self._detect_intent(user_message)

        # Generate response based on intent
        response = await self.generate_response(intent, user_message, user_context)

        # Store assistant response
        self.conversation_history.append({
            "role": "assistant",
            "content": response["message"],
            "timestamp": datetime.now().isoformat(),
        })

        return response

    def _detect_intent(self, message: str) -> str:
        """
        Detect the user's intent from their message.

        Simple keyword-based detection. Future: LLM classification.

        Args:
            message: User's text message.

        Returns:
            Intent string (e.g., 'emi_query', 'budget_query', etc.)
        """
        message_lower = message.lower()

        intent_keywords = {
            "emi_query": ["emi", "installment", "loan", "buy on emi", "full payment"],
            "budget_query": ["budget", "spending", "expense", "save money", "cut costs"],
            "risk_query": ["risk", "safe", "dangerous", "risky", "afford"],
            "goal_query": ["goal", "target", "plan", "dream", "save for"],
            "savings_query": ["savings", "emergency fund", "how much saved", "savings rate"],
            "greeting": ["hello", "hi", "hey", "good morning", "good evening"],
            "help": ["help", "what can you do", "features", "guide"],
        }

        for intent, keywords in intent_keywords.items():
            if any(kw in message_lower for kw in keywords):
                return intent

        return "general"

    async def generate_response(
        self,
        intent: str,
        user_message: str,
        user_context: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Generate a response based on detected intent.

        TODO: Replace with LLM-generated responses.

        Args:
            intent:        Detected intent string.
            user_message:  Original user message.
            user_context:  Optional financial context.

        Returns:
            Response dict.
        """
        # If LLM is available, use it
        if self.llm_client:
            return await self._generate_llm_response(intent, user_message, user_context)

        # Rule-based responses (fallback)
        responses = {
            "emi_query": {
                "message": (
                    "I can help you analyze EMI vs full payment options! "
                    "Head to the EMI Analyzer page and enter your purchase details "
                    "for a detailed recommendation."
                ),
                "suggestion": "Try the /api/v1/analyze-purchase endpoint.",
            },
            "budget_query": {
                "message": (
                    "Budget optimization is a great goal! While the full Budget Planner "
                    "is coming soon, here's a quick tip: try the 50/30/20 rule — "
                    "50% needs, 30% wants, 20% savings."
                ),
                "suggestion": "Budget Planner feature coming soon.",
            },
            "risk_query": {
                "message": (
                    "Financial risk assessment is important. Use the EMI Analyzer "
                    "to check if a purchase is within your risk comfort zone. "
                    "We'll calculate your financial health score automatically."
                ),
                "suggestion": "Check your financial health score.",
            },
            "goal_query": {
                "message": (
                    "Setting financial goals is the first step to financial freedom! "
                    "The Goal Planner is being developed and will help you set, "
                    "track, and achieve your financial targets."
                ),
                "suggestion": "Goal Planner feature coming soon.",
            },
            "savings_query": {
                "message": (
                    "Great question about savings! A healthy emergency fund should "
                    "cover 3-6 months of expenses. Use the EMI Analyzer to see "
                    "how purchases affect your savings safety."
                ),
                "suggestion": "Aim for 6 months of expenses as emergency fund.",
            },
            "greeting": {
                "message": (
                    "Hello! Welcome to FinPilot AI. I'm your financial co-pilot. "
                    "I can help you analyze purchases, plan budgets, and make "
                    "smarter financial decisions. What would you like to explore?"
                ),
                "suggestion": "Try asking about EMI options or budgeting.",
            },
            "help": {
                "message": (
                    "Here's what I can help with:\n"
                    "1. EMI vs Full Payment analysis\n"
                    "2. Budget planning tips\n"
                    "3. Financial risk assessment\n"
                    "4. Goal planning guidance\n"
                    "5. Savings advice\n\n"
                    "Just ask me anything about your finances!"
                ),
                "suggestion": "Start with an EMI analysis.",
            },
            "general": {
                "message": (
                    "I'm FinPilot AI, your financial assistant. I can help with "
                    "EMI analysis, budgeting, risk assessment, and financial goals. "
                    "Could you tell me more about what you'd like help with?"
                ),
                "suggestion": "Try asking a specific financial question.",
            },
        }

        response_data = responses.get(intent, responses["general"])

        return {
            "message": response_data["message"],
            "intent": intent,
            "suggestion": response_data.get("suggestion", ""),
            "confidence": 0.7 if intent != "general" else 0.3,
            "source": "rule_based",
        }

    async def _generate_llm_response(
        self,
        intent: str,
        user_message: str,
        user_context: Optional[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """
        Generate a response using the LLM client.

        TODO: Implement when LLM integration is ready.
        """
        # Placeholder for future LLM integration
        return {
            "message": "LLM response placeholder.",
            "intent": intent,
            "source": "llm",
            "confidence": 0.9,
        }

    def get_financial_context(self) -> Dict[str, Any]:
        """
        Get the current financial context from conversation history.

        Extracts any financial figures mentioned in the conversation
        to provide context-aware responses.

        TODO: Implement NER for financial entity extraction.
        """
        return {
            "conversation_length": len(self.conversation_history),
            "has_context": len(self.conversation_history) > 0,
        }

    def clear_history(self) -> None:
        """Clear conversation history."""
        self.conversation_history = []

    def get_agent_info(self) -> Dict[str, Any]:
        """Get agent metadata."""
        return {
            "name": self.agent_name,
            "version": self.agent_version,
            "type": "chat",
            "status": "development",
            "llm_enabled": self.llm_client is not None,
            "conversation_length": len(self.conversation_history),
        }
