"use client";

import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export type BudgetCategoryProgress = {
  id: string | number;
  name: string;
  spent: number;
  limit: number;
};

type UseBudgetLimitToastsParams = {
  categories: BudgetCategoryProgress[];
  totalLimit: number;
  totalSpent: number;
};

export function useBudgetLimitToasts({
  categories,
  totalLimit,
  totalSpent,
}: UseBudgetLimitToastsParams) {
  const { toast } = useToast();

  const hasData = categories.length > 0 && totalLimit > 0;

  const exceededCategories = hasData
    ? categories.filter((c) => c.limit > 0 && c.spent >= c.limit)
    : [];

  const approachingCategories = hasData
    ? categories.filter(
        (c) => c.limit > 0 && c.spent / c.limit >= 0.7 && c.spent < c.limit
      )
    : [];

  const exceededNames = exceededCategories.map((c) => c.name);
  const approachingNames = approachingCategories.map((c) => c.name);
  const exceededNamesText = exceededNames.join(", ");
  const approachingNamesText = approachingNames.join(", ");

  const totalRatio = hasData ? totalSpent / totalLimit : 0;
  const totalApproaching = hasData && totalRatio >= 0.7 && totalRatio < 1;
  const totalExceeded = hasData && totalRatio >= 1;

  const shouldShowExceeded =
    hasData && (totalExceeded || exceededCategories.length > 0);

  const shouldShowApproaching =
    hasData &&
    !shouldShowExceeded &&
    (totalApproaching || approachingCategories.length > 0);

  const exceededDescription = (() => {
    if (!hasData) return "";

    const parts: string[] = [];

    if (totalExceeded) {
      parts.push("Your total budget is at or above 100%.");
    }

    if (exceededNames.length > 0) {
      parts.push(`Categories that exceeded limit: ${exceededNamesText}.`);
    }

    if (approachingNames.length > 0) {
      parts.push(`Categories approaching limit: ${approachingNamesText}.`);
    }

    if (parts.length === 0) {
      return "You have exceeded your limit of at least one budget.";
    }

    return parts.join(" ");
  })();

  const approachingDescription = (() => {
    if (!hasData) return "";

    const parts: string[] = [];

    if (totalApproaching) {
      parts.push("Your total budget is between approaching its limit.");
    }

    if (approachingNames.length > 0) {
      parts.push(
        `Categories between approaching limit: ${approachingNamesText}.`
      );
    }

    if (parts.length === 0) {
      return "You are appraoching the limit of at least one budget.";
    }

    return parts.join(" ");
  })();

  useEffect(() => {
    if (!hasData) return;

    if (shouldShowExceeded) {
      toast({
        variant: "destructive",
        title: "Budget limit exceeded!",
        description: exceededDescription,
      });
    } else if (shouldShowApproaching) {
      toast({
        variant: "warning",
        title: "You’re nearing your budget limit",
        description: approachingDescription,
      });
    }
  }, [
    hasData,
    shouldShowExceeded,
    shouldShowApproaching,
    exceededDescription,
    approachingDescription,
    toast,
  ]);
}
