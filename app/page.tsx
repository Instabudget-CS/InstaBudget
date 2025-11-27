"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuthGuard } from "@/hooks/use-auth-guard";

export default function HomePage() {
  const { user, profile, loading } = useAuthGuard();
  console.log(user, profile, loading);
  const router = useRouter();

  useEffect(() => {
    if (!loading && profile) {
      router.push("/profile");
    }
  }, [profile, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 to-background">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return null;
}
