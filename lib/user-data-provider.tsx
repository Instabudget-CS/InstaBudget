"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-provider";
import { useTransactions } from "./user-data-provider/hooks/use-transactions";
import { useReceipts } from "./user-data-provider/hooks/use-receipts";
import { useBudgetCategories } from "./user-data-provider/hooks/use-budget-categories";
import { calculateCategorySpent } from "./user-data-provider/utils/calculate-category-spent";
import type { UserDataContextType } from "./user-data-provider/types";

// Re-export types for backward compatibility
export type {
  Transaction,
  Receipt,
  BudgetCategory,
  UserDataContextType,
} from "./user-data-provider/types";

const UserDataContext = createContext<UserDataContextType | undefined>(
  undefined
);

export function UserDataProvider({ children }: { children: React.ReactNode }) {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);

  const {
    transactions,
    fetchTransactions,
    refreshTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  } = useTransactions({ user });

  const {
    receipts,
    fetchReceipts,
    refreshReceipts,
    addReceipt,
    getReceiptUrl,
  } = useReceipts({ user });

  const {
    budgetCategories,
    fetchBudgetCategories,
    refreshBudgetCategories,
    addBudgetCategory,
    updateBudgetCategory,
    deleteBudgetCategory,
  } = useBudgetCategories({
    user,
    profile,
    transactions,
  });

  useEffect(() => {
    const loadData = async () => {
      if (user) {
        setLoading(true);
        await Promise.all([
          fetchTransactions(),
          fetchReceipts(),
          fetchBudgetCategories(),
        ]);
        setLoading(false);
      } else {
        setLoading(false);
      }
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, profile?.cycle_startDate, profile?.cycle_endDate]);

  const calculateCategorySpentWrapper = (
    categoryName: string,
    startDate?: string,
    endDate?: string
  ): number => {
    return calculateCategorySpent(
      categoryName,
      transactions,
      startDate,
      endDate
    );
  };

  const value: UserDataContextType = {
    transactions,
    receipts,
    budgetCategories,
    loading,
    refreshTransactions,
    refreshReceipts,
    refreshBudgetCategories,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addReceipt,
    getReceiptUrl,
    addBudgetCategory,
    updateBudgetCategory,
    deleteBudgetCategory,
    calculateCategorySpent: calculateCategorySpentWrapper,
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
