import { useMemo } from "react";
import type { Transaction } from "@/lib/user-data-provider";
import type { TransactionStats } from "../types";

interface UseTransactionsStatsProps {
  filteredTransactions: Transaction[];
}

export function useTransactionsStats({
  filteredTransactions,
}: UseTransactionsStatsProps): TransactionStats {
  const stats = useMemo(() => {
    const total = filteredTransactions.length;
    const totalAmount = filteredTransactions.reduce(
      (sum, t) => sum + t.total_amount,
      0
    );
    return { total, totalAmount };
  }, [filteredTransactions]);

  return stats;
}
