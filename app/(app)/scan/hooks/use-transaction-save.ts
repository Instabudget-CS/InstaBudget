import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { buildTransactionPayload, validateTransactionForm } from "../utils";
import type { TransactionFormData } from "../types";
import type { Transaction } from "@/lib/user-data-provider";

interface UseTransactionSaveProps {
  onSuccess: () => void;
  onTransactionSaved?: (transaction: Transaction) => void;
}

export function useTransactionSave({
  onSuccess,
  onTransactionSaved,
}: UseTransactionSaveProps) {
  const router = useRouter();

  const saveTransaction = async (
    formData: TransactionFormData,
    userId: string,
    currency: string,
    receiptId?: string | null
  ): Promise<Transaction | null> => {
    // Validate form
    const validationError = validateTransactionForm(formData);
    if (validationError) {
      toast({
        title: "Error",
        description: validationError,
        variant: "destructive",
      });
      return null;
    }

    try {
      const transactionData = buildTransactionPayload(
        formData,
        userId,
        currency,
        receiptId
      );

      const { data, error } = await supabase
        .from("transactions")
        .insert([transactionData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (data && onTransactionSaved) {
        onTransactionSaved(data);
      }

      toast({
        title: "Success",
        description: "Transaction saved successfully",
      });

      onSuccess();
      router.push("/transactions");
      return data;
    } catch (error) {
      console.error("Error saving transaction:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to save transaction. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  return { saveTransaction };
}
