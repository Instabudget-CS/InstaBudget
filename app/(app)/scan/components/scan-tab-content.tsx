"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ReceiptUpload } from "./receipt-upload";
import { ReceiptPreview } from "./receipt-preview";
import { ExtractionStatus } from "./extraction-status";
import { TransactionForm } from "./transaction-form";
import { AutoSaveSuccessCard } from "./auto-save-success-card";
import type { TransactionFormData } from "../types";
import type { SavedTransaction } from "../types";
import { mockExtractedData } from "../constants";

interface ScanTabContentProps {
  receiptImage: string | null;
  isExtracting: boolean;
  isEditing: boolean;
  isSaving: boolean;
  isAutoSave: boolean;
  savedTransaction: SavedTransaction | null;
  extractedData: typeof mockExtractedData | null;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAutoSaveChange: (value: boolean) => void;
  onCancel: () => void;
  onSave: (formData: TransactionFormData) => void;
  onScanAnother: () => void;
}

export function ScanTabContent({
  receiptImage,
  isExtracting,
  isEditing,
  isSaving,
  isAutoSave,
  savedTransaction,
  extractedData,
  onImageUpload,
  onAutoSaveChange,
  onCancel,
  onSave,
  onScanAnother,
}: ScanTabContentProps) {
  if (!receiptImage) {
    return (
      <ReceiptUpload
        onImageUpload={onImageUpload}
        isAutoSave={isAutoSave}
        onAutoSaveChange={onAutoSaveChange}
      />
    );
  }

  return (
    <div className="space-y-6">
      <ReceiptPreview imageUrl={receiptImage} onRemove={onCancel} />

      {isExtracting && <ExtractionStatus />}

      {savedTransaction && (
        <AutoSaveSuccessCard
          transaction={savedTransaction}
          onScanAnother={onScanAnother}
        />
      )}

      {isEditing && extractedData && !savedTransaction && (
        <Card>
          <CardHeader>
            <CardTitle>Transaction Details</CardTitle>
            <CardDescription>
              Review and edit the extracted information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TransactionForm
              onSave={onSave}
              onCancel={onCancel}
              isReadOnly={false}
              isLoading={isSaving}
              initialData={{
                merchant: extractedData.merchant,
                amount: extractedData.amount,
                category: extractedData.category,
                txnDate: extractedData.txnDate,
                notes: extractedData.notes,
                items: extractedData.items,
              }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
