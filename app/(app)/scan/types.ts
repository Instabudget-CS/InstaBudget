import type { Transaction } from "@/lib/user-data-provider";

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

export type TabMode = "scan" | "manual";

export interface SavedTransaction extends Omit<Transaction, "created_at"> {
  created_at?: string;
}

export interface EdgeFunctionResponse {
  success: boolean;
  mode: "auto" | "preview";
  transaction?: {
    receipt_id?: string;
    transaction_items: string;
    merchant: string | null;
    total_amount: number;
    currency: string | null;
    category: string | null;
    transaction_date: string;
    notes: string | null;
  };
  error?: string;
}
