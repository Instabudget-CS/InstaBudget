import type { Transaction } from "@/lib/user-data-provider";
import type { Category, TransactionFormData } from "@/app/(app)/scan/types";

/**
 * Format date to readable string
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format currency amount
 */
export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

/**
 * Convert transaction to form data format
 */
export function convertTransactionToFormData(
  transaction: Transaction
): TransactionFormData {
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
}
