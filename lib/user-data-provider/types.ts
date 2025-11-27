export interface Transaction {
  id: string;
  user_id: string;
  transaction_items: string; // JSON stringified
  merchant: string | null;
  total_amount: number;
  currency: string;
  category: string | null;
  transaction_date: string;
  notes: string | null;
  receipt_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Receipt {
  id: string;
  user_id: string;
  storage_path: string;
  uploaded_at: string;
  created_at?: string;
}

export interface BudgetCategory {
  id: string;
  user_id: string;
  category_name: string;
  limit_amount: number;
  spent_amount: number;
  created_at: string;
  updated_at: string;
}

export interface UserDataContextType {
  transactions: Transaction[];
  receipts: Receipt[];
  budgetCategories: BudgetCategory[];
  loading: boolean;
  refreshTransactions: () => Promise<void>;
  refreshReceipts: () => Promise<void>;
  refreshBudgetCategories: () => Promise<void>;
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addReceipt: (receipt: Receipt) => void;
  getReceiptUrl: (storagePath: string) => string;
  addBudgetCategory: (
    category: Omit<
      BudgetCategory,
      "id" | "created_at" | "updated_at" | "spent_amount"
    >
  ) => Promise<void>;
  updateBudgetCategory: (
    id: string,
    updates: Partial<
      Omit<BudgetCategory, "id" | "user_id" | "created_at" | "updated_at">
    >
  ) => Promise<void>;
  deleteBudgetCategory: (id: string) => Promise<void>;
  calculateCategorySpent: (
    categoryName: string,
    startDate?: string,
    endDate?: string
  ) => number;
}
