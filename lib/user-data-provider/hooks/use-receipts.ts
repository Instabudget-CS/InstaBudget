import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Receipt } from "../types";
import type { User } from "@supabase/supabase-js";

interface UseReceiptsProps {
  user: User | null;
}

export function useReceipts({ user }: UseReceiptsProps) {
  const [receipts, setReceipts] = useState<Receipt[]>([]);

  const fetchReceipts = useCallback(async () => {
    if (!user) {
      setReceipts([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("receipts")
        .select("*")
        .eq("user_id", user.id)
        .order("uploaded_at", { ascending: false });

      if (error) {
        console.error("Error fetching receipts:", error);
        return;
      }

      setReceipts(data || []);
    } catch (error) {
      console.error("Error fetching receipts:", error);
    }
  }, [user]);

  const refreshReceipts = useCallback(async () => {
    await fetchReceipts();
  }, [fetchReceipts]);

  const addReceipt = useCallback((receipt: Receipt) => {
    setReceipts((prev) => [receipt, ...prev]);
  }, []);

  const getReceiptUrl = useCallback((storagePath: string): string => {
    const { data } = supabase.storage
      .from("receipts")
      .getPublicUrl(storagePath);
    return data.publicUrl;
  }, []);

  return {
    receipts,
    fetchReceipts,
    refreshReceipts,
    addReceipt,
    getReceiptUrl,
  };
}
