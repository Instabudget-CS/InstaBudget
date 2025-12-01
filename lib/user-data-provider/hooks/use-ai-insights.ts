import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const AI_INSIGHTS_EDGE_FUNCTION_URL =
  "https://ijmcipjnduzdxswhkezs.supabase.co/functions/v1/ai_insight";

export interface AIInsightsResponse {
  success: boolean;
  timeframe_days: number;
  stats: {
    timeframe_days: number;
    total_spent: number;
    total_budget_limit: number;
    categories: Array<{
      category: string;
      limit: number;
      spent: number;
      percent_used: number | null;
    }>;
    transaction_count: number;
    since_date: string;
    today: string;
  };
  insights: string[];
}

interface UseAIInsightsProps {
  userId: string | null;
}

export function useAIInsights({ userId }: UseAIInsightsProps) {
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchInsights = useCallback(async () => {
    if (!userId) {
      setInsights([]);
      return;
    }

    setLoading(true);

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) {
        throw new Error("No authentication token available");
      }

      const response = await fetch(AI_INSIGHTS_EDGE_FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.session.access_token}`,
        },
        body: JSON.stringify({
          user_id: userId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Failed to fetch insights: ${response.statusText}`
        );
      }

      const result: AIInsightsResponse = await response.json();

      if (!result.success) {
        throw new Error("Failed to fetch insights");
      }

      setInsights(result.insights || []);
    } catch (error) {
      console.error("Error fetching AI insights:", error);
      setInsights([]);
      // Don't throw - this is a background update, shouldn't break the UI
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  return {
    insights,
    loading,
    refreshInsights: fetchInsights,
  };
}
