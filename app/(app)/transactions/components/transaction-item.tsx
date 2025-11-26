import { ShoppingCart } from "lucide-react";
import type { Transaction } from "@/lib/user-data-provider";
import { formatDate, formatCurrency } from "../utils";
import { CATEGORY_LABELS } from "../constants";
import type { Category } from "@/app/(app)/scan/types";

interface TransactionItemProps {
  transaction: Transaction;
  onClick: () => void;
}

export function TransactionItem({
  transaction,
  onClick,
}: TransactionItemProps) {
  return (
    <div
      onClick={onClick}
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 rounded-lg border p-4 transition-colors hover:bg-accent cursor-pointer"
    >
      <div className="flex flex-1 items-start sm:items-center gap-3 sm:gap-4 min-w-0">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <ShoppingCart className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <p className="font-medium truncate">
              {transaction.merchant || "Unknown Merchant"}
            </p>
            {transaction.category && (
              <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground shrink-0">
                {CATEGORY_LABELS[transaction.category as Category] ||
                  transaction.category}
              </span>
            )}
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm text-muted-foreground">
            <span className="shrink-0">
              {formatDate(transaction.transaction_date)}
            </span>
            {transaction.notes && (
              <>
                <span className="hidden sm:inline">•</span>
                <span className="line-clamp-2">{transaction.notes}</span>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="text-left sm:text-right shrink-0">
        <p className="text-lg font-semibold text-primary">
          {formatCurrency(transaction.total_amount, transaction.currency)}
        </p>
      </div>
    </div>
  );
}
