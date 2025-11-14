"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { TransactionItemsList } from "./transaction-items-list";
import type { Category, TransactionFormData } from "../types";

const CATEGORIES: Category[] = [
  "groceries",
  "dining",
  "transport",
  "shopping",
  "entertainment",
  "utilities",
  "health",
  "education",
  "rent",
  "subscriptions",
  "travel",
  "income",
  "other",
];

interface TransactionFormProps {
  onSave: (data: TransactionFormData) => void | Promise<void>;
  onCancel: () => void;
  isReadOnly?: boolean;
  isLoading?: boolean;
  initialData?: TransactionFormData;
}

export function TransactionForm({
  onSave,
  onCancel,
  isReadOnly = false,
  isLoading = false,
  initialData,
}: TransactionFormProps) {
  const [merchant, setMerchant] = useState(initialData?.merchant || "");
  const [category, setCategory] = useState<Category>(
    initialData?.category || "other"
  );
  const [txnDate, setTxnDate] = useState(
    initialData?.txnDate || new Date().toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [items, setItems] = useState(initialData?.items || []);

  const totalAmount = items.reduce((sum, item) => sum + item.price, 0);

  const handleSave = async () => {
    const formData: TransactionFormData = {
      merchant,
      amount: totalAmount.toFixed(2),
      category,
      txnDate,
      notes,
      items,
    };
    await onSave(formData);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select
          value={category}
          onValueChange={(v) => setCategory(v as Category)}
          disabled={isReadOnly}
        >
          <SelectTrigger id="category">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="merchant">Merchant</Label>
        <Input
          id="merchant"
          value={merchant}
          onChange={(e) => setMerchant(e.target.value)}
          placeholder="Store or merchant name"
          readOnly={isReadOnly}
        />
      </div>

      <TransactionItemsList
        items={items}
        onItemsChange={setItems}
        isReadOnly={isReadOnly}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="amount">Total Amount</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            value={totalAmount.toFixed(2)}
            placeholder="0.00"
            readOnly
            className="bg-muted"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={txnDate}
            onChange={(e) => setTxnDate(e.target.value)}
            readOnly={isReadOnly}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any additional notes..."
          rows={3}
          readOnly={isReadOnly}
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button onClick={handleSave} className="flex-1" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Transaction"}
        </Button>
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
