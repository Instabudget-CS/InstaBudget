import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { EDGE_FUNCTION_URL } from "../constants";
import { transformTransactionToFormData } from "../utils";
import type { EdgeFunctionResponse } from "../types";
import type { SavedTransaction } from "../types";
import type { TransactionFormData } from "../types";
import { mockExtractedData } from "../constants";

interface UseEdgeFunctionProps {
  onAutoSaveSuccess: (transaction: SavedTransaction) => void;
  onPreviewSuccess: (data: TransactionFormData, receiptId: string) => void;
  onError: () => void;
}

export function useEdgeFunction({
  onAutoSaveSuccess,
  onPreviewSuccess,
  onError,
}: UseEdgeFunctionProps) {
  const callEdgeFunction = async (
    file: File,
    userId: string,
    autoSave: boolean
  ) => {
    try {
      const formData = new FormData();
      formData.append("receipt_file", file);
      formData.append("user_id", userId);
      formData.append("isAuto", autoSave ? "true" : "false");

      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) {
        throw new Error("No authentication token available");
      }

      const response = await fetch(EDGE_FUNCTION_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Failed to process receipt: ${response.statusText}`
        );
      }

      const result: EdgeFunctionResponse = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to extract receipt data");
      }

      if (result.mode === "auto" && result.transaction) {
        // Auto-save mode: transaction was already saved
        const savedTx = result.transaction as SavedTransaction;
        onAutoSaveSuccess(savedTx);
      } else if (result.mode === "preview" && result.transaction) {
        // Preview mode: show edit form
        const transformedData = transformTransactionToFormData(
          result.transaction
        );

        if (!transformedData) {
          throw new Error("Failed to transform transaction data");
        }

        const receiptId = result.transaction.receipt_id || "";
        onPreviewSuccess(transformedData, receiptId);
      } else {
        throw new Error("Unexpected response format from edge function");
      }
    } catch (error) {
      console.error("Error calling edge function:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to extract receipt data. Please try again.",
        variant: "destructive",
      });
      onError();
    }
  };

  return { callEdgeFunction };
}
