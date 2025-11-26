"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, ShoppingCart, Receipt, Loader2 } from "lucide-react";
import { useUserData } from "@/lib/user-data-provider";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { TransactionForm } from "@/app/(app)/scan/components/transaction-form";
import type { Category, TransactionFormData } from "@/app/(app)/scan/types";

type SortOption =
  | "date-desc"
  | "date-asc"
  | "amount-desc"
  | "amount-asc"
  | "merchant-asc"
  | "merchant-desc";

const categoryLabels: Record<Category, string> = {
  groceries: "Groceries",
  dining: "Dining",
  transport: "Transport",
  shopping: "Shopping",
  entertainment: "Entertainment",
  utilities: "Utilities",
  health: "Health",
  education: "Education",
  rent: "Rent",
  subscriptions: "Subscriptions",
  travel: "Travel",
  income: "Income",
  other: "Other",
};

export default function TransactionsPage() {
  const { transactions, loading, updateTransaction, refreshTransactions } =
    useUserData();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("date-desc");
  const [filterCategory, setFilterCategory] = useState<Category | "all">("all");
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(
    null
  );
  const [isSaving, setIsSaving] = useState(false);

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

  const stats = useMemo(() => {
    const total = filteredAndSortedTransactions.length;
    const totalAmount = filteredAndSortedTransactions.reduce(
      (sum, t) => sum + t.total_amount,
      0
    );
    return { total, totalAmount };
  }, [filteredAndSortedTransactions]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
  };

  const selectedTransactionData = transactions.find(
    (t) => t.id === selectedTransaction
  );

  const convertTransactionToFormData = (
    transaction: (typeof transactions)[0]
  ): TransactionFormData => {
    const items = JSON.parse(transaction.transaction_items || "[]");
    return {
      merchant: transaction.merchant || "",
      amount: transaction.total_amount.toString(),
      category: (transaction.category || "other") as Category,
      txnDate: transaction.transaction_date,
      notes: transaction.notes || "",
      items: items.map(
        (item: { item?: string; name?: string; price: number }) => ({
          name: item.item || item.name || "",
          price: item.price || 0,
        })
      ),
    };
  };

  const handleSaveTransaction = async (formData: TransactionFormData) => {
    if (!selectedTransactionData) return;

    setIsSaving(true);
    try {
      const transactionData = {
        transaction_items: JSON.stringify(formData.items),
        merchant: formData.merchant.trim() || null,
        total_amount: Number.parseFloat(formData.amount),
        category: formData.category.toLowerCase() || null,
        transaction_date: formData.txnDate,
        notes: formData.notes.trim() || null,
      };

      const { error } = await supabase
        .from("transactions")
        .update(transactionData)
        .eq("id", selectedTransactionData.id);

      if (error) {
        throw error;
      }

      // Update local state
      updateTransaction(selectedTransactionData.id, transactionData);

      toast({
        title: "Success",
        description: "Transaction updated successfully",
      });

      // Refresh to get latest data
      await refreshTransactions();
      setSelectedTransaction(null);
    } catch (error) {
      console.error("Error updating transaction:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update transaction. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-balance text-3xl font-bold tracking-tight">
          Transactions
        </h1>
        <p className="text-pretty text-muted-foreground mt-1">
          View and manage all your transactions
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Transactions</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-1">
              <ShoppingCart className="h-4 w-4 text-primary" />
              Total Spent
            </CardDescription>
            <CardTitle className="text-3xl text-primary">
              {formatCurrency(
                stats.totalAmount,
                transactions[0]?.currency || "USD"
              )}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filter & Sort</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search merchant..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Sort */}
            <Select
              value={sortBy}
              onValueChange={(value) => setSortBy(value as SortOption)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Date (Newest)</SelectItem>
                <SelectItem value="date-asc">Date (Oldest)</SelectItem>
                <SelectItem value="amount-desc">
                  Amount (High to Low)
                </SelectItem>
                <SelectItem value="amount-asc">Amount (Low to High)</SelectItem>
                <SelectItem value="merchant-asc">Merchant (A-Z)</SelectItem>
                <SelectItem value="merchant-desc">Merchant (Z-A)</SelectItem>
              </SelectContent>
            </Select>

            {/* Category Filter */}
            <Select
              value={filterCategory}
              onValueChange={(value) =>
                setFilterCategory(value as Category | "all")
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters */}
          {(searchQuery ||
            filterCategory !== "all" ||
            sortBy !== "date-desc") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setFilterCategory("all");
                setSortBy("date-desc");
              }}
            >
              Clear Filters
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
          <CardDescription>
            Showing {filteredAndSortedTransactions.length} of{" "}
            {transactions.length} transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">
                Loading transactions...
              </p>
            </div>
          ) : filteredAndSortedTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No transactions found</p>
              <p className="text-sm text-muted-foreground">
                {transactions.length === 0
                  ? "Start by adding your first transaction"
                  : "Try adjusting your filters or search query"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAndSortedTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  onClick={() => setSelectedTransaction(transaction.id)}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 rounded-lg border p-4 transition-colors hover:bg-accent cursor-pointer"
                >
                  <div className="flex flex-1 items-start sm:items-center gap-3 sm:gap-4 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <ShoppingCart className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="font-medium truncate">
                          {transaction.merchant || "Unknown Merchant"}
                        </p>
                        {transaction.category && (
                          <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground shrink-0">
                            {categoryLabels[transaction.category as Category] ||
                              transaction.category}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm text-muted-foreground">
                        <span className="shrink-0">
                          {formatDate(transaction.transaction_date)}
                        </span>
                        {transaction.notes && (
                          <>
                            <span className="hidden sm:inline">•</span>
                            <span className="line-clamp-2">
                              {transaction.notes}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-left sm:text-right shrink-0">
                    <p className="text-lg font-semibold text-primary">
                      {formatCurrency(
                        transaction.total_amount,
                        transaction.currency
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Transaction Dialog */}
      <Dialog
        open={!!selectedTransaction}
        onOpenChange={(open) => {
          if (!open) setSelectedTransaction(null);
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
          </DialogHeader>
          {selectedTransactionData && (
            <TransactionForm
              onSave={handleSaveTransaction}
              onCancel={() => setSelectedTransaction(null)}
              isReadOnly={false}
              isLoading={isSaving}
              initialData={convertTransactionToFormData(
                selectedTransactionData
              )}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
