"use client";

import { ReceiptCard } from "./receipt-card";
import type { ReceiptWithTransaction } from "../types";

interface ReceiptsGridProps {
  receipts: ReceiptWithTransaction[];
  onReceiptClick: (receiptId: string) => void;
}

export function ReceiptsGrid({ receipts, onReceiptClick }: ReceiptsGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {receipts.map((receipt) => (
        <ReceiptCard
          key={receipt.id}
          receipt={receipt}
          onClick={() => onReceiptClick(receipt.id)}
        />
      ))}
    </div>
  );
}
