"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { VoiceRecorder } from "./voice-recorder";
import { TransactionForm } from "./transaction-form";
import { AutoSaveSuccessCard } from "./auto-save-success-card";
import { ExtractionStatus } from "./extraction-status";
import type { SavedTransaction, TransactionFormData } from "../types";
import { mockExtractedData } from "../constants";

interface VoiceTabContentProps {
  isRecording: boolean;
  recordingTime: number;
  isProcessing: boolean;
  isEditing: boolean;
  isSaving: boolean;
  isAutoSave: boolean;
  savedTransaction: SavedTransaction | null;
  extractedData: typeof mockExtractedData | null;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onAutoSaveChange: (autoSave: boolean) => void;
  onSendRecording: () => void;
  onSave: (formData: TransactionFormData) => Promise<void>;
  onCancel: () => void;
  onViewTransactions: () => void;
  onRecordAnother: () => void;
}

export function VoiceTabContent({
  isRecording,
  recordingTime,
  isProcessing,
  isEditing,
  isSaving,
  isAutoSave,
  savedTransaction,
  extractedData,
  onStartRecording,
  onStopRecording,
  onAutoSaveChange,
  onSendRecording,
  onSave,
  onCancel,
  onViewTransactions,
  onRecordAnother,
}: VoiceTabContentProps) {
  const handleStopAndSend = () => {
    onStopRecording();
    // small delay to ensure recording is fully stopped and chunks are collected
    setTimeout(() => {
      onSendRecording();
    }, 200);
  };

  return (
    <div className="space-y-6">
      <VoiceRecorder
        isRecording={isRecording}
        recordingTime={recordingTime}
        isAutoSave={isAutoSave}
        isProcessing={isProcessing}
        onStartRecording={onStartRecording}
        onStopRecording={handleStopAndSend}
        onAutoSaveChange={onAutoSaveChange}
      />

      {isProcessing && <ExtractionStatus />}

      {savedTransaction && (
        <AutoSaveSuccessCard
          transaction={savedTransaction}
          onViewTransactions={onViewTransactions}
          onScanAnother={onRecordAnother}
        />
      )}

      {isEditing && extractedData && !savedTransaction && (
        <Card>
          <CardHeader>
            <CardTitle>Transaction Details</CardTitle>
            <CardDescription>
              Review and edit the extracted information from your voice
              recording
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
