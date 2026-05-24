# 📊 Datasets

> Sample and reference datasets for FinPilot AI development, testing, and benchmarking.

---

## Purpose

This directory contains financial datasets used for:

- **Development & Testing** — Sample data for building and validating features
- **Benchmarking** — Reference profiles to test edge cases and decision boundaries
- **Demo & Portfolio** — Realistic data for presentations and demos
- **AI Training** — Future datasets for fine-tuning financial models

> ⚠️ **Important:** All data in this directory is **synthetic** — no real user data is stored here.

---

## 📁 Current Files

| File | Description |
|---|---|
| `sample_data.json` | 5 sample user financial profiles with varying financial health levels |

---

## 📋 Planned Datasets

### Spending Patterns

- Monthly spending breakdowns by category (rent, food, transport, etc.)
- Seasonal spending trends
- Spending habit clusters (frugal, moderate, high-spender)

### Financial Benchmarks

- Income-to-expense ratios by demographic
- Recommended emergency fund sizes by income bracket
- Average savings rates by age group
- EMI affordability thresholds

### Product & EMI Data

- Common product prices by category (electronics, appliances, vehicles)
- EMI interest rate benchmarks by lender type
- No-cost EMI vs standard EMI comparisons

### Risk Profiles

- Risk score distributions for different financial scenarios
- Edge case profiles for boundary testing
- Stress test scenarios (job loss, medical emergency, etc.)

---

## 📐 Data Format Guidelines

All datasets in this directory should follow these conventions:

### File Format

- **JSON** (`.json`) — Primary format for structured data
- **CSV** (`.csv`) — For tabular datasets
- **Markdown** (`.md`) — For documentation and data dictionaries

### Naming Convention

```
<category>_<description>.<ext>

Examples:
  sample_data.json
  spending_patterns_monthly.csv
  risk_profiles_edge_cases.json
  benchmarks_emergency_fund.json
```

### JSON Structure

All JSON datasets should follow this structure:

```json
{
  "metadata": {
    "name": "Dataset Name",
    "description": "What this dataset contains",
    "version": "1.0",
    "created": "2026-05-24",
    "record_count": 5,
    "schema_version": "1.0"
  },
  "data": [
    { ... },
    { ... }
  ]
}
```

### Currency

- All monetary values are in **Indian Rupees (₹ / INR)**
- Values are stored as **numbers** (not strings)
- No currency symbols in data fields

---

## 🔒 Privacy Considerations

### What Goes Here

✅ **Synthetic data** — Generated with realistic but fictional values
✅ **Anonymized data** — All personally identifiable information removed
✅ **Aggregate statistics** — Summary data without individual records
✅ **Public benchmarks** — Publicly available financial statistics

### What Does NOT Go Here

❌ **Real user data** — Never commit actual user financial information
❌ **PII** (Personally Identifiable Information) — No real names, emails, phone numbers
❌ **Account numbers** — No bank account, credit card, or loan account numbers
❌ **API keys or tokens** — No secrets in data files

### Data Generation

When creating new sample datasets:

1. Use realistic but **clearly fictional** values
2. Names should be obviously synthetic (e.g., "Aarav Sharma", "Priya Patel")
3. Financial values should represent **realistic Indian income ranges**
4. Include a **metadata** block describing the dataset
5. Mark the file header with: `"synthetic": true`

---

## 🤝 Contributing New Datasets

1. Create your dataset following the format guidelines above
2. Add a metadata block with description and creation date
3. Update this README with the new file entry
4. Ensure no real user data is included
5. Submit a PR with a clear description of the dataset's purpose

---

*Last updated: May 2026*
