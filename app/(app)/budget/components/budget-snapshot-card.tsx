import { Calendar } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ProfileBudgetConfig } from "@/components/ui/budget_cycle_card";

interface BudgetSnapshotCardProps {
  profileBudget: ProfileBudgetConfig;
  totalCategoryLimit: number;
}

export function BudgetSnapshotCard({
  profileBudget,
  totalCategoryLimit,
}: BudgetSnapshotCardProps) {
  const {
    cycle_duration,
    cycle_startDate,
    cycle_endDate,
    currency,
    budget_auto_renew,
  } = profileBudget;

  return (
    <Card className="relative">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-500">
          <Calendar className="h-4 w-4" />
          Current Budget Snapshot
        </CardTitle>
        <CardDescription>Overview</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Cycle duration:</span>{" "}
          <span className="capitalize">{cycle_duration}</span>
        </p>

        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Cycle start date:</span>{" "}
          {new Date(cycle_startDate).toLocaleDateString()}
        </p>

        {cycle_endDate && (
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Cycle end date:</span>{" "}
            {new Date(cycle_endDate).toLocaleDateString()}
          </p>
        )}

        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">
            Budget auto-renew:
          </span>{" "}
          {budget_auto_renew ? "Enabled" : "Disabled"}
        </p>

        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">
            Total category limits:
          </span>{" "}
          {currency} {totalCategoryLimit.toFixed(2)}
        </p>
      </CardContent>
    </Card>
  );
}
