export type Category =
  | "groceries"
  | "dining"
  | "transport"
  | "shopping"
  | "entertainment"
  | "utilities"
  | "health"
  | "education"
  | "rent"
  | "subscriptions"
  | "travel"
  | "income"
  | "other";

export interface TransactionItem {
  name: string;
  price: number;
}

export interface TransactionFormData {
  merchant: string;
  amount: string;
  category: Category;
  txnDate: string;
  notes: string;
  items: TransactionItem[];
}
