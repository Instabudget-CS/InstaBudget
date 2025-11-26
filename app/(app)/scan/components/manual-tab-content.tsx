"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TransactionForm } from "./transaction-form";
import type { TransactionFormData } from "../types";

interface ManualTabContentProps {
  onSave: (formData: TransactionFormData) => void;
  onCancel: () => void;
  isSaving: boolean;
}

export function ManualTabContent({
  onSave,
  onCancel,
  isSaving,
}: ManualTabContentProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Enter Transaction Details</CardTitle>
        <CardDescription>
          Manually add a transaction without a receipt
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TransactionForm
          onSave={onSave}
          onCancel={onCancel}
          isReadOnly={false}
          isLoading={isSaving}
        />
      </CardContent>
    </Card>
  );
}
