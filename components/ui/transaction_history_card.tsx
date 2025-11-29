'use client';

import { ReceiptText } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

// Matches transactions table
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
          // Provides overview
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Total Recorded
            </p>
            <p className="text-sm font-semibold text-foreground">
              {formatCurrency(
                totalSpent,
                transactions[0]?.currency || fallbackCurrency
              )}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {transactions.length} transaction
              {transactions.length !== 1 && 's'}
            </p>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            Showing {'  '}
            <span className="font-medium text-foreground">
              {rangeLabel?.toLowerCase()}
            </span>
          </p>
        </div>

        {/* Table header */}
        <div className="mt-1 hidden grid-cols-[0.9fr_1.4fr_1fr_0.7fr_0.9fr_0.9fr] items-center gap-3 rounded-lg bg-slate-50 px-4 py-2 text-[11px] font-medium text-muted-foreground sm:grid">
          <span>Date</span>
          <span>Merchant</span>
          <span>Category</span>
          <span className="text-right">Amount</span>
          <span>Source</span>
          <span className="text-right">Notes / Status</span>
        </div>

        {/* Display "No Transactions Yet" if no transactions, else we map transactions into component */}
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
              const categoryLabel = tx.category || 'Uncategorized';
              const sourceLabel = getTransactionSource(tx);
              const currency =
                tx.currency && tx.currency.trim().length > 0
                  ? tx.currency
                  : fallbackCurrency;

              return (
                <div
                  key={tx.id}
                  className="grid grid-cols-1 gap-1 border-t border-slate-100 px-4 py-3 text-xs text-slate-700 first:border-t-0 sm:grid-cols-[0.9fr_1.4fr_1fr_0.7fr_0.9fr_0.9fr] sm:items-center sm:gap-3"
                >
                  {/* Date */}
                  <div className="flex items-center justify-between sm:block">
                    <span className="font-medium text-slate-900 sm:text-xs">
                      {dateLabel}
                    </span>
                    <span className="ml-2 rounded-full bg-slate-50 px-2 py-0.5 text-[10px] text-slate-500 sm:hidden">
                      {categoryLabel}
                    </span>
                  </div>

                  {/* Merchant */}
                  <div className="truncate">
                    <p className="truncate text-xs font-medium text-slate-900">
                      {tx.merchant || 'Unknown merchant'}
                    </p>
                    <p className="hidden text-[11px] text-slate-500 sm:block">
                      {categoryLabel}
                    </p>
                  </div>

                  <div className="hidden sm:block">
                    <span className="inline-flex max-w-[150px] items-center rounded-full bg-slate-50 px-2 py-[2px] text-[10px] font-medium text-slate-600">
                      {categoryLabel}
                    </span>
                  </div>

                  {/* Amount */}
                  <div className="text-right">
                    <span
                      className={`text-xs font-semibold ${
                        tx.total_amount >= 0
                          ? 'text-rose-500'
                          : 'text-emerald-600'
                      }`}
                    >
                      {formatCurrency(tx.total_amount, currency)}
                    </span>
                  </div>

                  {/* Source */}
                  <div className="flex items-center gap-1 text-[11px] text-slate-500">
                    {tx.receipt_id && (
                      <ReceiptText className="h-3.5 w-3.5 text-slate-400" />
                    )}
                    <span>{sourceLabel}</span>
                  </div>

                  {/* Notes */}
                  <div className="text-right">
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

// Formats ISO date as "Month DD", or "-" if null/invalid
function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

// Formats numeric amount into local currency string, defaults to USD
function formatCurrency(amount: number, currency?: string): string {
  const safeCurrency = currency || 'USD';
  if (Number.isNaN(amount)) return `${safeCurrency} 0.00`;
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: safeCurrency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Determines the displayed source of transaction
function getTransactionSource(tx: TransactionRow): string {
  if (tx.receipt_id) return 'Receipt · LLM';
  if (tx.transaction_items && tx.transaction_items.trim().length > 0) {
    return 'Parsed items';
  }
  return 'Manual entry';
}
