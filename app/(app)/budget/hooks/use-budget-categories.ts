import { useState, useEffect, useMemo } from "react";
import type { BudgetCategoryRow } from "@/components/ui/category_limits_card";
import type { BudgetCategory } from "@/lib/user-data-provider";
import { toast } from "@/hooks/use-toast";

interface UseBudgetCategoriesProps {
  budgetCategories: BudgetCategory[];
  addBudgetCategory: (
    category: Omit<
      BudgetCategory,
      "id" | "created_at" | "updated_at" | "spent_amount"
    >
  ) => Promise<void>;
  updateBudgetCategory: (
    id: string,
    updates: Partial<
      Omit<BudgetCategory, "id" | "user_id" | "created_at" | "updated_at">
    >
  ) => Promise<void>;
  deleteBudgetCategory: (id: string) => Promise<void>;
  refreshBudgetCategories: () => Promise<void>;
  userId: string | undefined;
}

export function useBudgetCategories({
  budgetCategories,
  addBudgetCategory,
  updateBudgetCategory,
  deleteBudgetCategory,
  refreshBudgetCategories,
  userId,
}: UseBudgetCategoriesProps) {
  // Convert budget categories to BudgetCategoryRow format
  const categories: BudgetCategoryRow[] = useMemo(() => {
    return budgetCategories.map((cat) => ({
      id: cat.id,
      user_id: cat.user_id,
      category_name: cat.category_name,
      limit_amount: cat.limit_amount.toString(),
      spent_amount: cat.spent_amount.toString(),
      created_at: cat.created_at,
      updated_at: cat.updated_at,
    }));
  }, [budgetCategories]);

  const [localCategories, setLocalCategories] = useState<BudgetCategoryRow[]>(
    []
  );

  // Sync local categories with budgetCategories from provider
  useEffect(() => {
    setLocalCategories(categories);
  }, [categories]);

  const handleCategoriesChange = (newCategories: BudgetCategoryRow[]) => {
    setLocalCategories(newCategories);
  };

  const saveCategories = async () => {
    if (!userId) return;

    const existingIds = new Set(categories.map((c) => c.id));
    const newIds = new Set(localCategories.map((c) => c.id));

    // Deleted categories (only real DB IDs, not temp ones)
    const deleted = categories.filter(
      (c) => !newIds.has(c.id) && !c.id.startsWith("cat-")
    );
    for (const cat of deleted) {
      try {
        await deleteBudgetCategory(cat.id);
      } catch (error) {
        console.error("Error deleting category:", error);
        toast({
          title: "Error",
          description: `Failed to delete category: ${cat.category_name}`,
          variant: "destructive",
        });
      }
    }

    // Added or updated categories
    for (const newCat of localCategories) {
      // Skip empty categories
      if (!newCat.category_name.trim() || !newCat.limit_amount) {
        continue;
      }

      const isNewCategory =
        newCat.id.startsWith("cat-") || !existingIds.has(newCat.id);

      if (isNewCategory) {
        // New category
        try {
          await addBudgetCategory({
            user_id: userId,
            category_name: newCat.category_name.trim(),
            limit_amount: Number.parseFloat(newCat.limit_amount || "0"),
          });
          toast({
            title: "Success",
            description: `Category "${newCat.category_name}" added`,
          });
        } catch (error) {
          console.error("Error adding category:", error);
          toast({
            title: "Error",
            description: `Failed to add category: ${newCat.category_name}`,
            variant: "destructive",
          });
        }
      } else {
        // Updated category - check if anything changed
        const oldCat = categories.find((c) => c.id === newCat.id);
        if (
          oldCat &&
          (oldCat.category_name !== newCat.category_name ||
            oldCat.limit_amount !== newCat.limit_amount)
        ) {
          try {
            await updateBudgetCategory(newCat.id, {
              category_name: newCat.category_name.trim(),
              limit_amount: Number.parseFloat(newCat.limit_amount || "0"),
            });
          } catch (error) {
            console.error("Error updating category:", error);
            toast({
              title: "Error",
              description: `Failed to update category: ${newCat.category_name}`,
              variant: "destructive",
            });
          }
        }
      }
    }

    // Refresh to get updated data
    await refreshBudgetCategories();
  };

  return {
    localCategories,
    handleCategoriesChange,
    saveCategories,
  };
}
