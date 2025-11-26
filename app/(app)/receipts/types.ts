import type { Transaction, Receipt } from "@/lib/user-data-provider";

export interface ReceiptWithTransaction extends Receipt {
  transaction?: Transaction | null;
  url: string;
}
