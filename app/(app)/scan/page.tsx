"use client";

import { useAuth } from "@/lib/auth-provider";
import { toast } from "@/hooks/use-toast";
import { useUserData } from "@/lib/user-data-provider";
import { useScanState } from "./hooks/use-scan-state";
import { useEdgeFunction } from "./hooks/use-edge-function";
import { useTransactionSave } from "./hooks/use-transaction-save";
import { ScanHeader } from "./components/scan-header";
import { ScanTabs } from "./components/scan-tabs";
import { ScanTabContent } from "./components/scan-tab-content";
import { ManualTabContent } from "./components/manual-tab-content";
import type { TransactionFormData } from "./types";

export default function ScanPage() {
  const { user, profile } = useAuth();
  const { addTransaction } = useUserData();

  const {
    activeTab,
    setActiveTab,
    receiptImage,
    setReceiptImage,
    receiptId,
    setReceiptId,
    isExtracting,
    setIsExtracting,
    isEditing,
    setIsEditing,
    isSaving,
    setIsSaving,
    isAutoSave,
    setIsAutoSave,
    savedTransaction,
    setSavedTransaction,
    extractedData,
    setExtractedData,
    resetScanState,
  } = useScanState();

  const { saveTransaction } = useTransactionSave({
    onSuccess: resetScanState,
    onTransactionSaved: addTransaction,
  });

  const { callEdgeFunction } = useEdgeFunction({
    onAutoSaveSuccess: (transaction) => {
      addTransaction({
        ...transaction,
        created_at: transaction.created_at || new Date().toISOString(),
      });
      setSavedTransaction(transaction);
      setIsExtracting(false);
      toast({
        title: "Success",
        description: "Transaction saved automatically",
      });
    },
    onPreviewSuccess: (data, receiptId) => {
      setReceiptId(receiptId);
      setExtractedData(data);
      setIsExtracting(false);
      setIsEditing(true);
    },
    onError: () => {
      setIsExtracting(false);
      setReceiptImage(null);
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to scan receipts",
        variant: "destructive",
      });
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setReceiptImage(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Call edge function with file
    setIsExtracting(true);
    await callEdgeFunction(file, user.id, isAutoSave);
  };

  const handleSaveManualTransaction = async (formData: TransactionFormData) => {
    if (!user || !profile) {
      toast({
        title: "Error",
        description: "You must be logged in to save transactions",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    await saveTransaction(formData, user.id, profile.preferred_currency);
    setIsSaving(false);
  };

  const handleSaveScanTransaction = async (formData: TransactionFormData) => {
    if (!user || !profile) {
      toast({
        title: "Error",
        description: "You must be logged in to save transactions",
        variant: "destructive",
      });
      return;
    }

    if (!receiptId) {
      toast({
        title: "Error",
        description: "Receipt ID is missing. Please try uploading again.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    await saveTransaction(
      formData,
      user.id,
      profile.preferred_currency,
      receiptId
    );
    setIsSaving(false);
  };

  const handleCancel = () => {
    resetScanState();
  };

  const handleScanAnother = () => {
    resetScanState();
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <ScanHeader />

      <ScanTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        scanContent={
          <ScanTabContent
            receiptImage={receiptImage}
            isExtracting={isExtracting}
            isEditing={isEditing}
            isSaving={isSaving}
            isAutoSave={isAutoSave}
            savedTransaction={savedTransaction}
            extractedData={extractedData}
            onImageUpload={handleImageUpload}
            onAutoSaveChange={setIsAutoSave}
            onCancel={handleCancel}
            onSave={handleSaveScanTransaction}
            onScanAnother={handleScanAnother}
          />
        }
        manualContent={
          <ManualTabContent
            onSave={handleSaveManualTransaction}
            onCancel={handleCancel}
            isSaving={isSaving}
          />
        }
      />
    </div>
  );
}
