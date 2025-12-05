import { useMemo } from "react";
import type { BudgetCategoryRow } from "@/components/ui/category_limits_card";
import type { BudgetCalculations } from "../types";

interface UseBudgetCalculationsProps {
  localCategories: BudgetCategoryRow[];
}

export function useBudgetCalculations({
  localCategories,
}: UseBudgetCalculationsProps): BudgetCalculations {
  const categoryProgress = useMemo(() => {
    return localCategories
      .filter((cat) => cat.category_name.trim() && cat.limit_amount)
      .map((cat) => ({
        id: cat.id,
        name: cat.category_name,
        spent: Number.parseFloat(cat.spent_amount || "0"),
        limit: Number.parseFloat(cat.limit_amount || "0"),
      }));
  }, [localCategories]);

  // calculates the combined progress for all categories
  const totalLimit = useMemo(
    () => categoryProgress.reduce((sum, c) => sum + c.limit, 0),
    [categoryProgress]
  );

  const totalSpent = useMemo(
    () => categoryProgress.reduce((sum, c) => sum + c.spent, 0),
    [categoryProgress]
  );

  const totalCategoryLimit = useMemo(
    () =>
      localCategories.reduce((sum, c) => {
        const value = Number.parseFloat(c.limit_amount || "0");
        return sum + (Number.isNaN(value) ? 0 : value);
      }, 0),
    [localCategories]
  );

  return {
    categoryProgress,
    totalLimit,
    totalSpent,
    totalCategoryLimit,
  };
}
