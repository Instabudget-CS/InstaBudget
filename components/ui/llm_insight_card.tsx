"use client";

import { Sparkles, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export interface LLMInsightsCardProps {
  insights: string[];
  loading?: boolean;
}

export function LLMInsightsCard({
  insights,
  loading = false,
}: LLMInsightsCardProps) {
  return (
    <Card className="relative transition-all hover:shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-500">
          <Sparkles className="h-4 w-4" />
          AI Insights
        </CardTitle>
        <CardDescription>
          Personalized tips based on your recent spending
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <p className="ml-2 text-sm text-muted-foreground">
              Analyzing your spending...
            </p>
          </div>
        ) : insights.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
            <p className="text-sm text-muted-foreground">
              No insights available yet. Add some transactions to get
              personalized tips!
            </p>
          </div>
        ) : (
          insights.map((insight, index) => (
            <div
              key={index}
              className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3"
            >
              <p className="text-xs font-semibold text-muted-foreground">
                Insight {index + 1}
              </p>
              <p className="mt-1 text-sm text-foreground">{insight}</p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
