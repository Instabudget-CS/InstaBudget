"use client";

import { Camera, Upload } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface ReceiptUploadProps {
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isAutoSave: boolean;
  onAutoSaveChange: (value: boolean) => void;
}

export function ReceiptUpload({
  onImageUpload,
  isAutoSave,
  onAutoSaveChange,
}: ReceiptUploadProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Receipt</CardTitle>
        <CardDescription>
          Take a photo or upload an image of your receipt
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Camera className="h-8 w-8 text-primary" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">Upload a receipt</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            PNG, JPG or HEIC up to 10MB
          </p>
          <div className="mt-6 flex gap-3">
            <Button asChild>
              <label className="cursor-pointer">
                <Upload className="mr-2 h-4 w-4" />
                Choose file
                <input
                  type="file"
                  accept="image/*"
                  onChange={onImageUpload}
                  className="sr-only"
                />
              </label>
            </Button>
          </div>
        </div>
        <div className="flex items-center space-x-2 rounded-md border p-3">
          <input
            type="checkbox"
            id="auto-save"
            checked={isAutoSave}
            onChange={(e) => onAutoSaveChange(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <Label
            htmlFor="auto-save"
            className="text-sm font-normal cursor-pointer"
          >
            Auto-save transaction
          </Label>
          <p className="text-xs text-muted-foreground ml-auto">
            {isAutoSave
              ? "Transaction will be saved automatically"
              : "Review and edit before saving"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
