'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

export type TransactionKind = 'expense' | 'income';
export type Category =
  | 'groceries'
  | 'dining'
  | 'transport'
  | 'shopping'
  | 'entertainment'
  | 'utilities'
  | 'health'
  | 'education'
  | 'rent'
  | 'subscriptions'
  | 'travel'
  | 'income'
  | 'other';

export interface Transaction {
  id: string;
  kind: TransactionKind;
  merchant: string;
  amount: number;
  currency: string;
  category: Category;
  txn_date: string;
  notes?: string;
  receiptId?: string;
}

export interface Receipt {
  id: string;
  url: string;
  uploaded_at: string;
  transactionId?: string;
}

export interface User {
  email: string;
  full_name: string;
  preferred_currency: string;
  timezone: string;
}

export interface Budget {
  cycle: 'weekly' | 'biweekly' | 'monthly';
  cycleAnchor: string;
  startingBalance: number;
}

interface AppState {
  user: User;
  budget: Budget;
  transactions: Transaction[];
  receipts: Receipt[];
  updateUser: (user: Partial<User>) => void;
  updateBudget: (budget: Partial<Budget>) => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addReceipt: (receipt: Omit<Receipt, 'id' | 'uploaded_at'>) => void;
  linkReceiptToTransaction: (receiptId: string, transactionId: string) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>({
    email: 'demo@instabudget.app',
    full_name: 'John Doe',
    preferred_currency: 'USD',
    timezone: 'America/New_York',
  });

  const [budget, setBudget] = useState<Budget>({
    cycle: 'monthly',
    cycleAnchor: '2025-10-01',
    startingBalance: 0,
  });

  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: '1',
      kind: 'expense',
      merchant: 'Whole Foods Market',
      amount: 87.43,
      currency: 'USD',
      category: 'groceries',
      txn_date: '2025-10-20',
      notes: 'Weekly grocery shopping',
    },
    {
      id: '2',
      kind: 'expense',
      merchant: 'Shell Gas Station',
      amount: 45.0,
      currency: 'USD',
      category: 'transport',
      txn_date: '2025-10-21',
    },
    {
      id: '3',
      kind: 'expense',
      merchant: 'Netflix',
      amount: 15.99,
      currency: 'USD',
      category: 'subscriptions',
      txn_date: '2025-10-22',
    },
    {
      id: '4',
      kind: 'income',
      merchant: 'Acme Corp',
      amount: 2500.0,
      currency: 'USD',
      category: 'income',
      txn_date: '2025-10-15',
      notes: 'Salary payment',
    },
    {
      id: '5',
      kind: 'expense',
      merchant: 'Starbucks',
      amount: 6.75,
      currency: 'USD',
      category: 'dining',
      txn_date: '2025-10-23',
    },
    {
      id: '6',
      kind: 'expense',
      merchant: 'Amazon',
      amount: 124.99,
      currency: 'USD',
      category: 'shopping',
      txn_date: '2025-10-24',
    },
  ]);

  const [receipts, setReceipts] = useState<Receipt[]>([]);

  const updateUser = (updates: Partial<User>) => {
    setUser((prev) => ({ ...prev, ...updates }));
  };

  const updateBudget = (updates: Partial<Budget>) => {
    setBudget((prev) => ({ ...prev, ...updates }));
  };

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = {
      ...transaction,
      id: Math.random().toString(36).substring(7),
    };
    setTransactions((prev) => [newTransaction, ...prev]);
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const addReceipt = (receipt: Omit<Receipt, 'id' | 'uploaded_at'>) => {
    const newReceipt = {
      ...receipt,
      id: Math.random().toString(36).substring(7),
      uploaded_at: new Date().toISOString(),
    };
    setReceipts((prev) => [newReceipt, ...prev]);
  };

  const linkReceiptToTransaction = (
    receiptId: string,
    transactionId: string
  ) => {
    setReceipts((prev) =>
      prev.map((r) => (r.id === receiptId ? { ...r, transactionId } : r))
    );
    setTransactions((prev) =>
      prev.map((t) => (t.id === transactionId ? { ...t, receiptId } : t))
    );
  };

  return (
    <AppContext.Provider
      value={{
        user,
        budget,
        transactions,
        receipts,
        updateUser,
        updateBudget,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addReceipt,
        linkReceiptToTransaction,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
