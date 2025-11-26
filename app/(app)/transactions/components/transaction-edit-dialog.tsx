import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TransactionForm } from "@/app/(app)/scan/components/transaction-form";
import type { Transaction } from "@/lib/user-data-provider";
import type { TransactionFormData } from "@/app/(app)/scan/types";
import { convertTransactionToFormData } from "../utils";

interface TransactionEditDialogProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (formData: TransactionFormData) => Promise<void>;
  isSaving: boolean;
}

export function TransactionEditDialog({
  transaction,
  open,
  onOpenChange,
  onSave,
  isSaving,
}: TransactionEditDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Transaction</DialogTitle>
        </DialogHeader>
        {transaction && (
          <TransactionForm
            onSave={onSave}
            onCancel={() => onOpenChange(false)}
            isReadOnly={false}
            isLoading={isSaving}
            initialData={convertTransactionToFormData(transaction)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
