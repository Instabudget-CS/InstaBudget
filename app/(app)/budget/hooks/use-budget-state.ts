import { useState, useEffect } from "react";
import type { ProfileBudgetConfig } from "@/components/ui/budget_cycle_card";
import { getTodayISO, calculateEndDate } from "../utils";
import type { UserProfile } from "@/lib/auth-provider";

interface UseBudgetStateProps {
  profile: UserProfile | null;
}

export function useBudgetState({ profile }: UseBudgetStateProps) {
  const todayISO = getTodayISO();

  const getInitialEndDate = () => {
    if (profile?.cycle_endDate) {
      return profile.cycle_endDate;
    }
    const startDate = profile?.cycle_startDate || todayISO;
    return calculateEndDate(startDate);
  };

  const [profileBudget, setProfileBudget] = useState<ProfileBudgetConfig>({
    cycle_duration: "monthly",
    cycle_startDate: profile?.cycle_startDate || todayISO,
    cycle_endDate: getInitialEndDate(),
    currency: profile?.preferred_currency || "USD",
    budget_auto_renew: profile?.budget_auto_renew ?? true,
  });

  // Update profile budget when profile loads
  useEffect(() => {
    if (profile) {
      const startDate = profile.cycle_startDate || todayISO;
      const endDate = profile.cycle_endDate || calculateEndDate(startDate);

      setProfileBudget({
        cycle_duration: "monthly",
        cycle_startDate: startDate,
        cycle_endDate: endDate,
        currency: profile.preferred_currency || "USD",
        budget_auto_renew: profile.budget_auto_renew ?? true,
      });
    }
  }, [profile, todayISO]);

  const handleProfileBudgetChange = (update: Partial<ProfileBudgetConfig>) => {
    // Ensure cycle_duration is always monthly
    const updated = { ...update };
    if (updated.cycle_duration) {
      updated.cycle_duration = "monthly";
    }
    setProfileBudget((prev) => ({ ...prev, ...updated }));
  };

  return {
    profileBudget,
    handleProfileBudgetChange,
  };
}
