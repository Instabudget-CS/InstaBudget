import { useState, useMemo } from "react";
import type { Transaction } from "@/lib/user-data-provider";
import type { Category } from "@/app/(app)/scan/types";
import type { SortOption } from "../types";

interface UseTransactionsFiltersProps {
  transactions: Transaction[];
}

export function useTransactionsFilters({
  transactions,
}: UseTransactionsFiltersProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("date-desc");
  const [filterCategory, setFilterCategory] = useState<Category | "all">("all");

  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = [...transactions];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((t) =>
        (t.merchant || "").toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (filterCategory !== "all") {
      filtered = filtered.filter((t) => t.category === filterCategory);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return (
            new Date(b.transaction_date).getTime() -
            new Date(a.transaction_date).getTime()
          );
        case "date-asc":
          return (
            new Date(a.transaction_date).getTime() -
            new Date(b.transaction_date).getTime()
          );
        case "amount-desc":
          return b.total_amount - a.total_amount;
        case "amount-asc":
          return a.total_amount - b.total_amount;
        case "merchant-asc":
          return (a.merchant || "").localeCompare(b.merchant || "");
        case "merchant-desc":
          return (b.merchant || "").localeCompare(a.merchant || "");
        default:
          return 0;
      }
    });

    return filtered;
  }, [transactions, searchQuery, sortBy, filterCategory]);

  const clearFilters = () => {
    setSearchQuery("");
    setFilterCategory("all");
    setSortBy("date-desc");
  };

  const hasActiveFilters: boolean = Boolean(
    searchQuery || filterCategory !== "all" || sortBy !== "date-desc"
  );

  return {
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    filterCategory,
    setFilterCategory,
    filteredAndSortedTransactions,
    clearFilters,
    hasActiveFilters,
  };
}
