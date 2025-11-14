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

interface ReceiptUploadProps {
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ReceiptUpload({ onImageUpload }: ReceiptUploadProps) {
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
      </CardContent>
    </Card>
  );
}
