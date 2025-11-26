import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import type { ProfileBudgetConfig } from "@/components/ui/budget_cycle_card";
import type { UserProfile } from "@/lib/auth-provider";

interface UseBudgetSaveProps {
  user: { id: string } | null;
  profile: UserProfile | null;
  profileBudget: ProfileBudgetConfig;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  saveCategories: () => Promise<void>;
}

export function useBudgetSave({
  user,
  profile,
  profileBudget,
  updateProfile,
  saveCategories,
}: UseBudgetSaveProps) {
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveAll = async () => {
    if (!user || !profile) {
      toast({
        title: "Error",
        description: "You must be logged in to save budget configuration",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      // Save categories first
      await saveCategories();

      // Update profile budget settings
      await updateProfile({
        cycle_duration: "monthly",
        cycle_startDate: profileBudget.cycle_startDate,
        cycle_endDate: profileBudget.cycle_endDate || undefined,
        budget_auto_renew: profileBudget.budget_auto_renew,
      });

      toast({
        title: "Success",
        description: "Budget configuration saved successfully",
      });
    } catch (error) {
      console.error("Error saving budget configuration:", error);
      toast({
        title: "Error",
        description: "Failed to save budget configuration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    handleSaveAll,
  };
}
