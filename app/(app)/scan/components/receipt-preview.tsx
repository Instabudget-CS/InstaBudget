"use client";

import { X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ReceiptPreviewProps {
  imageUrl: string;
  onRemove: () => void;
}

export function ReceiptPreview({ imageUrl, onRemove }: ReceiptPreviewProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Receipt Image</CardTitle>
          <Button variant="ghost" size="icon" onClick={onRemove}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg border bg-muted">
          <img
            src={imageUrl || "/placeholder.svg"}
            alt="Receipt"
            className="h-full w-full object-contain"
          />
        </div>
      </CardContent>
    </Card>
  );
}
