"""
FinPilot AI - Agent Orchestrator
====================================
Centralized orchestrator that manages all AI agents and routes
user queries to the appropriate specialist.

ARCHITECTURE:
─────────────
The orchestrator sits above all individual agents and:
1. Maintains a registry of all available agents
2. Routes incoming queries to the best-suited agent
3. Can combine outputs from multiple agents
4. Provides a unified interface for the API layer

        ┌─────────────────────┐
        │  Agent Orchestrator  │
        └──────────┬──────────┘
                   │ routes to
     ┌─────────────┼───────────────┐
     │             │               │
  ┌──▼──┐     ┌───▼───┐     ┌────▼────┐
  │ EMI │     │Budget │     │  Risk   │  ...
  │Agent│     │Agent  │     │ Agent   │
  └─────┘     └───────┘     └─────────┘
"""

from typing import Dict, Any, List, Optional


class AgentOrchestrator:
    """
    Multi-agent orchestrator for FinPilot AI.

    Manages the lifecycle and routing of all AI agents.
    This is the single entry point for the API layer to
    interact with the agent ecosystem.
    """

    def __init__(self):
        """Initialize the orchestrator with an empty agent registry."""
        self._agents: Dict[str, Any] = {}
        self._routing_rules: Dict[str, str] = {
            "emi": "emi_decision",
            "purchase": "emi_decision",
            "buy": "emi_decision",
            "installment": "emi_decision",
            "budget": "budget",
            "spending": "budget",
            "expense": "expense",
            "track": "expense",
            "risk": "risk",
            "safe": "risk",
            "goal": "goal",
            "target": "goal",
            "plan": "goal",
            "chat": "chat",
            "hello": "chat",
            "help": "chat",
        }

    def register_agent(self, agent_id: str, agent_instance: Any) -> None:
        """
        Register an agent with the orchestrator.

        Args:
            agent_id:        Unique identifier for the agent (e.g., 'emi_decision').
            agent_instance:  The agent object instance.
        """
        self._agents[agent_id] = agent_instance

    def unregister_agent(self, agent_id: str) -> bool:
        """
        Remove an agent from the registry.

        Args:
            agent_id: The agent to remove.

        Returns:
            True if removed, False if not found.
        """
        if agent_id in self._agents:
            del self._agents[agent_id]
            return True
        return False

    async def route_query(
        self,
        query: str,
        data: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Route a user query to the most appropriate agent.

        The routing works by:
        1. Scanning the query for keywords
        2. Matching keywords to agent IDs via routing rules
        3. Delegating to the matched agent
        4. Falling back to the chat agent for unknown queries

        Args:
            query: User's text query or intent keyword.
            data:  Optional structured data to pass to the agent.

        Returns:
            Agent response dictionary.
        """
        # Determine which agent should handle this query
        target_agent_id = self._resolve_agent(query)

        if target_agent_id not in self._agents:
            return {
                "success": False,
                "error": "AGENT_NOT_FOUND",
                "message": f"No agent registered for '{target_agent_id}'.",
                "available_agents": list(self._agents.keys()),
            }

        agent = self._agents[target_agent_id]

        # Get agent info for metadata
        agent_info = (
            agent.get_agent_info()
            if hasattr(agent, "get_agent_info")
            else {"name": target_agent_id}
        )

        return {
            "success": True,
            "routed_to": target_agent_id,
            "agent_info": agent_info,
            "message": f"Query routed to {agent_info.get('name', target_agent_id)}.",
            "data": data,
        }

    def _resolve_agent(self, query: str) -> str:
        """
        Resolve a query string to an agent ID using routing rules.

        Args:
            query: User query text.

        Returns:
            Agent ID string.
        """
        query_lower = query.lower()

        for keyword, agent_id in self._routing_rules.items():
            if keyword in query_lower:
                return agent_id

        # Default to chat agent
        return "chat"

    def get_all_agents(self) -> List[Dict[str, Any]]:
        """
        Get information about all registered agents.

        Returns:
            List of agent info dictionaries.
        """
        agents_info = []
        for agent_id, agent in self._agents.items():
            info = (
                agent.get_agent_info()
                if hasattr(agent, "get_agent_info")
                else {"name": agent_id}
            )
            info["agent_id"] = agent_id
            info["registered"] = True
            agents_info.append(info)

        return agents_info

    def get_agent(self, agent_id: str) -> Optional[Any]:
        """
        Get a specific agent instance by ID.

        Args:
            agent_id: The agent identifier.

        Returns:
            Agent instance or None if not found.
        """
        return self._agents.get(agent_id)

    @property
    def agent_count(self) -> int:
        """Number of registered agents."""
        return len(self._agents)
