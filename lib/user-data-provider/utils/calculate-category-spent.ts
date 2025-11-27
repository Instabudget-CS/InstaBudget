import type { Transaction } from "../types";

export function calculateCategorySpent(
  categoryName: string,
  transactions: Transaction[],
  startDate?: string,
  endDate?: string
): number {
  let filtered = transactions.filter(
    (t) => t.category?.toLowerCase() === categoryName.toLowerCase()
  );

  if (startDate) {
    filtered = filtered.filter(
      (t) => new Date(t.transaction_date) >= new Date(startDate)
    );
  }

  if (endDate) {
    filtered = filtered.filter(
      (t) => new Date(t.transaction_date) <= new Date(endDate)
    );
  }

  return filtered.reduce((sum, t) => sum + t.total_amount, 0);
}
