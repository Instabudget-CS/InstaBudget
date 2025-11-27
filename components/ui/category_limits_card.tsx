"use client";

import { Plus, Trash2 } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Spending category enum values
export const SPENDING_CATEGORIES = [
  "groceries",
  "dining",
  "transport",
  "shopping",
  "entertainment",
  "utilities",
  "health",
  "education",
  "rent",
  "subscriptions",
  "travel",
  "income",
  "other",
] as const;

export type SpendingCategory = (typeof SPENDING_CATEGORIES)[number];

// matches the budget_categories table
export interface BudgetCategoryRow {
  id: string;
  user_id: string;
  category_name: string;
  limit_amount: string;
  spent_amount: string;
  created_at: string;
  updated_at: string;
}

interface CategoryLimitsCardProps {
  categories: BudgetCategoryRow[];
  onChange: (categories: BudgetCategoryRow[]) => void;
  currency: string;
  userId?: string;
}

export function CategoryLimitsCard({
  categories,
  onChange,
  currency,
  userId = "",
}: CategoryLimitsCardProps) {
  const updateCategoryField = (
    id: string,
    field: keyof BudgetCategoryRow,
    value: string
  ) => {
    onChange(
      categories.map((cat) =>
        cat.id === id ? { ...cat, [field]: value } : cat
      )
    );
  };

  const handleAddCategory = () => {
    const id = `cat-${Math.random().toString(36).slice(2, 8)}`;
    onChange([
      ...categories,
      {
        // Matches DB for budget_categories table
        id,
        user_id: userId,
        category_name: "",
        limit_amount: "",
        spent_amount: "0",
        created_at: "",
        updated_at: "",
      },
    ]);
  };

  const handleRemoveCategory = (id: string) => {
    onChange(categories.filter((cat) => cat.id !== id));
  };

  return (
    <Card className="relative">
      <CardHeader>
        <CardTitle className="text-green-500">
          Categories & Spending Limits
        </CardTitle>
        <CardDescription>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Categories can be adjusted any time.
            </p>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="grid grid-cols-[2fr_1fr_auto] items-center gap-3 text-xs font-medium text-muted-foreground">
            <span>Category Name</span>
            <span>Limit / Cycle</span>
            <span className="text-right">Actions</span>
          </div>

          <div className="space-y-2">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="grid grid-cols-1 gap-3 rounded-lg border border-gray-200 p-3 sm:grid-cols-[2fr_1fr_auto]"
              >
                {/* category_name */}
                <div className="space-y-1">
                  <Label className="sm:hidden">Category Name</Label>
                  <Select
                    value={cat.category_name || ""}
                    onValueChange={(value) =>
                      updateCategoryField(cat.id, "category_name", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {SPENDING_CATEGORIES.map((category) => {
                        // Check if this category is already used by another category
                        const isUsed = categories.some(
                          (c) =>
                            c.id !== cat.id &&
                            c.category_name.toLowerCase() ===
                              category.toLowerCase()
                        );
                        return (
                          <SelectItem
                            key={category}
                            value={category}
                            disabled={isUsed}
                          >
                            <span className="capitalize">
                              {category}
                              {isUsed && " (already used)"}
                            </span>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* limit_amount */}
                <div className="space-y-1">
                  <Label className="sm:hidden">Limit / Cycle</Label>
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-muted-foreground">
                      {currency}
                    </span>
                    <Input
                      value={cat.limit_amount}
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      onChange={(e) =>
                        updateCategoryField(
                          cat.id,
                          "limit_amount",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleRemoveCategory(cat.id)}
                    aria-label="Remove category"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}

            {categories.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No categories yet. Add your first category to start budgeting.
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-start pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-green-400 text-green-700 hover:bg-green-50"
            onClick={handleAddCategory}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add Category
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
