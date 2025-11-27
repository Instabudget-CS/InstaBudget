"use client";

import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface AccountActionsProps {
  onSignOut: () => void;
}

export function AccountActions({ onSignOut }: AccountActionsProps) {
  return (
    <Button
      variant="destructive"
      onClick={onSignOut}
      className="w-full justify-center bg-red-400 hover:bg-red-500"
    >
      <LogOut className="mr-2 h-4 w-4" />
      Sign Out
    </Button>
  );
}
