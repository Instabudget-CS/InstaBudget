"use client";

import { Card, CardContent } from "@/components/ui/card";

export function LoadingState() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Receipts</h1>
        <p className="text-muted-foreground mt-2">
          View all your uploaded receipts
        </p>
      </div>
      <Card>
        <CardContent className="flex items-center justify-center py-16">
          <p className="text-muted-foreground">Loading receipts...</p>
        </CardContent>
      </Card>
    </div>
  );
}
