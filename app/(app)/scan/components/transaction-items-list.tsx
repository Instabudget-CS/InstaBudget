"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { TransactionItem } from "../types";

interface TransactionItemsListProps {
  items: TransactionItem[];
  onItemsChange: (items: TransactionItem[]) => void;
  isReadOnly?: boolean;
}

export function TransactionItemsList({
  items,
  onItemsChange,
  isReadOnly = false,
}: TransactionItemsListProps) {
  const totalAmount = items.reduce((sum, item) => sum + item.price, 0);

  const addItem = () => {
    onItemsChange([...items, { name: "", price: 0 }]);
  };

  const removeItem = (index: number) => {
    onItemsChange(items.filter((_, i) => i !== index));
  };

  const updateItem = (
    index: number,
    field: keyof TransactionItem,
    value: string | number
  ) => {
    const updatedItems = [...items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: field === "price" ? Number(value) : value,
    };
    onItemsChange(updatedItems);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Items</Label>
        {!isReadOnly && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addItem}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
        )}
      </div>
      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
          No items added. {!isReadOnly && "Click 'Add Item' to add items."}
        </div>
      ) : (
        <div className="space-y-2 rounded-lg border p-4">
          {items.map((item, index) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder="Item name"
                value={item.name}
                onChange={(e) => updateItem(index, "name", e.target.value)}
                readOnly={isReadOnly}
                className="flex-1"
              />
              <Input
                type="number"
                step="0.01"
                placeholder="Price"
                value={item.price || ""}
                onChange={(e) => updateItem(index, "price", e.target.value)}
                readOnly={isReadOnly}
                className="w-32"
              />
              {!isReadOnly && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <div className="flex justify-end border-t pt-2 mt-2">
            <div className="text-sm font-medium">
              Total: ${totalAmount.toFixed(2)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
