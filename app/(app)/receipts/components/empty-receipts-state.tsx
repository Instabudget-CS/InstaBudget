"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Store } from "lucide-react";
import Link from "next/link";

export function EmptyReceiptsState() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Store className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">No receipts yet</h3>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Start by scanning your first receipt to track your expenses
        </p>
        <Button asChild className="mt-6">
          <Link href="/scan">Scan Receipt</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
