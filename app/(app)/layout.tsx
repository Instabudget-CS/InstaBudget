"use client";

import type React from "react";
import { AppShell } from "@/components/app-shell";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { UserDataProvider } from "@/lib/user-data-provider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  useAuthGuard();

  return (
    <UserDataProvider>
      <AppShell>{children}</AppShell>
    </UserDataProvider>
  );
}
