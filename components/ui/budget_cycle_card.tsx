'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type BudgetCycle = 'weekly' | 'biweekly' | 'monthly';

// matches the profiles table
export interface ProfileBudgetConfig {
  cycle_duration: BudgetCycle;
  cycle_startDate: string;
  cycle_endDate?: string;
  starting_balance: string;
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
    starting_balance,
    currency,
    budget_auto_renew,
  } = config;

  return (
    <Card className="relative">
      <CardHeader>
        <CardTitle className="text-green-500">
          Profile Budget Settings
        </CardTitle>
        <CardDescription>
          Choose how often your budget resets and set your starting balance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* cycle duration with start and end dates*/}
        <div className="grid w-full gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="cycle_duration">Budget Cycle</Label>
            <Select
              value={cycle_duration}
              onValueChange={(v) =>
                onChange({ cycle_duration: v as BudgetCycle })
              }
            >
              <SelectTrigger id="cycle_duration">
                <SelectValue placeholder="Select a cycle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="biweekly">Bi-weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cycle_startDate">Cycle Start Date</Label>
            <Input
              id="cycle_startDate"
              type="date"
              value={cycle_startDate}
              onChange={(e) => onChange({ cycle_startDate: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cycle_endDate">Cycle End Date</Label>
            <Input
              id="cycle_endDate"
              type="date"
              value={cycle_endDate ?? ''}
              onChange={(e) =>
                onChange({ cycle_endDate: e.target.value || undefined })
              }
            />
          </div>
        </div>

        {/* starting balance and currency type */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="starting_balance">Starting Balance</Label>
            <Input
              id="starting_balance"
              type="number"
              step="0.01"
              value={starting_balance}
              onChange={(e) => onChange({ starting_balance: e.target.value })}
              placeholder="0.00"
            />
          </div>

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
            value={budget_auto_renew ? 'true' : 'false'}
            onValueChange={(v) => onChange({ budget_auto_renew: v === 'true' })}
          >
            <SelectTrigger id="budget_auto_renew">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Enabled</SelectItem>
              <SelectItem value="false">Disabled</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            * Your account balance at the start of the cycle
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
