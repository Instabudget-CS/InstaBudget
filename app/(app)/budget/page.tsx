"use client";

import { BudgetCycleCard } from "@/components/ui/budget_cycle_card";
import { CategoryLimitsCard } from "@/components/ui/category_limits_card";
import { BudgetProgressCard } from "@/components/ui/budget_progress_card";
import { useAuth } from "@/lib/auth-provider";
import { useUserData } from "@/lib/user-data-provider";
import { useBudgetState } from "./hooks/use-budget-state";
import { useBudgetCategories } from "./hooks/use-budget-categories";
import { useBudgetCalculations } from "./hooks/use-budget-calculations";
import { useBudgetSave } from "./hooks/use-budget-save";
import { BudgetHeader } from "./components/budget-header";
import { BudgetSnapshotCard } from "./components/budget-snapshot-card";
import { BudgetSaveButton } from "./components/budget-save-button";
import { LoadingState } from "./components/loading-state";

export default function BudgetPage() {
  const { user, profile, updateProfile } = useAuth();
  const {
    budgetCategories,
    loading,
    addBudgetCategory,
    updateBudgetCategory,
    deleteBudgetCategory,
    refreshBudgetCategories,
  } = useUserData();

  const { profileBudget, handleProfileBudgetChange } = useBudgetState({
    profile,
  });

  const { localCategories, handleCategoriesChange, saveCategories } =
    useBudgetCategories({
      budgetCategories,
      addBudgetCategory,
      updateBudgetCategory,
      deleteBudgetCategory,
      refreshBudgetCategories,
      userId: user?.id,
    });

  const { categoryProgress, totalLimit, totalSpent, totalCategoryLimit } =
    useBudgetCalculations({
      localCategories,
    });

  const { isSaving, handleSaveAll } = useBudgetSave({
    user,
    profile,
    profileBudget,
    updateProfile,
    saveCategories,
  });

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="mx-auto mb-20 max-w-4xl space-y-6">
      <BudgetHeader />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <BudgetCycleCard
          config={profileBudget}
          onChange={handleProfileBudgetChange}
        />
        <BudgetSnapshotCard
          profileBudget={profileBudget}
          totalCategoryLimit={totalCategoryLimit}
        />
      </div>

      <CategoryLimitsCard
        categories={localCategories}
        onChange={handleCategoriesChange}
        currency={profileBudget.currency}
        userId={user?.id || ""}
      />

      <BudgetProgressCard
        cycleLabel="Current Cycle"
        cycleRange={{
          start: profileBudget.cycle_startDate,
          end: profileBudget.cycle_endDate || undefined,
        }}
        totalLimit={totalLimit}
        totalSpent={totalSpent}
        categories={categoryProgress}
        currency={profileBudget.currency}
      />

      <BudgetSaveButton onSave={handleSaveAll} isSaving={isSaving} />
    </div>
  );
}
