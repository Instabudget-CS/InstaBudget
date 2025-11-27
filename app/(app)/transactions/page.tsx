"use client";

import { useState } from "react";
import { useUserData } from "@/lib/user-data-provider";
import { useTransactionsFilters } from "./hooks/use-transactions-filters";
import { useTransactionsStats } from "./hooks/use-transactions-stats";
import { useTransactionEdit } from "./hooks/use-transaction-edit";
import { TransactionsHeader } from "./components/transactions-header";
import { TransactionsStats } from "./components/transactions-stats";
import { TransactionsFilters } from "./components/transactions-filters";
import { TransactionsList } from "./components/transactions-list";
import { TransactionEditDialog } from "./components/transaction-edit-dialog";
import type { TransactionFormData } from "@/app/(app)/scan/types";

export default function TransactionsPage() {
  const { transactions, loading, updateTransaction, refreshTransactions } =
    useUserData();

  const [selectedTransactionId, setSelectedTransactionId] = useState<
    string | null
  >(null);

  const {
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    filterCategory,
    setFilterCategory,
    filteredAndSortedTransactions,
    clearFilters,
    hasActiveFilters,
  } = useTransactionsFilters({ transactions });

  const stats = useTransactionsStats({
    filteredTransactions: filteredAndSortedTransactions,
  });

  const { isSaving, handleSaveTransaction } = useTransactionEdit({
    updateTransaction,
    refreshTransactions,
  });

  const selectedTransaction = transactions.find(
    (t) => t.id === selectedTransactionId
  );

  const handleEditSave = async (formData: TransactionFormData) => {
    if (!selectedTransaction) return;
    const success = await handleSaveTransaction(selectedTransaction, formData);
    if (success) {
      setSelectedTransactionId(null);
    }
  };

  return (
    <div className="space-y-6">
      <TransactionsHeader />

      <TransactionsStats
        stats={stats}
        defaultCurrency={transactions[0]?.currency || "USD"}
      />

      <TransactionsFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
        filterCategory={filterCategory}
        onCategoryChange={setFilterCategory}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
      />

      <TransactionsList
        transactions={transactions}
        filteredTransactions={filteredAndSortedTransactions}
        loading={loading}
        onTransactionClick={setSelectedTransactionId}
      />

      <TransactionEditDialog
        transaction={selectedTransaction || null}
        open={!!selectedTransactionId}
        onOpenChange={(open) => {
          if (!open) setSelectedTransactionId(null);
        }}
        onSave={handleEditSave}
        isSaving={isSaving}
      />
    </div>
  );
}
