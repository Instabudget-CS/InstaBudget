'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, ScanLine } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { type BudgetCategoryRow } from '@/components/ui/category_limits_card';
import { type ProfileBudgetConfig } from '@/components/ui/budget_cycle_card';
import { BudgetProgressCard } from '@/components/ui/budget_progress_card';
import {
  TransactionHistoryCard,
  type TransactionRow,
} from '@/components/ui/transaction_history_card';
import {
  LLMInsightsCard,
  type LLMInsightsCardProps,
} from '@/components/ui/llm_insight_card';

// TODO:
// Replace the following hard coded dummy data with data from backend API

const todayISO = new Date().toISOString().split('T')[0];
// The following matches the profiles table in DB
const MOCK_PROFILE_BUDGET: ProfileBudgetConfig = {
  cycle_duration: 'monthly',
  cycle_startDate: todayISO,
  cycle_endDate: '',
  starting_balance: '0.00',
  currency: 'USD',
  budget_auto_renew: true,
};

const MOCK_TRANSACTIONS: TransactionRow[] = [
  {
    id: 'tx-1',
    user_id: 'user-123',
    transaction_items:
      '[{"item":"Eggs","amount":4.99},{"item":"Bread","amount":3.49}]',
    merchant: 'Trader Joe’s',
    total_amount: 82.4,
    currency: 'USD',
    category: 'Food & Groceries',
    transaction_date: '2025-11-14',
    notes: 'Weekly groceries run',
    receipt_id: 'receipt-1',
    created_at: '2025-11-14T18:30:00.000Z',
    updated_at: '2025-11-14T18:30:00.000Z',
  },
  {
    id: 'tx-2',
    user_id: 'user-123',
    transaction_items: null,
    merchant: 'Lyft',
    total_amount: 13.2,
    currency: 'USD',
    category: 'Transport',
    transaction_date: '2025-11-15',
    notes: null,
    receipt_id: null,
    created_at: '2025-11-15T09:15:00.000Z',
    updated_at: '2025-11-15T09:15:00.000Z',
  },
  {
    id: 'tx-3',
    user_id: 'user-123',
    transaction_items: null,
    merchant: 'Netflix',
    total_amount: 9.99,
    currency: 'USD',
    category: 'Subscriptions',
    transaction_date: '2025-11-10',
    notes: 'Monthly subscription',
    receipt_id: null,
    created_at: '2025-11-10T02:00:00.000Z',
    updated_at: '2025-11-10T02:00:00.000Z',
  },
  {
    id: 'tx-4',
    user_id: 'user-123',
    transaction_items: null,
    merchant: 'Starbucks',
    total_amount: 5.45,
    currency: 'USD',
    category: 'Misc',
    transaction_date: '2025-11-16',
    notes: 'Coffee before class',
    receipt_id: null,
    created_at: '2025-11-16T16:45:00.000Z',
    updated_at: '2025-11-16T16:45:00.000Z',
  },
];

const MOCK_BUDGET_CATEGORIES: BudgetCategoryRow[] = [
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
];

const MOCK_INSIGHTS: LLMInsightsCardProps = {
  weeklySummary: 'You spent 20% more on food this week than usual.',
  tip: 'To stay on track for food, considering eating out less.',
};

export default function DashboardPage() {
  // For page routing
  const router = useRouter();

  // State hook for user profile data
  const [profileBudget, setProfileBudget] =
    useState<ProfileBudgetConfig>(MOCK_PROFILE_BUDGET);

  // State hook for user budget categories
  const [categories, setCategories] = useState<BudgetCategoryRow[]>(
    MOCK_BUDGET_CATEGORIES
  );

  // State hook for user transactions
  const [transactions, setTransactions] =
    useState<TransactionRow[]>(MOCK_TRANSACTIONS);

  // State hook for LLM insights
  const [insights, setInsights] = useState<LLMInsightsCardProps>(MOCK_INSIGHTS);

  // TODO:
  // useEffect() to load user data from backend, should call all state setters after fetching
  useEffect(() => {
    // setProfileBudget(...) from backend API
    // setCategories(...) from backend API
    // setTransactions(...) from backend API
  }, []);
  const {
    cycle_duration,
    cycle_startDate,
    cycle_endDate,
    starting_balance,
    currency,
    budget_auto_renew,
  } = profileBudget;

  // Calcluate progress for each category
  const categoryProgress = categories.map((cat) => ({
    id: cat.id,
    name: cat.category_name,
    spent: Number.parseFloat(cat.spent_amount || '0'),
    limit: Number.parseFloat(cat.limit_amount || '0'),
  }));

  // Calculate the combined progress for all categories
  const totalLimit = categoryProgress.reduce((sum, c) => sum + c.limit, 0);
  const totalSpent = categoryProgress.reduce((sum, c) => sum + c.spent, 0);

  return (
    <div>
      <div>
        <h1 className="text-3xl font-bold text-green-500">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Budgeting progress, transaction history, and insights at a glance.
        </p>
        <div className="flex flex-wrap items-center gap-2 py-5">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="border-green-400 text-xs text-green-700 hover:bg-green-50"
            onClick={() => {
              router.push('/transactions');
            }}
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add transaction
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="border-dashed border-green-300 text-xs text-green-700 hover:bg-green-50"
            onClick={() => {
              router.push('/scan');
            }}
          >
            <ScanLine className="mr-1.5 h-3.5 w-3.5" />
            Scan receipt (LLM)
          </Button>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,1fr)]">
        <div className="space-y-5">
          <BudgetProgressCard
            cycleLabel="Current Cycle"
            cycleRange={{
              start: cycle_startDate,
              end: cycle_endDate || undefined,
            }}
            totalLimit={totalLimit}
            totalSpent={totalSpent}
            categories={categoryProgress}
            currency={currency}
          />
          <TransactionHistoryCard
            transactions={transactions}
            rangeLabel="xxxx cycle"
            fallbackCurrency="USD"
          />
        </div>
        <div>
          <LLMInsightsCard
            weeklySummary={insights.weeklySummary}
            tip={insights.tip}
          />
        </div>
      </div>
    </div>
  );
}
