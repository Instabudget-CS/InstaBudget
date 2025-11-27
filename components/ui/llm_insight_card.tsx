'use client';

import { Sparkles } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export interface LLMInsightsCardProps {
  weeklySummary: string;
  tip: string;
}

export function LLMInsightsCard({ weeklySummary, tip }: LLMInsightsCardProps) {
  return (
    <Card className="relative">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-500">
          <Sparkles className="h-4 w-4" />
          Insights
        </CardTitle>
        <CardDescription>
          Some tips based on your recent spending
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Weekly Summary from LLM */}
        <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
          <p className="text-xs font-semibold text-muted-foreground">
            Weekly Summary
          </p>
          <p className="mt-1 text-sm text-foreground">"{weeklySummary}";</p>
        </div>

        {/* Tip from LLM */}
        <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
          <p className="text-xs font-semibold text-muted-foreground">Tip</p>
          <p className="text-sm text-foreground">{tip}</p>
        </div>
      </CardContent>
    </Card>
  );
}
