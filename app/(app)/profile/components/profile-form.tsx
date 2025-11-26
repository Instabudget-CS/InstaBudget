"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CardContent } from "@/components/ui/card";
import { User, Loader2 } from "lucide-react";
import { CURRENCIES, BUDGET_CYCLES } from "../constants";
import type { ProfileFormData, BudgetCycle } from "../types";

interface ProfileFormProps {
  formData: ProfileFormData;
  onFieldChange: <K extends keyof ProfileFormData>(
    field: K,
    value: ProfileFormData[K]
  ) => void;
  onSave: () => void;
  isSaving: boolean;
  userEmail: string;
}

export function ProfileForm({
  formData,
  onFieldChange,
  onSave,
  isSaving,
  userEmail,
}: ProfileFormProps) {
  return (
    <CardContent className="space-y-6 px-6 py-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            value={formData.fullName}
            onChange={(e) => onFieldChange("fullName", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={userEmail}
            disabled
            className="bg-muted"
          />
          <p className="text-xs text-muted-foreground">
            Email cannot be changed
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="currency">Preferred Currency</Label>
          <Select
            value={formData.currency}
            onValueChange={(value) => onFieldChange("currency", value)}
          >
            <SelectTrigger id="currency">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((currency) => (
                <SelectItem key={currency.value} value={currency.value}>
                  {currency.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="occupation">Occupation</Label>
          <Input
            id="occupation"
            value={formData.occupation}
            onChange={(e) => onFieldChange("occupation", e.target.value)}
            placeholder="e.g., Software Engineer, Teacher, etc."
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cycle">Budget Cycle</Label>
        <Select
          value={formData.cycle}
          onValueChange={(value) =>
            onFieldChange("cycle", value as BudgetCycle)
          }
        >
          <SelectTrigger id="cycle">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {BUDGET_CYCLES.map((cycle) => (
              <SelectItem key={cycle.value} value={cycle.value}>
                {cycle.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end pt-2">
        <Button
          onClick={onSave}
          className="hover:bg-green-500 bg-green-400 text-white"
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <User className="mr-2 h-4 w-4" />
              Update Profile
            </>
          )}
        </Button>
      </div>
    </CardContent>
  );
}
