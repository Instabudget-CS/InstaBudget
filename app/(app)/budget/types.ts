import type { ProfileBudgetConfig } from "@/components/ui/budget_cycle_card";
import type { BudgetCategoryRow } from "@/components/ui/category_limits_card";

export interface CategoryProgress {
  id: string;
  name: string;
  spent: number;
  limit: number;
}

export interface BudgetCalculations {
  categoryProgress: CategoryProgress[];
  totalLimit: number;
  totalSpent: number;
  totalCategoryLimit: number;
}

export interface BudgetState {
  profileBudget: ProfileBudgetConfig;
  localCategories: BudgetCategoryRow[];
  isSaving: boolean;
}
