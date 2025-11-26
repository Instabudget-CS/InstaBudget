"use client";

import { useState } from "react";
import { useUserData } from "@/lib/user-data-provider";
import { ReceiptsHeader } from "./components/receipts-header";
import { ReceiptsGrid } from "./components/receipts-grid";
import { EmptyReceiptsState } from "./components/empty-receipts-state";
import { LoadingState } from "./components/loading-state";
import { ReceiptDetailDialog } from "./components/receipt-detail-dialog";
import { useReceipts } from "./hooks/use-receipts";

export default function ReceiptsPage() {
  const { receipts, transactions, getReceiptUrl, loading } = useUserData();
  const [selectedReceiptId, setSelectedReceiptId] = useState<string | null>(
    null
  );

  const { receiptsWithTransactions } = useReceipts({
    receipts,
    transactions,
    getReceiptUrl,
  });

  const selectedReceipt = receiptsWithTransactions.find(
    (r) => r.id === selectedReceiptId
  );

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      <ReceiptsHeader />

      {receiptsWithTransactions.length > 0 ? (
        <ReceiptsGrid
          receipts={receiptsWithTransactions}
          onReceiptClick={setSelectedReceiptId}
        />
      ) : (
        <EmptyReceiptsState />
      )}

      <ReceiptDetailDialog
        receipt={selectedReceipt}
        open={!!selectedReceiptId}
        onOpenChange={(open) => {
          if (!open) setSelectedReceiptId(null);
        }}
      />
    </div>
  );
}
