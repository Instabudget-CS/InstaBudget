"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-provider";

interface UseAuthGuardOptions {
  requireAuth?: boolean;
  requireProfile?: boolean;
  redirectTo?: string;
}

export function useAuthGuard(options: UseAuthGuardOptions = {}) {
  const { user, profile, loading, setProfile } = useAuth();
  const router = useRouter();
  const { requireAuth = true, requireProfile = true, redirectTo } = options;

  useEffect(() => {
    if (loading) return;

    if (requireAuth && !user) {
      router.push(redirectTo || "/auth");
      return;
    }

    if (requireProfile && user && !profile) {
      router.push(redirectTo || "/auth/setup");
      return;
    }
  }, [user, profile, loading, requireAuth, requireProfile, redirectTo, router]);

  return {
    user,
    profile,
    loading,
    setProfile,
    isAuthorized:
      !loading && (!requireAuth || user) && (!requireProfile || profile),
  };
}
