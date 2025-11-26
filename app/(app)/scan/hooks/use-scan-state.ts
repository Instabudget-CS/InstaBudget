import { useState } from "react";
import type { TransactionFormData } from "../types";
import type { SavedTransaction } from "../types";
import { mockExtractedData } from "../constants";

export function useScanState() {
  const [activeTab, setActiveTab] = useState<"scan" | "manual">("scan");
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [receiptId, setReceiptId] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAutoSave, setIsAutoSave] = useState(false);
  const [savedTransaction, setSavedTransaction] =
    useState<SavedTransaction | null>(null);
  const [extractedData, setExtractedData] = useState<
    typeof mockExtractedData | null
  >(null);

  const resetScanState = () => {
    setReceiptImage(null);
    setReceiptId(null);
    setIsEditing(false);
    setExtractedData(null);
    setSavedTransaction(null);
  };

  return {
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
  };
}
