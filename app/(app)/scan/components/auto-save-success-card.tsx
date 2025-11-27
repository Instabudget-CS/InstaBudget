"use client";

import { useRouter } from "next/navigation";
import { CheckCircle2, ArrowRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { SavedTransaction } from "../types";

interface AutoSaveSuccessCardProps {
  transaction: SavedTransaction;
  onScanAnother: () => void;
}

export function AutoSaveSuccessCard({
  transaction,
  onScanAnother,
}: AutoSaveSuccessCardProps) {
  const router = useRouter();

  return (
    <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20 dark:border-green-900">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
          <CardTitle className="text-green-900 dark:text-green-100">
            Transaction Saved Successfully
          </CardTitle>
        </div>
        <CardDescription className="text-green-700 dark:text-green-300">
          Your receipt has been processed and saved automatically
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Merchant
            </p>
            <p className="text-base font-semibold">
              {transaction.merchant || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Total Amount
            </p>
            <p className="text-base font-semibold">
              {transaction.currency || "$"}
              {transaction.total_amount?.toFixed(2) || "0.00"}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Category
            </p>
            <p className="text-base font-semibold capitalize">
              {transaction.category || "other"}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Date</p>
            <p className="text-base font-semibold">
              {transaction.transaction_date
                ? new Date(transaction.transaction_date).toLocaleDateString()
                : "N/A"}
            </p>
          </div>
        </div>
        <div className="flex gap-3 pt-4">
          <Button
            onClick={() => router.push("/transactions")}
            className="flex-1"
          >
            View Transactions
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={onScanAnother}>
            Scan Another
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
