"use client";

import { ReceiptText, PencilLine } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/app/(app)/transactions/utils";

// matches transactions table
export interface TransactionRow {
  id: string;
  user_id: string;
  transaction_items: string | null;
  merchant: string | null;
  total_amount: number;
  currency: string;
  category: string | null;
  transaction_date: string;
  notes: string | null;
  receipt_id: string | null;
  created_at: string;
  updated_at: string;
}

interface TransactionHistoryCardProps {
  transactions: TransactionRow[];
  rangeLabel?: string;
  fallbackCurrency?: string;
}

export function TransactionHistoryCard({
  transactions,
  rangeLabel,
  fallbackCurrency,
}: TransactionHistoryCardProps) {
  const hasTransactions = transactions.length > 0;

  const totalSpent = transactions.reduce(
    (sum, tx) => sum + (tx.total_amount || 0),
    0
  );

  return (
    <Card className="relative cursor-pointer transition-all hover:shadow-xl">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="flex items-center gap-2 text-green-500">
            <ReceiptText className="h-4 w-4" />
            Transaction History
          </CardTitle>
          <CardDescription className="text-xs">
            Recent activity for {rangeLabel}, sorted by transaction date.
          </CardDescription>
        </div>

        {hasTransactions && (
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Total Recorded
            </p>
            <p className="text-sm font-semibold text-foreground">
              {formatCurrency(
                totalSpent,
                transactions[0]?.currency || fallbackCurrency || "USD"
              )}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {transactions.length} transaction
              {transactions.length !== 1 && "s"}
            </p>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            Showing {"  "}
            <span className="font-medium text-foreground">
              {rangeLabel?.toLowerCase()}
            </span>
          </p>
        </div>

        <div className="mt-1 hidden grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,0.7fr)_minmax(0,0.9fr)_minmax(0,0.9fr)] items-center gap-3 rounded-lg bg-slate-50 px-4 py-2 text-[11px] font-medium text-muted-foreground sm:grid">
          <span>Date</span>
          <span>Merchant</span>
          <span>Category</span>
          <span className="text-right">Amount</span>
          <span>Source</span>
          <span className="text-right">Notes / Status</span>
        </div>

        <div className="max-h-80 space-y-1 overflow-y-auto rounded-lg border border-slate-100 bg-white">
          {!hasTransactions && (
            <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
              <ReceiptText className="h-6 w-6 text-slate-300" />
              <p className="text-sm font-medium text-foreground">
                No transactions yet
              </p>
              <p className="max-w-xs text-xs text-muted-foreground">
                Try adding a transaction or scanning a receipt!
              </p>
            </div>
          )}

          {hasTransactions &&
            transactions.map((tx) => {
              const dateLabel = formatDate(
                tx.transaction_date || tx.created_at
              );
              const categoryLabel = tx.category || "Uncategorized";
              const { label: sourceLabel, icon: sourceIcon } =
                getTransactionSourceInfo(tx);

              const currency =
                tx.currency && tx.currency.trim().length > 0
                  ? tx.currency
                  : fallbackCurrency;

              return (
                <div
                  key={tx.id}
                  className="grid grid-cols-1 gap-1 border-t border-slate-100 px-4 py-3 text-xs text-slate-700 first:border-t-0 sm:grid-cols-[0.9fr_1.4fr_1fr_0.7fr_0.9fr_0.9fr] sm:items-center sm:gap-3"
                >
                  <div className="flex items-center justify-between sm:block">
                    <span className="font-medium text-slate-900 sm:text-xs">
                      {dateLabel}
                    </span>
                    <span className="ml-2 rounded-full bg-slate-50 px-2 py-0.5 text-[10px] text-slate-500 sm:hidden">
                      {categoryLabel}
                    </span>
                  </div>

                  <div className="min-w-0 truncate">
                    <p className="truncate text-xs font-medium text-slate-900">
                      {tx.merchant || "Unknown merchant"}
                    </p>
                    <p className="hidden text-[11px] text-slate-500 sm:block">
                      {categoryLabel}
                    </p>
                  </div>

                  <div className="hidden min-w-0 sm:block">
                    <span className="inline-flex max-w-[150px] items-center rounded-full bg-slate-50 px-2 py-[2px] text-[10px] font-medium text-slate-600">
                      {categoryLabel}
                    </span>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-xs font-semibold ${
                        tx.total_amount >= 0
                          ? "text-rose-500"
                          : "text-emerald-600"
                      }`}
                    >
                      {formatCurrency(tx.total_amount, currency || "USD")}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-slate-500 min-w-0 ">
                    {sourceIcon}
                    <span className="truncate">{sourceLabel}</span>
                  </div>

                  <div className="text-right min-w-0 ">
                    {tx.notes ? (
                      <p className="truncate text-[11px] text-slate-500">
                        {tx.notes}
                      </p>
                    ) : (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                        Saved
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </CardContent>
    </Card>
  );
}

import { parseLocalDateIfPossible } from "@/lib/date-utils";

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = parseLocalDateIfPossible(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function getTransactionSourceInfo(tx: TransactionRow) {
  if (tx.receipt_id) {
    return {
      label: "Receipt · LLM",
      icon: <ReceiptText className="h-3.5 w-3.5 text-blue-400" />,
    };
  }

  return {
    label: "Manual entry",
    icon: <PencilLine className="h-3.5 w-3.5 text-amber-400" />,
  };
}
