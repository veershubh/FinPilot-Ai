# FinPilot AI

> **Your Intelligent Financial Co-Pilot** — An AI-powered financial planning platform that helps users make smarter decisions about purchases, EMIs, budgets, and financial goals.

---

## Overview

FinPilot AI is a full-stack financial planning system with an intelligent decision engine at its core. It analyzes a user's financial situation and provides data-driven recommendations on whether to purchase via EMI, pay in full, or delay a purchase — with detailed reasoning, risk assessment, and actionable tips.

**Key Capabilities:**
- EMI vs Full Payment Decision Engine
- Financial Health Scoring (0-100)
- Multi-dimensional Risk Assessment
- Budget Analysis and Optimization
- AI-Powered Financial Advice (coming soon)
- Multi-Agent AI Architecture (coming soon)

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14, React, TypeScript, Tailwind CSS |
| **Backend** | Python, FastAPI, Pydantic, Uvicorn |
| **AI/ML** | Scikit-learn, Pandas, NumPy (Gemini/OpenAI ready) |
| **Database** | PostgreSQL (SQLAlchemy ORM) |
| **Infrastructure** | Docker, Docker Compose |

---

## Project Structure

```
finpilot-ai/
|
|-- frontend/                 # Next.js + Tailwind CSS dashboard
|   |-- src/
|   |   |-- app/              # App router pages
|   |   |-- components/       # Reusable UI components
|   |   |-- services/         # API client services
|   |   |-- hooks/            # Custom React hooks
|   |   |-- utils/            # Utility functions
|   |   +-- types/            # TypeScript type definitions
|   +-- package.json
|
|-- backend/                  # FastAPI Python backend
|   |-- app/
|   |   |-- routes/           # API endpoint definitions
|   |   |-- services/         # Business logic layer
|   |   |-- models/           # Pydantic request/response schemas
|   |   |-- schemas/          # Common response schemas
|   |   |-- utils/            # Reusable utility functions
|   |   |-- database/         # PostgreSQL connection & ORM models
|   |   |-- middleware/       # Request logging, rate limiting
|   |   |-- config/           # Constants and configuration
|   |   +-- ai_agents/        # AI agent classes
|   |-- run.py                # Server entry point
|   +-- requirements.txt      # Python dependencies
|
|-- datasets/                 # Sample financial data
|-- docs/                     # Architecture, API docs, roadmap
|-- docker-compose.yml        # Multi-service orchestration
+-- README.md                 # This file
```

---

## Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm or yarn

### 1. Backend Setup

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
python run.py
```

Backend runs at **http://localhost:8000** | Docs at **http://localhost:8000/docs**

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at **http://localhost:3000**

### 3. Docker (optional)

```bash
docker-compose up --build
```

---

## Core API

### Health Check
```
GET /health
```

### Analyze Purchase (EMI vs Full Payment)
```
POST /api/v1/analyze-purchase
Content-Type: application/json

{
  "product_price": 80000,
  "monthly_income": 15000,
  "monthly_expenses": 9000,
  "current_savings": 95000,
  "emergency_fund": 20000,
  "emi_months": 12,
  "interest_rate": 12
}
```

**Response:**
```json
{
  "recommendation": "EMI Preferred",
  "risk_level": "Low",
  "monthly_emi": 7107.90,
  "remaining_savings": 95000.0,
  "financial_health_score": 72,
  "reason": "EMI preserves emergency liquidity and maintains financial stability.",
  "detailed_reasons": ["..."],
  "financial_breakdown": { "..." },
  "tips": ["..."]
}
```

---

## AI Agents

| Agent | Purpose | Status |
|---|---|---|
| EMI Decision Agent | Smart purchase analysis | Active |
| Budget Agent | Budget optimization | Template |
| Risk Agent | Multi-dimensional risk scoring | Template |
| Goal Agent | Financial goal planning | Template |
| Expense Agent | Expense tracking & anomalies | Template |
| Chat Agent | Conversational AI assistant | Template |
| Agent Orchestrator | Multi-agent coordination | Template |

---

## Documentation

- [Architecture](docs/architecture.md) — System design and data flow
- [API Documentation](docs/api_docs.md) — Endpoint reference with examples
- [Roadmap](docs/roadmap.md) — Development phases and milestones

---

## License

MIT License - See [LICENSE](LICENSE) for details.

---

**Built with precision by the FinPilot AI Team**
