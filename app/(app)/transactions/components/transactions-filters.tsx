import { Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Category } from '@/app/(app)/scan/types';
import type { SortOption } from '../types';
import { CATEGORY_LABELS } from '../constants';

interface TransactionsFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  sortBy: SortOption;
  onSortChange: (value: SortOption) => void;
  filterCategory: Category | 'all';
  onCategoryChange: (value: Category | 'all') => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export function TransactionsFilters({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  filterCategory,
  onCategoryChange,
  hasActiveFilters,
  onClearFilters,
}: TransactionsFiltersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Filter & Sort</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-4">
          {/* Search */}
          <div className="relative w-full md:col-span-2">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search merchant..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          {/* Sort */}
          <div className="w-full md:col-span-1">
            <Select
              value={sortBy}
              onValueChange={(value) => onSortChange(value as SortOption)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Date (Newest)</SelectItem>
                <SelectItem value="date-asc">Date (Oldest)</SelectItem>
                <SelectItem value="amount-desc">
                  Amount (High to Low)
                </SelectItem>
                <SelectItem value="amount-asc">Amount (Low to High)</SelectItem>
                <SelectItem value="merchant-asc">Merchant (A-Z)</SelectItem>
                <SelectItem value="merchant-desc">Merchant (Z-A)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category Filter */}
          <div className="w-full md:col-span-1">
            <Select
              value={filterCategory}
              onValueChange={(value) =>
                onCategoryChange(value as Category | 'all')
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={onClearFilters}>
            Clear Filters
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
