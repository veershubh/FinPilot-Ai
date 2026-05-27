import type {
  Budget,
  Expense,
  Goal,
  Transaction,
  EMIPlan,
} from "@/types/database";

const now = new Date().toISOString();

const baseBudgets: Omit<Budget, "user_id">[] = [
  { id: "budget-1", category: "Groceries", monthly_limit: 12000, period: "monthly", created_at: now },
  { id: "budget-2", category: "Transportation", monthly_limit: 4500, period: "monthly", created_at: now },
  { id: "budget-3", category: "Entertainment", monthly_limit: 5000, period: "monthly", created_at: now },
];

const baseExpenses: Omit<Expense, "user_id">[] = [
  { id: "expense-1", category: "Food & Dining", amount: 840, description: "Lunch with team", expense_date: now, created_at: now },
  { id: "expense-2", category: "Subscriptions", amount: 299, description: "Streaming service", expense_date: now, created_at: now },
  { id: "expense-3", category: "Utilities", amount: 2250, description: "Internet bill", expense_date: now, created_at: now },
];

const baseGoals: Omit<Goal, "user_id">[] = [
  { id: "goal-1", title: "Emergency Fund", target_amount: 150000, current_amount: 68000, target_date: "2026-12-31", created_at: now },
  { id: "goal-2", title: "Vacation Fund", target_amount: 50000, current_amount: 18000, target_date: "2026-06-30", created_at: now },
];

const baseTransactions: Omit<Transaction, "user_id">[] = [
  { id: "txn-1", transaction_type: "expense", amount: 1299, description: "Grocery run", category: "Groceries", transaction_date: now, created_at: now },
  { id: "txn-2", transaction_type: "income", amount: 50000, description: "Salary deposit", category: "Income", transaction_date: now, created_at: now },
  { id: "txn-3", transaction_type: "expense", amount: 899, description: "Utility bill", category: "Bills & Utilities", transaction_date: now, created_at: now },
];

const baseEmiPlans: Omit<EMIPlan, "user_id">[] = [
  { id: "emi-1", title: "Home Loan", principal: 2500000, interest_rate: 7.4, tenure_months: 240, emi_amount: 19185, start_date: "2024-07-01", created_at: now },
  { id: "emi-2", title: "Car Loan", principal: 850000, interest_rate: 8.2, tenure_months: 60, emi_amount: 17492, start_date: "2025-01-15", created_at: now },
];

export const getMockBudgets = (userId: string): Budget[] =>
  baseBudgets.map((budget) => ({ ...budget, user_id: userId }));

export const getMockExpenses = (userId: string): Expense[] =>
  baseExpenses.map((expense) => ({ ...expense, user_id: userId }));

export const getMockGoals = (userId: string): Goal[] =>
  baseGoals.map((goal) => ({ ...goal, user_id: userId }));

export const getMockTransactions = (userId: string): Transaction[] =>
  baseTransactions.map((txn) => ({ ...txn, user_id: userId }));

export const getMockEMIPlans = (userId: string): EMIPlan[] =>
  baseEmiPlans.map((plan) => ({ ...plan, user_id: userId }));
