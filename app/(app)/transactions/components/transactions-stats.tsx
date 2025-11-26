import { ShoppingCart } from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "../utils";
import type { TransactionStats } from "../types";

interface TransactionsStatsProps {
  stats: TransactionStats;
  defaultCurrency: string;
}

export function TransactionsStats({
  stats,
  defaultCurrency,
}: TransactionsStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="pb-3">
          <CardDescription>Total Transactions</CardDescription>
          <CardTitle className="text-3xl">{stats.total}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardDescription className="flex items-center gap-1">
            <ShoppingCart className="h-4 w-4 text-primary" />
            Total Spent
          </CardDescription>
          <CardTitle className="text-3xl text-primary">
            {formatCurrency(stats.totalAmount, defaultCurrency)}
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}
