'use client';

import { useState } from 'react';
import { Calendar, Wallet } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BudgetCycleCard,
  type ProfileBudgetConfig,
} from '@/components/ui/budget_cycle_card';
import {
  CategoryLimitsCard,
  type BudgetCategoryRow,
} from '@/components/ui/category_limits_card';

export default function BudgetPage() {
  // TODO: Implement authGuard() to protect this route

  // The following matches the profiles table in DB
  const todayISO = new Date().toISOString().split('T')[0];

  // TODO: Replace the following hard coded data with data from backend API
  // useEffect() to load user data from backend

  const [profileBudget, setProfileBudget] = useState<ProfileBudgetConfig>({
    // map to profiles.cycle_duration
    cycle_duration: 'monthly',
    // map to profiles.cycle_startDate and cycle_endDate
    cycle_startDate: todayISO,
    // default to no end date
    cycle_endDate: '',
    // map to profiles.starting_balance
    starting_balance: '0.00',
    // map to profiles.currency
    currency: 'USD',
    // map to profiles.budget_auto_renew
    budget_auto_renew: true,
  });

  const handleProfileBudgetChange = (update: Partial<ProfileBudgetConfig>) => {
    setProfileBudget((prev) => ({ ...prev, ...update }));
  };

  // The following mock data matches the budget_categories table in DB
  const [categories, setCategories] = useState<BudgetCategoryRow[]>([
    {
      id: 'groceries-id',
      user_id: 'demo-user',
      category_name: 'Groceries',
      limit_amount: '400',
      spent_amount: '220.5',
      created_at: '',
      updated_at: '',
    },
    {
      id: 'transport-id',
      user_id: 'demo-user',
      category_name: 'Transport',
      limit_amount: '150',
      spent_amount: '80',
      created_at: '',
      updated_at: '',
    },
    {
      id: 'rent-id',
      user_id: 'demo-user',
      category_name: 'Rent',
      limit_amount: '1200',
      spent_amount: '1200',
      created_at: '',
      updated_at: '',
    },
  ]);

  // Calculate the combined progress for all categories
  const totalCategoryLimit = categories.reduce((sum, c) => {
    const value = Number.parseFloat(c.limit_amount || '0');
    return sum + (Number.isNaN(value) ? 0 : value);
  }, 0);

  const handleSaveAll = () => {
    // TODO: send data to DB corresponding to matching tables
    console.log('Saving profile budget config (profiles table):', {
      profileBudget,
    });
    console.log('Saving budget categories (budget_categories table):', {
      categories,
    });
    // TODO alert users of successful save and data persistence
    // toast({ title: 'Saved', description: 'Budget configuration updated.' });
  };

  const {
    cycle_duration,
    cycle_startDate,
    cycle_endDate,
    starting_balance,
    currency,
    budget_auto_renew,
  } = profileBudget;

  return (
    <div className="mx-auto mb-20 max-w-4xl space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-green-500">
            Budget Configuration
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Confiure your budgeting cycle and categories
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        {/* Card for profile budget settings*/}
        <BudgetCycleCard
          config={profileBudget}
          onChange={handleProfileBudgetChange}
        />
        {/* Local Card Component that is dynamic to user input but not reusable*/}
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
              <span className="font-medium text-foreground">
                Cycle duration:
              </span>{' '}
              <span className="capitalize">{cycle_duration}</span>
            </p>

            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">
                Cycle start date:
              </span>{' '}
              {new Date(cycle_startDate).toLocaleDateString()}
            </p>

            {cycle_endDate && (
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                  Cycle end date:
                </span>{' '}
                {new Date(cycle_endDate).toLocaleDateString()}
              </p>
            )}

            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">
                Starting balance:
              </span>{' '}
              {currency} {Number.parseFloat(starting_balance || '0').toFixed(2)}
            </p>

            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">
                Budget auto-renew:
              </span>{' '}
              {budget_auto_renew ? 'Enabled' : 'Disabled'}
            </p>

            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">
                Total category limits:
              </span>{' '}
              {currency} {totalCategoryLimit.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Card for users to define budget_categories */}
      <CategoryLimitsCard
        categories={categories}
        onChange={setCategories}
        currency={currency}
      />

      <div className="flex justify-end pt-2">
        <Button
          onClick={handleSaveAll}
          className="flex items-center gap-2 bg-green-400 text-white hover:bg-green-500"
        >
          <Wallet className="h-4 w-4" />
          Save Budget Configuration
        </Button>
      </div>
    </div>
  );
}
