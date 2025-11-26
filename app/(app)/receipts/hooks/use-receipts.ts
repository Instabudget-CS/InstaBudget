import { useMemo } from "react";
import type { Transaction, Receipt } from "@/lib/user-data-provider";
import type { ReceiptWithTransaction } from "../types";

interface UseReceiptsProps {
  receipts: Receipt[];
  transactions: Transaction[];
  getReceiptUrl: (storagePath: string) => string;
}

export function useReceipts({
  receipts,
  transactions,
  getReceiptUrl,
}: UseReceiptsProps) {
  const receiptsWithTransactions = useMemo<ReceiptWithTransaction[]>(() => {
    return receipts.map((receipt) => {
      const transaction = transactions.find((t) => t.receipt_id === receipt.id);
      const receiptUrl = getReceiptUrl(receipt.storage_path);
      return { ...receipt, transaction, url: receiptUrl };
    });
  }, [receipts, transactions, getReceiptUrl]);

  return { receiptsWithTransactions };
}
