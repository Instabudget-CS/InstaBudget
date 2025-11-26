import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Receipt, Loader2 } from "lucide-react";
import type { Transaction } from "@/lib/user-data-provider";
import { TransactionItem } from "./transaction-item";

interface TransactionsListProps {
  transactions: Transaction[];
  filteredTransactions: Transaction[];
  loading: boolean;
  onTransactionClick: (id: string) => void;
}

export function TransactionsList({
  transactions,
  filteredTransactions,
  loading,
  onTransactionClick,
}: TransactionsListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>All Transactions</CardTitle>
        <CardDescription>
          Showing {filteredTransactions.length} of {transactions.length}{" "}
          transactions
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">
              Loading transactions...
            </p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No transactions found</p>
            <p className="text-sm text-muted-foreground">
              {transactions.length === 0
                ? "Start by adding your first transaction"
                : "Try adjusting your filters or search query"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map((transaction) => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
                onClick={() => onTransactionClick(transaction.id)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
