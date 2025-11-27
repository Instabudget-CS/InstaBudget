import { useState, useEffect, useMemo } from "react";
import type { UserProfile } from "@/lib/auth-provider";
import type { ProfileFormData } from "../types";

interface UseProfileFormProps {
  profile: UserProfile | null;
  userEmail: string | undefined;
}

export function useProfileForm({ profile, userEmail }: UseProfileFormProps) {
  const initialFormData = useMemo<ProfileFormData>(() => {
    if (profile) {
      return {
        fullName: profile.full_name || "",
        email: userEmail || "",
        occupation: profile.occupation || "",
      };
    }
    return {
      fullName: "",
      email: userEmail || "",
      occupation: "",
    };
  }, [profile, userEmail]);

  const [formData, setFormData] = useState<ProfileFormData>(initialFormData);

  useEffect(() => {
    setFormData(initialFormData);
  }, [initialFormData]);

  const updateField = <K extends keyof ProfileFormData>(
    field: K,
    value: ProfileFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return {
    formData,
    updateField,
  };
}
