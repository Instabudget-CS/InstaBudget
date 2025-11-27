"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-provider";
import { toast } from "@/hooks/use-toast";
import { ProfileHeader } from "./components/profile-header";
import { ProfileForm } from "./components/profile-form";
import { AccountActions } from "./components/account-actions";
import { useProfileForm } from "./hooks/use-profile-form";

export default function ProfilePage() {
  const {
    user,
    profile,
    updateProfile,
    loading: authLoading,
    signOut,
  } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  const { formData, updateField } = useProfileForm({
    profile,
    userEmail: user?.email,
  });

  const handleSaveProfile = async () => {
    if (!profile) return;

    setIsSaving(true);
    try {
      await updateProfile({
        full_name: formData.fullName,
        occupation: formData.occupation || undefined,
      });

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium">No profile found</p>
          <p className="text-sm text-muted-foreground">
            Please complete your profile setup
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 mb-20">
      <div>
        <h1 className="text-3xl font-bold text-green-500">
          Profile & Settings
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your account and budget preferences
        </p>
      </div>

      <Card className="relative rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
        <ProfileHeader fullName={formData.fullName} />
        <ProfileForm
          formData={formData}
          onFieldChange={updateField}
          onSave={handleSaveProfile}
          isSaving={isSaving}
          userEmail={user?.email || ""}
        />
      </Card>

      <AccountActions onSignOut={handleSignOut} />
    </div>
  );
}
