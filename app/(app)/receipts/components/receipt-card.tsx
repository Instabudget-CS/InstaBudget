"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ReceiptWithTransaction } from "../types";
import { formatDate, formatCurrency } from "../utils";

interface ReceiptCardProps {
  receipt: ReceiptWithTransaction;
  onClick: () => void;
}

export function ReceiptCard({ receipt, onClick }: ReceiptCardProps) {
  return (
    <Card
      className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg"
      onClick={onClick}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        <img
          src={receipt.url || "/placeholder.svg"}
          alt="Receipt"
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
      </div>
      {receipt.transaction && (
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-semibold">{receipt.transaction.merchant}</p>
              {receipt.transaction.category && (
                <Badge variant="secondary" className="text-xs">
                  {receipt.transaction.category}
                </Badge>
              )}
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{formatDate(receipt.transaction.transaction_date)}</span>
              <span className="font-semibold text-foreground">
                {formatCurrency(
                  receipt.transaction.total_amount,
                  receipt.transaction.currency
                )}
              </span>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
