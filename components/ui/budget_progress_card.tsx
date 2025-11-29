'use client';

import { PieChart } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type CategoryProgress = {
  id: string;
  name: string;
  spent: number;
  limit: number;
};

interface BudgetProgressCardProps {
  cycleLabel: string;
  cycleRange?: {
    start: string;
    end?: string;
  };
  totalSpent: number;
  totalLimit: number;
  categories: CategoryProgress[];
  currency: string;
}

// Receives necessary data as props
export function BudgetProgressCard({
  cycleLabel,
  cycleRange,
  totalSpent,
  totalLimit,
  categories,
  currency,
}: BudgetProgressCardProps) {
  const safeLimit = totalLimit > 0 ? totalLimit : 1;
  const totalPercentage = Math.min(100, (totalSpent / safeLimit) * 100);

  const remaining = Math.max(0, totalLimit - totalSpent);

  const totalStatusColor = getProgressBarColor(totalPercentage);

  return (
    <Card className="relative transition-all hover:shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-500">
          <PieChart className="h-4 w-4" />
          Cycle Spending Overview
        </CardTitle>
        <CardDescription>
          {cycleRange && (
            <>
              {' '}
              Tracking from {new Date(cycleRange.start).toLocaleDateString()}
              {cycleRange.end
                ? ` to ${new Date(cycleRange.end).toLocaleDateString()}`
                : ''}
              .
            </>
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Total Combined Progress Bar Visualization */}
        <div className="space-y-3 rounded-xl border border-green-100 bg-green-50/60 p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <p className="text-xs font-medium uppercase text-green-700">
                Total for {cycleLabel}
              </p>
              <p className="text-lg font-semibold text-green-900">
                {currency} {totalSpent.toFixed(2)}{' '}
                <span className="text-xs font-normal text-green-700">
                  / {currency} {totalLimit.toFixed(2)}
                </span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Remaining</p>
              <p className="text-sm font-medium text-green-900">
                {currency} {remaining.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground">
                {totalPercentage.toFixed(0)}% of budget used
              </p>
            </div>
          </div>

          <div className="relative mt-1 h-3 w-full overflow-hidden rounded-full bg-white/60">
            <div
              className={`h-full rounded-full ${totalStatusColor}`}
              style={{ width: `${totalPercentage}%` }}
            />
          </div>
        </div>

        {/* Individual Category Progress Bar Visualization */}
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase text-muted-foreground">
            Category breakdown
          </p>

          {categories.length === 0 && (
            <p className="text-xs text-muted-foreground">
              Did not find any categories. Try adding one.
            </p>
          )}

          <div className="space-y-2">
            {categories.map((cat) => {
              const safeCategoryLimitt = cat.limit > 0 ? cat.limit : 1;
              // Note the 140 is to cap bar from overflowing
              const percentage = Math.min(
                140,
                (cat.spent / safeCategoryLimitt) * 100
              );
              const color = getProgressBarColor(percentage);

              return (
                <div
                  key={cat.id}
                  className="rounded-lg border border-gray-100 bg-gray-50/80 p-3"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {cat.name || 'Untitled category'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {currency} {cat.spent.toFixed(2)} / {currency}{' '}
                        {cat.limit.toFixed(2)}
                      </p>
                    </div>
                    <p className="text-xs font-medium text-muted-foreground">
                      {percentage.toFixed(0)}%
                    </p>
                  </div>

                  <div className="relative mt-2 h-2.5 w-full overflow-hidden rounded-full bg-white">
                    <div
                      className={`h-full rounded-full ${color}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  {percentage > 100 && (
                    <p className="mt-1 text-xs font-medium text-red-500">
                      You have exceeded the budget limit for this category!
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Maps percentage bar <70 to green, <100 to yellow, >=100 to red
function getProgressBarColor(percentage: number): string {
  if (percentage < 70) return 'bg-green-400';
  if (percentage < 100) return 'bg-yellow-400';
  return 'bg-red-400';
}
