"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign, Store, Tag } from "lucide-react";
import type { ReceiptWithTransaction } from "../types";
import {
  formatDateLong,
  formatDateTime,
  formatCurrency,
  formatCategory,
} from "../utils";

interface ReceiptDetailDialogProps {
  receipt: ReceiptWithTransaction | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReceiptDetailDialog({
  receipt,
  open,
  onOpenChange,
}: ReceiptDetailDialogProps) {
  if (!receipt) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Receipt Details</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Receipt Image */}
          <div className="relative aspect-[3/4] overflow-hidden rounded-lg border bg-muted">
            <img
              src={receipt.url || "/placeholder.svg"}
              alt="Receipt"
              className="h-full w-full object-contain"
            />
          </div>

          {/* Transaction Details */}
          {receipt.transaction && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">
                  Transaction Information
                </h3>
                <p className="text-sm text-muted-foreground">
                  Uploaded {formatDateTime(receipt.uploaded_at)}
                </p>
              </div>

              <div className="space-y-3">
                <TransactionDetailItem
                  icon={Store}
                  label="Merchant"
                  value={receipt.transaction.merchant || "N/A"}
                />

                <TransactionDetailItem
                  icon={DollarSign}
                  label="Amount"
                  value={formatCurrency(
                    receipt.transaction.total_amount,
                    receipt.transaction.currency
                  )}
                />

                <TransactionDetailItem
                  icon={Tag}
                  label="Category"
                  value={
                    receipt.transaction.category ? (
                      <Badge variant="secondary">
                        {formatCategory(receipt.transaction.category)}
                      </Badge>
                    ) : (
                      <span className="text-sm">No category</span>
                    )
                  }
                />

                <TransactionDetailItem
                  icon={Calendar}
                  label="Date"
                  value={formatDateLong(receipt.transaction.transaction_date)}
                />

                {receipt.transaction.notes && (
                  <TransactionDetailItem
                    icon={null}
                    label="Notes"
                    value={receipt.transaction.notes}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface TransactionDetailItemProps {
  icon: typeof Store | null;
  label: string;
  value: string | React.ReactNode;
}

function TransactionDetailItem({
  icon: Icon,
  label,
  value,
}: TransactionDetailItemProps) {
  return (
    <div className="flex items-start gap-3">
      {Icon && (
        <Icon className="mt-0.5 h-5 w-5 text-muted-foreground shrink-0" />
      )}
      {!Icon && <div className="mt-0.5 h-5 w-5 shrink-0" />}
      <div className="min-w-0">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div className="font-semibold">{value}</div>
      </div>
    </div>
  );
}
