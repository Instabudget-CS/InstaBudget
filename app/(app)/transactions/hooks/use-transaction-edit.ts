import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import type { Transaction } from "@/lib/user-data-provider";
import type { TransactionFormData } from "@/app/(app)/scan/types";

interface UseTransactionEditProps {
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  refreshTransactions: () => Promise<void>;
}

export function useTransactionEdit({
  updateTransaction,
  refreshTransactions,
}: UseTransactionEditProps) {
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveTransaction = async (
    transaction: Transaction,
    formData: TransactionFormData
  ) => {
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
        .eq("id", transaction.id);

      if (error) {
        throw error;
      }

      updateTransaction(transaction.id, transactionData);

      toast({
        title: "Success",
        description: "Transaction updated successfully",
      });

      await refreshTransactions();
      return true;
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
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    handleSaveTransaction,
  };
}
