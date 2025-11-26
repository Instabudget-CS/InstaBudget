"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-provider";

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

interface UserDataContextType {
  transactions: Transaction[];
  receipts: Receipt[];
  loading: boolean;
  refreshTransactions: () => Promise<void>;
  refreshReceipts: () => Promise<void>;
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addReceipt: (receipt: Receipt) => void;
  getReceiptUrl: (storagePath: string) => string;
}

const UserDataContext = createContext<UserDataContextType | undefined>(
  undefined
);

export function UserDataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    if (!user) {
      setTransactions([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("transaction_date", { ascending: false });

      if (error) {
        console.error("Error fetching transactions:", error);
        return;
      }

      setTransactions(data || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const fetchReceipts = async () => {
    if (!user) {
      setReceipts([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("receipts")
        .select("*")
        .eq("user_id", user.id)
        .order("uploaded_at", { ascending: false });

      if (error) {
        console.error("Error fetching receipts:", error);
        return;
      }

      setReceipts(data || []);
    } catch (error) {
      console.error("Error fetching receipts:", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (user) {
        setLoading(true);
        await Promise.all([fetchTransactions(), fetchReceipts()]);
        setLoading(false);
      } else {
        setTransactions([]);
        setReceipts([]);
        setLoading(false);
      }
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const refreshTransactions = async () => {
    await fetchTransactions();
  };

  const refreshReceipts = async () => {
    await fetchReceipts();
  };

  const addTransaction = (transaction: Transaction) => {
    setTransactions((prev) => [transaction, ...prev]);
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const addReceipt = (receipt: Receipt) => {
    setReceipts((prev) => [receipt, ...prev]);
  };

  const getReceiptUrl = (storagePath: string): string => {
    const { data } = supabase.storage
      .from("receipts")
      .getPublicUrl(storagePath);
    return data.publicUrl;
  };

  const value = {
    transactions,
    receipts,
    loading,
    refreshTransactions,
    refreshReceipts,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addReceipt,
    getReceiptUrl,
  };

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  );
}

export function useUserData() {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    throw new Error("useUserData must be used within a UserDataProvider");
  }
  return context;
}
