"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export function ReceiptsHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">Receipts</h1>
        <p className="text-muted-foreground mt-2">
          View all your uploaded receipts
        </p>
      </div>
      <Button asChild>
        <Link href="/scan">Scan New</Link>
      </Button>
    </div>
  );
}
