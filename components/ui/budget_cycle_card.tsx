"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type BudgetCycle = "weekly" | "biweekly" | "monthly";

// matches the profiles table
export interface ProfileBudgetConfig {
  cycle_duration: BudgetCycle;
  cycle_startDate: string;
  cycle_endDate?: string;
  currency: string;
  budget_auto_renew: boolean;
}

interface BudgetCycleCardProps {
  config: ProfileBudgetConfig;
  onChange: (update: Partial<ProfileBudgetConfig>) => void;
}

export function BudgetCycleCard({ config, onChange }: BudgetCycleCardProps) {
  const {
    cycle_duration,
    cycle_startDate,
    cycle_endDate,
    currency,
    budget_auto_renew,
  } = config;

  // Calculate minimum date (today)
  const todayISO = new Date().toISOString().split("T")[0];

  const handleStartDateChange = (newStartDate: string) => {
    // Calculate end date as start date + 30 days
    const startDate = new Date(newStartDate);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 30);
    const endDateISO = endDate.toISOString().split("T")[0];

    onChange({
      cycle_startDate: newStartDate,
      cycle_endDate: endDateISO,
    });
  };

  return (
    <Card className="relative">
      <CardHeader>
        <CardTitle className="text-green-500">
          Profile Budget Settings
        </CardTitle>
        <CardDescription>
          Configure your monthly budget cycle settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* cycle duration with start and end dates*/}
        <div className="grid w-full gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="cycle_duration">Budget Cycle</Label>
            <Input
              id="cycle_duration"
              value="Monthly"
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Fixed to monthly for MVP
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cycle_startDate">Cycle Start Date</Label>
            <Input
              id="cycle_startDate"
              type="date"
              value={cycle_startDate}
              min={todayISO}
              onChange={(e) => handleStartDateChange(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Select today or a future date
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cycle_endDate">Cycle End Date</Label>
            <Input
              id="cycle_endDate"
              type="date"
              value={cycle_endDate ?? ""}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Automatically set to 30 days after start date
            </p>
          </div>
        </div>

        {/* currency type */}
        <div className="grid gap-4 sm:grid-cols-1">
          <div className="space-y-2">
            <Label htmlFor="currency">Budget Currency</Label>
            <Select
              value={currency}
              onValueChange={(v) => onChange({ currency: v })}
            >
              <SelectTrigger id="currency">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">US Dollar (USD)</SelectItem>
                <SelectItem value="EUR">Euro (EUR)</SelectItem>
                <SelectItem value="GBP">British Pound (GBP)</SelectItem>
                <SelectItem value="JPY">Japanese Yen (JPY)</SelectItem>
                <SelectItem value="CNY">Chinese Yuan (CNY)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Users can choose to auto renew budget */}
        <div className="space-y-2">
          <Label htmlFor="budget_auto_renew">Auto-Renew Budget</Label>
          <Select
            value={budget_auto_renew ? "true" : "false"}
            onValueChange={(v) => onChange({ budget_auto_renew: v === "true" })}
          >
            <SelectTrigger id="budget_auto_renew">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Enabled</SelectItem>
              <SelectItem value="false">Disabled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
