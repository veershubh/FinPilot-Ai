# 📚 API Documentation

> Complete reference for the FinPilot AI REST API — endpoints, request/response schemas, and usage examples.

**Related Docs:** [Architecture](./architecture.md) · [Roadmap](./roadmap.md) · [Backend README](../backend/README.md)

---

## 🌐 Base URL

| Environment | URL |
|---|---|
| **Local Development** | `http://localhost:8000` |
| **Production** | `TBD` |

### Interactive Documentation

| Tool | URL | Description |
|---|---|---|
| **Swagger UI** | [http://localhost:8000/docs](http://localhost:8000/docs) | Interactive API explorer with "Try it out" |
| **ReDoc** | [http://localhost:8000/redoc](http://localhost:8000/redoc) | Clean, readable API reference |

---

## 🔐 Authentication

> **Status:** 🔜 Coming Soon (Phase 4)

Authentication is not yet implemented. When available, it will use **JWT (JSON Web Tokens)**:

```
Authorization: Bearer <your_jwt_token>
```

Currently, all endpoints are **open and unauthenticated** for development purposes.

---

## 📋 Endpoints Summary

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/` | Welcome message & API metadata | ❌ |
| `GET` | `/health` | Health check & server status | ❌ |
| `POST` | `/api/v1/analyze-purchase` | EMI vs Full Payment analysis | ❌ (🔜 Yes) |

---

## 📖 Endpoint Details

### 1. `GET /` — Welcome

Returns basic API information and available documentation links.

**Request:**

```bash
curl http://localhost:8000/
```

**Response:** `200 OK`

```json
{
  "app": "FinPilot AI",
  "version": "1.0.0",
  "docs": "/docs",
  "health": "/health"
}
```

---

### 2. `GET /health` — Health Check

Returns the current server status, useful for monitoring and uptime checks.

**Request:**

```bash
# Using curl
curl http://localhost:8000/health

# Using PowerShell
Invoke-RestMethod -Uri "http://localhost:8000/health" -Method GET
```

**Response:** `200 OK`

```json
{
  "status": "healthy",
  "app_name": "FinPilot AI",
  "version": "1.0.0",
  "environment": "development",
  "timestamp": "2026-05-24T14:18:00+00:00"
}
```

**Response Fields:**

| Field | Type | Description |
|---|---|---|
| `status` | string | Server health status (`"healthy"`) |
| `app_name` | string | Application name |
| `version` | string | API version (semver) |
| `environment` | string | Current environment (`development` / `production`) |
| `timestamp` | string | ISO 8601 timestamp of the response |

---

### 3. `POST /api/v1/analyze-purchase` — Purchase Analysis

The core endpoint — analyzes whether a user should buy a product using EMI, pay in full, or delay the purchase.

#### Request Body

```json
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

**Request Fields:**

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `product_price` | float | ✅ | > 0 | Price of the product (₹) |
| `monthly_income` | float | ✅ | > 0 | User's monthly income (₹) |
| `monthly_expenses` | float | ✅ | ≥ 0 | User's monthly expenses (₹) |
| `current_savings` | float | ✅ | ≥ 0 | Total current savings (₹) |
| `emergency_fund` | float | ✅ | ≥ 0 | Emergency fund amount (₹) |
| `emi_months` | int | ✅ | 1–60 | EMI tenure in months |
| `interest_rate` | float | ✅ | 0–100 | Annual interest rate (%) |

#### Successful Response: `200 OK`

```json
{
  "recommendation": "EMI Preferred",
  "risk_level": "Low",
  "monthly_emi": 7105.0,
  "remaining_savings": 95000.0,
  "financial_health_score": 72,
  "reason": "EMI preserves emergency liquidity and maintains financial stability.",
  "detailed_reasons": [
    "Full payment would reduce savings to ₹15,000.00, which is below the safe emergency threshold.",
    "Monthly EMI of ₹7,105.00 is 118.4% of your disposable income — manageable.",
    "Your emergency fund of ₹20,000.00 stays untouched with EMI."
  ],
  "financial_breakdown": {
    "monthly_disposable_income": 6000.0,
    "estimated_monthly_emi": 7105.0,
    "total_emi_cost": 85260.0,
    "interest_paid": 5260.0,
    "savings_after_full_payment": 15000.0,
    "emi_to_income_ratio": 47.37,
    "emi_to_disposable_ratio": 118.42
  },
  "tips": [
    "Look for 0% interest or no-cost EMI options to minimize extra costs.",
    "You'll pay ₹5,260.00 extra in interest — negotiate for a lower rate if possible."
  ]
}
```

**Response Fields:**

| Field | Type | Description |
|---|---|---|
| `recommendation` | string | One of: `"Full Payment Recommended"`, `"EMI Preferred"`, `"Delay Purchase"` |
| `risk_level` | string | One of: `"Low"`, `"Medium"`, `"High"` |
| `monthly_emi` | float | Calculated monthly EMI amount (₹) |
| `remaining_savings` | float | Savings remaining if EMI is chosen (₹) |
| `financial_health_score` | int | Composite financial health score (0–100) |
| `reason` | string | Summary reason for the recommendation |
| `detailed_reasons` | string[] | Detailed list of factors influencing the decision |
| `financial_breakdown` | object | Detailed financial metrics (see below) |
| `tips` | string[] | Personalized actionable financial tips |

**Financial Breakdown Object:**

| Field | Type | Description |
|---|---|---|
| `monthly_disposable_income` | float | Income minus expenses (₹) |
| `estimated_monthly_emi` | float | Calculated EMI per month (₹) |
| `total_emi_cost` | float | Total amount paid over EMI tenure (₹) |
| `interest_paid` | float | Total interest paid (₹) |
| `savings_after_full_payment` | float | Savings remaining after full payment (₹) |
| `emi_to_income_ratio` | float | EMI as percentage of total income (%) |
| `emi_to_disposable_ratio` | float | EMI as percentage of disposable income (%) |

---

## 📝 Request/Response Examples

### Example 1: Healthy Finances — Full Payment Recommended

```bash
curl -X POST http://localhost:8000/api/v1/analyze-purchase \
  -H "Content-Type: application/json" \
  -d '{
    "product_price": 20000,
    "monthly_income": 50000,
    "monthly_expenses": 25000,
    "current_savings": 200000,
    "emergency_fund": 50000,
    "emi_months": 6,
    "interest_rate": 14
  }'
```

**Expected recommendation:** `"Full Payment Recommended"`

**Why:** High savings, low product-to-savings ratio, comfortable emergency fund.

---

### Example 2: Moderate Finances — EMI Preferred

```bash
curl -X POST http://localhost:8000/api/v1/analyze-purchase \
  -H "Content-Type: application/json" \
  -d '{
    "product_price": 80000,
    "monthly_income": 15000,
    "monthly_expenses": 9000,
    "current_savings": 95000,
    "emergency_fund": 20000,
    "emi_months": 12,
    "interest_rate": 12
  }'
```

**Expected recommendation:** `"EMI Preferred"`

**Why:** Full payment would drain savings below safe threshold; EMI preserves liquidity.

---

### Example 3: Tight Finances — Delay Purchase

```bash
curl -X POST http://localhost:8000/api/v1/analyze-purchase \
  -H "Content-Type: application/json" \
  -d '{
    "product_price": 100000,
    "monthly_income": 12000,
    "monthly_expenses": 11000,
    "current_savings": 5000,
    "emergency_fund": 3000,
    "emi_months": 12,
    "interest_rate": 18
  }'
```

**Expected recommendation:** `"Delay Purchase"`

**Why:** Very low disposable income, insufficient savings, high risk.

---

### PowerShell Examples

```powershell
# Health Check
Invoke-RestMethod -Uri "http://localhost:8000/health" -Method GET

# Purchase Analysis
$body = @{
    product_price    = 80000
    monthly_income   = 15000
    monthly_expenses = 9000
    current_savings  = 95000
    emergency_fund   = 20000
    emi_months       = 12
    interest_rate    = 12
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/v1/analyze-purchase" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

```powershell
# Using Invoke-WebRequest for raw response
$response = Invoke-WebRequest -Uri "http://localhost:8000/api/v1/analyze-purchase" `
    -Method POST `
    -ContentType "application/json" `
    -Body '{"product_price":50000,"monthly_income":30000,"monthly_expenses":15000,"current_savings":100000,"emergency_fund":30000,"emi_months":6,"interest_rate":10}'

$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 5
```

---

## ❌ Error Responses

### Validation Error — `422 Unprocessable Entity`

Returned when request body fails Pydantic validation.

```json
{
  "detail": [
    {
      "type": "value_error",
      "loc": ["body", "product_price"],
      "msg": "Value error, Product price must be positive",
      "input": -5000,
      "ctx": {},
      "url": "https://errors.pydantic.dev/2.0/v/value_error"
    }
  ]
}
```

### Not Found — `404 Not Found`

```json
{
  "detail": "Not Found"
}
```

### Internal Server Error — `500 Internal Server Error`

```json
{
  "detail": "Internal server error"
}
```

---

## 📊 Status Codes

| Code | Meaning | When |
|---|---|---|
| `200` | OK | Successful request |
| `422` | Unprocessable Entity | Request validation failed |
| `404` | Not Found | Endpoint doesn't exist |
| `405` | Method Not Allowed | Wrong HTTP method |
| `429` | Too Many Requests | Rate limit exceeded (🔜 planned) |
| `500` | Internal Server Error | Unexpected server error |

---

## ⏱ Rate Limiting

> **Status:** 🔜 Coming Soon

Planned rate limiting configuration:

| Tier | Limit | Window |
|---|---|---|
| **Unauthenticated** | 30 requests | Per minute |
| **Authenticated** | 100 requests | Per minute |
| **Premium** | 500 requests | Per minute |

Rate limit headers (when implemented):

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1716580800
```

---

## 🌍 CORS Configuration

The API is configured with permissive CORS for development:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # All origins (dev only)
    allow_credentials=True,
    allow_methods=["*"],          # All HTTP methods
    allow_headers=["*"],          # All headers
)
```

> ⚠️ **Production Note:** `allow_origins` will be restricted to specific frontend domains before deployment.

### Allowed Origins (Planned Production)

```python
allow_origins=[
    "https://finpilot.ai",
    "https://app.finpilot.ai",
    "http://localhost:3000",     # Local frontend dev
]
```

---

## 🔑 Headers

### Required Headers

| Header | Value | When |
|---|---|---|
| `Content-Type` | `application/json` | All POST/PUT/PATCH requests |

### Optional Headers (Future)

| Header | Value | When |
|---|---|---|
| `Authorization` | `Bearer <token>` | Authenticated endpoints |
| `X-Request-ID` | UUID | Request tracing |

---

## 📎 Related Documentation

- [Architecture Overview](./architecture.md) — System design deep-dive
- [Project Roadmap](./roadmap.md) — Feature timeline
- [Backend README](../backend/README.md) — Quick start guide

---

*Last updated: May 2026*
