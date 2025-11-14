"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Edit3 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReceiptUpload } from "./components/receipt-upload";
import { ReceiptPreview } from "./components/receipt-preview";
import { ExtractionStatus } from "./components/extraction-status";
import { TransactionForm } from "./components/transaction-form";
import { mockExtractedData } from "./constants";
import { useAuth } from "@/lib/auth-provider";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { useUserData } from "@/lib/user-data-provider";
import type { TransactionFormData } from "./types";

export default function ScanPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { addTransaction } = useUserData();
  const [activeTab, setActiveTab] = useState<"scan" | "manual">("scan");
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [extractedData, setExtractedData] = useState<
    typeof mockExtractedData | null
  >(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptImage(reader.result as string);
        mockAIExtraction();
      };
      reader.readAsDataURL(file);
    }
  };

  const mockAIExtraction = () => {
    setIsExtracting(true);
    setTimeout(() => {
      setExtractedData(mockExtractedData);
      setIsExtracting(false);
      setIsEditing(true);
    }, 2000);
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

    // Validate required fields
    if (!formData.merchant.trim()) {
      toast({
        title: "Error",
        description: "Merchant name is required",
        variant: "destructive",
      });
      return;
    }

    if (formData.items.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one item",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    console.log("clicked save manual transaction");
    try {
      const transactionData: {
        user_id: string;
        transaction_items: string;
        merchant: string | null;
        total_amount: number;
        currency: string;
        category: string | null;
        transaction_date: string;
        notes?: string | null;
      } = {
        user_id: user.id,
        transaction_items: JSON.stringify(formData.items),
        merchant: formData.merchant.trim() || null,
        total_amount: Number.parseFloat(formData.amount),
        currency: profile.preferred_currency,
        category: formData.category.toLowerCase() || null,
        transaction_date: formData.txnDate,
      };

      // Only include notes if not empty
      if (formData.notes.trim()) {
        transactionData.notes = formData.notes.trim();
      }
      console.log(transactionData);

      const { data, error } = await supabase
        .from("transactions")
        .insert([transactionData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Add transaction to provider state
      if (data) {
        addTransaction(data);
      }

      toast({
        title: "Success",
        description: "Transaction saved successfully",
      });

      // Reset form and redirect
      router.push("/transactions");
    } catch (error) {
      console.error("Error saving transaction:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to save transaction. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveScanTransaction = async (formData: TransactionFormData) => {
    // For scan transactions, we'll implement this later
    // For now, just reset the form
    // TODO: Implement scan transaction save with receipt_id
    console.log("Scan transaction data:", formData);
    setReceiptImage(null);
    setIsEditing(false);
    setExtractedData(null);
  };

  const handleCancel = () => {
    setReceiptImage(null);
    setIsEditing(false);
    setExtractedData(null);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Add Transaction</h1>
        <p className="text-muted-foreground mt-2">
          Scan a receipt or enter transaction details manually
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "scan" | "manual")}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="scan" className="gap-2">
            <Camera className="h-4 w-4" />
            Scan Receipt
          </TabsTrigger>
          <TabsTrigger value="manual" className="gap-2">
            <Edit3 className="h-4 w-4" />
            Manual Entry
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scan" className="mt-6">
          {!receiptImage ? (
            <ReceiptUpload onImageUpload={handleImageUpload} />
          ) : (
            <div className="space-y-6">
              <ReceiptPreview imageUrl={receiptImage} onRemove={handleCancel} />

              {isExtracting && <ExtractionStatus />}

              {isEditing && extractedData && (
                <Card>
                  <CardHeader>
                    <CardTitle>Transaction Details</CardTitle>
                    <CardDescription>
                      Review and edit the extracted information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <TransactionForm
                      onSave={handleSaveScanTransaction}
                      onCancel={handleCancel}
                      isReadOnly={false}
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
          )}
        </TabsContent>

        <TabsContent value="manual" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Enter Transaction Details</CardTitle>
              <CardDescription>
                Manually add a transaction without a receipt
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TransactionForm
                onSave={handleSaveManualTransaction}
                onCancel={handleCancel}
                isReadOnly={false}
                isLoading={isSaving}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
