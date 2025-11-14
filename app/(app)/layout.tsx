"use client";

import type React from "react";
import { AppShell } from "@/components/app-shell";
import { useAuthGuard } from "@/hooks/use-auth-guard";
// import { AppProvider } from "@/lib/store"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  // Protect all routes under (app) directory
  const { profile, user } = useAuthGuard();
  console.log(profile, user);

  return <AppShell>{children}</AppShell>;
}
