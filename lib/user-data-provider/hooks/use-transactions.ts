import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Transaction } from "../types";
import type { User } from "@supabase/supabase-js";

interface UseTransactionsProps {
  user: User | null;
}

export function useTransactions({ user }: UseTransactionsProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const fetchTransactions = useCallback(async () => {
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
  }, [user]);

  const refreshTransactions = useCallback(async () => {
    await fetchTransactions();
  }, [fetchTransactions]);

  const addTransaction = useCallback((transaction: Transaction) => {
    setTransactions((prev) => [transaction, ...prev]);
  }, []);

  const updateTransaction = useCallback(
    (id: string, updates: Partial<Transaction>) => {
      setTransactions((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
      );
    },
    []
  );

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return {
    transactions,
    fetchTransactions,
    refreshTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  };
}
