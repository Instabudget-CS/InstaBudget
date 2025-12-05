import { parseLocalDateIfPossible } from "@/lib/date-utils";

export const formatDate = (dateString: string): string => {
  const date = parseLocalDateIfPossible(dateString);
  return date.toLocaleDateString();
};

export const formatDateLong = (dateString: string): string => {
  const date = parseLocalDateIfPossible(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatDateTime = (dateString: string): string => {
  const date = parseLocalDateIfPossible(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

export const formatCurrency = (
  amount: number,
  currency: string | null
): string => {
  const currencySymbol = currency || "$";
  return `${currencySymbol}${amount.toFixed(2)}`;
};

export const formatCategory = (category: string | null): string => {
  if (!category) return "No category";
  return category.charAt(0).toUpperCase() + category.slice(1);
};
