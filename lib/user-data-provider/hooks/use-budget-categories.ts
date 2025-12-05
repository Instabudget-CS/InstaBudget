import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { BudgetCategory, Transaction } from "../types";
import type { UserProfile } from "@/lib/auth-provider";
import { calculateCategorySpent } from "../utils/calculate-category-spent";
import type { User } from "@supabase/supabase-js";

interface UseBudgetCategoriesProps {
  user: User | null;
  profile: UserProfile | null;
  transactions: Transaction[];
}

export function useBudgetCategories({
  user,
  profile,
  transactions,
}: UseBudgetCategoriesProps) {
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>(
    []
  );

  const updateSpentAmountsInDB = useCallback(
    async (categories: BudgetCategory[]) => {
      if (!user || categories.length === 0) return;

      try {
        const updates = categories.map((category) => ({
          id: category.id,
          spent_amount: category.spent_amount,
        }));

        await Promise.all(
          updates.map((update) =>
            supabase
              .from("budget_categories")
              .update({ spent_amount: update.spent_amount })
              .eq("id", update.id)
              .eq("user_id", user.id)
          )
        );
      } catch (error) {
        console.error("Error updating spent_amount in database:", error);
      }
    },
    [user]
  );

  const fetchBudgetCategories = useCallback(async () => {
    if (!user) {
      setBudgetCategories([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("budget_categories")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching budget categories:", error);
        return;
      }

      const categoriesWithSpent = (data || []).map((category) => {
        const spent = calculateCategorySpent(
          category.category_name,
          transactions,
          profile?.cycle_startDate,
          profile?.cycle_endDate
        );
        return {
          ...category,
          limit_amount: Number(category.limit_amount) || 0,
          spent_amount: spent,
        };
      });

      setBudgetCategories(categoriesWithSpent);

      await updateSpentAmountsInDB(categoriesWithSpent);
    } catch (error) {
      console.error("Error fetching budget categories:", error);
    }
  }, [
    user,
    transactions,
    profile?.cycle_startDate,
    profile?.cycle_endDate,
    updateSpentAmountsInDB,
  ]);

  useEffect(() => {
    if (user && budgetCategories.length > 0 && transactions.length > 0) {
      const updatedCategories = budgetCategories.map((category) => ({
        ...category,
        spent_amount: calculateCategorySpent(
          category.category_name,
          transactions,
          profile?.cycle_startDate,
          profile?.cycle_endDate
        ),
      }));

      setBudgetCategories(updatedCategories);

      updateSpentAmountsInDB(updatedCategories);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions, profile?.cycle_startDate, profile?.cycle_endDate]);

  const refreshBudgetCategories = useCallback(async () => {
    await fetchBudgetCategories();
  }, [fetchBudgetCategories]);

  const addBudgetCategory = useCallback(
    async (
      category: Omit<
        BudgetCategory,
        "id" | "created_at" | "updated_at" | "spent_amount"
      >
    ) => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("budget_categories")
          .insert([
            {
              user_id: user.id,
              category_name: category.category_name,
              limit_amount: category.limit_amount,
              spent_amount: 0,
            },
          ])
          .select()
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          const spent = calculateCategorySpent(
            data.category_name,
            transactions,
            profile?.cycle_startDate,
            profile?.cycle_endDate
          );
          const newCategory = {
            ...data,
            limit_amount: Number(data.limit_amount) || 0,
            spent_amount: spent,
          };
          setBudgetCategories((prev) => [...prev, newCategory]);

          await supabase
            .from("budget_categories")
            .update({ spent_amount: spent })
            .eq("id", data.id)
            .eq("user_id", user.id);
        }
      } catch (error) {
        console.error("Error adding budget category:", error);
        throw error;
      }
    },
    [user, transactions, profile?.cycle_startDate, profile?.cycle_endDate]
  );

  const updateBudgetCategory = useCallback(
    async (
      id: string,
      updates: Partial<
        Omit<BudgetCategory, "id" | "user_id" | "created_at" | "updated_at">
      >
    ) => {
      if (!user) return;

      try {
        const updateData: {
          category_name?: string;
          limit_amount?: number;
        } = {};
        if (updates.category_name !== undefined) {
          updateData.category_name = updates.category_name;
        }
        if (updates.limit_amount !== undefined) {
          updateData.limit_amount = updates.limit_amount;
        }

        const { data, error } = await supabase
          .from("budget_categories")
          .update(updateData)
          .eq("id", id)
          .eq("user_id", user.id)
          .select()
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          const spent = calculateCategorySpent(
            data.category_name,
            transactions,
            profile?.cycle_startDate,
            profile?.cycle_endDate
          );
          const updatedCategory = {
            ...data,
            limit_amount: Number(data.limit_amount) || 0,
            spent_amount: spent,
          };
          setBudgetCategories((prev) =>
            prev.map((cat) => (cat.id === id ? updatedCategory : cat))
          );

          await supabase
            .from("budget_categories")
            .update({ spent_amount: spent })
            .eq("id", id)
            .eq("user_id", user.id);
        }
      } catch (error) {
        console.error("Error updating budget category:", error);
        throw error;
      }
    },
    [user, transactions, profile?.cycle_startDate, profile?.cycle_endDate]
  );

  const deleteBudgetCategory = useCallback(
    async (id: string) => {
      if (!user) return;

      try {
        const { error } = await supabase
          .from("budget_categories")
          .delete()
          .eq("id", id)
          .eq("user_id", user.id);

        if (error) {
          throw error;
        }

        setBudgetCategories((prev) => prev.filter((cat) => cat.id !== id));
      } catch (error) {
        console.error("Error deleting budget category:", error);
        throw error;
      }
    },
    [user]
  );

  return {
    budgetCategories,
    fetchBudgetCategories,
    refreshBudgetCategories,
    addBudgetCategory,
    updateBudgetCategory,
    deleteBudgetCategory,
  };
}
