"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  preferred_currency: string;
  occupation?: string;
  age?: number;
  timezone: string;
  cycle_duration?: "monthly";
  cycle_startDate?: string;
  cycle_endDate?: string;
  starting_balance?: number;
  budget_auto_renew?: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: SupabaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  setProfile: (profile: UserProfile | null) => void;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const checkAndRenewCycle = async (
    profileData: UserProfile | null,
    userId: string
  ) => {
    if (!profileData) return profileData;

    // Only check if budget_auto_renew is enabled
    if (!profileData.budget_auto_renew) {
      return profileData;
    }

    // Check if cycle_endDate exists and has passed
    if (!profileData.cycle_endDate) {
      return profileData;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = new Date(profileData.cycle_endDate);
    endDate.setHours(0, 0, 0, 0);

    // If end date hasn't passed yet, no need to renew
    if (endDate >= today) {
      return profileData;
    }

    // Calculate new cycle dates
    // New start date = old end date + 1 day
    const newStartDate = new Date(endDate);
    newStartDate.setDate(newStartDate.getDate() + 1);

    // New end date = new start date + 30 days
    const newEndDate = new Date(newStartDate);
    newEndDate.setDate(newEndDate.getDate() + 30);

    const newStartDateISO = newStartDate.toISOString().split("T")[0];
    const newEndDateISO = newEndDate.toISOString().split("T")[0];

    // Update profile with new cycle dates
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          cycle_startDate: newStartDateISO,
          cycle_endDate: newEndDateISO,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      if (error) {
        console.error("Error auto-renewing budget cycle:", error);
        return profileData;
      }

      // Return updated profile data
      return {
        ...profileData,
        cycle_startDate: newStartDateISO,
        cycle_endDate: newEndDateISO,
      };
    } catch (error) {
      console.error("Error auto-renewing budget cycle:", error);
      return profileData;
    }
  };

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      console.log("getting profile");
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      console.log("got profile");
      if (error) {
        console.error("Error fetching profile:", error);
        setProfile(null);
      } else {
        const profileData = data ?? null;
        // Check and auto-renew cycle if needed
        const updatedProfile = await checkAndRenewCycle(profileData, userId);
        setProfile(updatedProfile);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setProfile(null);
    }
  }, []);

  const refreshProfile = async () => {
    if (!user) {
      setProfile(null);
      return;
    }
    await fetchProfile(user.id);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (error) {
        console.error("Error updating profile:", error);
      } else {
        await refreshProfile();
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const signOut = async () => {
    try {
      console.log("signing out");
      await supabase.auth.signOut();
      console.log("signed out");
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!isMounted) return;

      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }

      setLoading(false);
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change:", event, session?.user?.id);

      if (!isMounted) return;

      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
        // Redirect to login page when user signs out or session expires
        if (event === "SIGNED_OUT" && typeof window !== "undefined") {
          const currentPath = window.location.pathname;
          if (currentPath !== "/auth" && !currentPath.startsWith("/auth/")) {
            window.location.href = "/auth";
          }
        }
      }

      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const value = {
    user,
    profile,
    loading,
    signOut,
    refreshProfile,
    updateProfile,
    setProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
