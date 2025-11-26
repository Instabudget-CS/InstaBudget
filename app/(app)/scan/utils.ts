import type { TransactionFormData } from "./types";
import type { EdgeFunctionResponse } from "./types";
import { mockExtractedData } from "./constants";

export const transformTransactionToFormData = (
  transaction: EdgeFunctionResponse["transaction"]
): TransactionFormData | null => {
  if (!transaction) return null;

  const items = JSON.parse(transaction.transaction_items || "[]");
  return {
    merchant: transaction.merchant || "",
    amount: transaction.total_amount?.toString() || "0",
    category: (transaction.category ||
      "other") as typeof mockExtractedData.category,
    txnDate:
      transaction.transaction_date || new Date().toISOString().split("T")[0],
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
