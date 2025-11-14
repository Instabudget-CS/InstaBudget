"use client";

import { Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function ExtractionStatus() {
  return (
    <Card className="border-primary bg-primary/5">
      <CardContent className="flex items-center gap-3 py-4">
        <Sparkles className="h-5 w-5 animate-pulse text-primary" />
        <div>
          <p className="font-medium">Extracting data...</p>
          <p className="text-sm text-muted-foreground">
            AI is reading your receipt
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
