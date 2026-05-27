export type ParsedTransaction = {
  transaction_date: string; // ISO format
  merchant: string;
  amount: number;
  type: 'credit' | 'debit';
  category: string;
  account?: string;
  notes?: string;
};
