import { Wallet, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BudgetSaveButtonProps {
  onSave: () => void;
  isSaving: boolean;
}

export function BudgetSaveButton({ onSave, isSaving }: BudgetSaveButtonProps) {
  return (
    <div className="flex justify-end pt-2">
      <Button
        onClick={onSave}
        disabled={isSaving}
        className="flex items-center gap-2 bg-green-400 text-white hover:bg-green-500"
      >
        {isSaving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Wallet className="h-4 w-4" />
            Save Budget Configuration
          </>
        )}
      </Button>
    </div>
  );
}
