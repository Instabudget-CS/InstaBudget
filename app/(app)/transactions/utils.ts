import type { Transaction } from "@/lib/user-data-provider";
import type { Category, TransactionFormData } from "@/app/(app)/scan/types";

import { parseLocalDate } from "@/lib/date-utils";

export function formatDate(dateString: string): string {
  const date = parseLocalDate(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatCurrency(amount: number, currency: string): string {
  const currencyMap: Record<string, string> = {
    $: "USD",
    "€": "EUR",
    "£": "GBP",
    "¥": "JPY",
    "₹": "INR",
    "₽": "RUB",
    "₩": "KRW",
    "₪": "ILS",
    "₦": "NGN",
    "₫": "VND",
    "₱": "PHP",
    "₭": "LAK",
    "₮": "MNT",
    "₯": "GRD",
    "₰": "DEM",
    "₲": "PYG",
    "₳": "ARS",
    "₴": "UAH",
    "₵": "GHS",
    "₶": "BRL",
    "₷": "CRC",
    "₸": "KZT",
  };

  const normalizedCurrency = currencyMap[currency] || currency.toUpperCase();

  const validCurrency =
    normalizedCurrency.length === 3 && /^[A-Z]{3}$/.test(normalizedCurrency)
      ? normalizedCurrency
      : "USD";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: validCurrency,
  }).format(amount);
}

export function convertTransactionToFormData(
  transaction: Transaction
): TransactionFormData {
  const items = JSON.parse(transaction.transaction_items || "[]");
  return {
    merchant: transaction.merchant || "",
    amount: transaction.total_amount.toString(),
    category: (transaction.category || "other") as Category,
    txnDate: transaction.transaction_date,
    notes: transaction.notes || "",
    items: items.map(
      (item: { item?: string; name?: string; price: number }) => ({
        name: item.item || item.name || "",
        price: item.price || 0,
      })
    ),
  };
}
