"use client";

import { useRouter } from "next/navigation";
import { Plus, ScanLine } from "lucide-react";

import { Button } from "@/components/ui/button";
import { BudgetProgressCard } from "@/components/ui/budget_progress_card";
import { TransactionHistoryCard } from "@/components/ui/transaction_history_card";
import { LLMInsightsCard } from "@/components/ui/llm_insight_card";

import { useUserData } from "@/lib/user-data-provider";
import { useAuth } from "@/lib/auth-provider";
import { useBudgetLimitToasts } from "@/hooks/use-budget-limit-toasts";

export default function DashboardPage() {
  const router = useRouter();

  const { profile } = useAuth();
  const cycleStart = profile?.cycle_startDate ?? "";
  const cycleEnd = profile?.cycle_endDate ?? "";
  const {
    transactions,
    budgetCategories,
    calculateCategorySpent,
    aiInsights,
    insightsLoading,
  } = useUserData();
  const currency =
    profile?.preferred_currency ?? transactions[0]?.currency ?? "USD";
  const cycleLabel =
    cycleStart && cycleEnd ? `${cycleStart} – ${cycleEnd}` : "Current cycle";

  const categoryProgress = budgetCategories.map((cat) => {
    const spent = calculateCategorySpent(
      cat.category_name,
      cycleStart || undefined,
      cycleEnd || undefined
    );
    const limit = parseFloat(String(cat.limit_amount || "0"));

    return {
      id: cat.id,
      name: cat.category_name,
      spent,
      limit,
    };
  });
  const totalLimit = categoryProgress.reduce((sum, c) => sum + c.limit, 0);
  const totalSpent = categoryProgress.reduce((sum, c) => sum + c.spent, 0);

  useBudgetLimitToasts({
    categories: categoryProgress,
    totalLimit,
    totalSpent,
  });

  return (
    <div>
      <div>
        <h1 className="text-3xl font-bold text-green-500">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Budgeting progress, transaction history, and insights at a glance.
        </p>
        <div className="flex flex-wrap items-center gap-2 py-5">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="border-dashed border-green-300 text-xs text-green-700 hover:bg-green-50"
            onClick={() => {
              router.push("/scan");
            }}
          >
            <ScanLine className="mr-1.5 h-3.5 w-3.5" />
            Scan receipt (LLM)
          </Button>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,1fr)]">
        <div className="space-y-5">
          <BudgetProgressCard
            cycleLabel={cycleLabel}
            cycleRange={{
              start: cycleStart,
              end: cycleEnd || undefined,
            }}
            totalLimit={totalLimit}
            totalSpent={totalSpent}
            categories={categoryProgress}
            currency={currency}
          />
          <div
            className="cursor-pointer"
            onClick={() => {
              router.push("/transactions");
            }}
          >
            <TransactionHistoryCard
              transactions={transactions}
              rangeLabel={cycleLabel}
              fallbackCurrency={currency}
            />
          </div>
        </div>
        <div>
          <LLMInsightsCard insights={aiInsights} loading={insightsLoading} />
        </div>
      </div>
    </div>
  );
}
