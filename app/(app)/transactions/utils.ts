import type { Transaction } from "@/lib/user-data-provider";
import type { Category, TransactionFormData } from "@/app/(app)/scan/types";

/**
 * Format date to readable string
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format currency amount
 * @param amount - The amount to format
 * @param currency - Currency code (ISO 4217) or symbol. If symbol is provided, it will be converted to code.
 */
export function formatCurrency(amount: number, currency: string): string {
  // Map common currency symbols to ISO codes
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

  // Normalize currency code
  const normalizedCurrency = currencyMap[currency] || currency.toUpperCase();

  // Validate and default to USD if invalid
  const validCurrency =
    normalizedCurrency.length === 3 && /^[A-Z]{3}$/.test(normalizedCurrency)
      ? normalizedCurrency
      : "USD";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: validCurrency,
  }).format(amount);
}

/**
 * Convert transaction to form data format
 */
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
