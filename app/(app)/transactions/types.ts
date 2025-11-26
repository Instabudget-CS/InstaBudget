export type SortOption =
  | "date-desc"
  | "date-asc"
  | "amount-desc"
  | "amount-asc"
  | "merchant-asc"
  | "merchant-desc";

export interface TransactionStats {
  total: number;
  totalAmount: number;
}
