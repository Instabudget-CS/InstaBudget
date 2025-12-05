import type { TransactionFormData } from "./types";
import type { EdgeFunctionResponse } from "./types";
import { mockExtractedData } from "./constants";
import { getTodayLocal, getTodayUTC } from "@/lib/date-utils";

export const transformTransactionToFormData = (
  transaction: EdgeFunctionResponse["transaction"]
): TransactionFormData | null => {
  if (!transaction) return null;

  const items = JSON.parse(transaction.transaction_items || "[]");

  // this prevents timezone issues where UTC today might be tomorrow locally
  let txnDate = transaction.transaction_date || getTodayLocal();
  if (transaction.transaction_date) {
    const todayUTC = getTodayUTC();

    if (transaction.transaction_date === todayUTC) {
      txnDate = getTodayLocal();
    } else {
      txnDate = transaction.transaction_date;
    }
  }

  return {
    merchant: transaction.merchant || "",
    amount: transaction.total_amount?.toString() || "0",
    category: (transaction.category ||
      "other") as typeof mockExtractedData.category,
    txnDate,
    notes: transaction.notes || "",
    items: items.map((item: { item: string; price: number }) => ({
      name: item.item || "",
      price: item.price || 0,
    })),
  };
};

export const buildTransactionPayload = (
  formData: TransactionFormData,
  userId: string,
  currency: string,
  receiptId?: string | null
) => {
  const payload: {
    user_id: string;
    receipt_id?: string;
    transaction_items: string;
    merchant: string | null;
    total_amount: number;
    currency: string;
    category: string | null;
    transaction_date: string;
    notes?: string | null;
  } = {
    user_id: userId,
    transaction_items: JSON.stringify(formData.items),
    merchant: formData.merchant.trim() || null,
    total_amount: Number.parseFloat(formData.amount),
    currency,
    category: formData.category.toLowerCase() || null,
    transaction_date: formData.txnDate,
  };

  if (receiptId) {
    payload.receipt_id = receiptId;
  }

  if (formData.notes.trim()) {
    payload.notes = formData.notes.trim();
  }

  return payload;
};

export const validateTransactionForm = (
  formData: TransactionFormData
): string | null => {
  if (!formData.merchant.trim()) {
    return "Merchant name is required";
  }

  if (formData.items.length === 0) {
    return "Please add at least one item";
  }

  return null;
};
