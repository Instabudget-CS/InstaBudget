export function BudgetHeader() {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold text-green-500">
          Budget Configuration
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Configure your monthly budgeting cycle and categories
        </p>
      </div>
    </div>
  );
}
