"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ProfileHeaderProps {
  fullName: string;
}

export function ProfileHeader({ fullName }: ProfileHeaderProps) {
  const initials =
    fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  return (
    <CardHeader>
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src="/placeholder.svg?height=64&width=64" />
          <AvatarFallback className="bg-primary text-primary-foreground text-xl">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <CardTitle className="text-green-500">Profile & Settings</CardTitle>
          <CardDescription>
            Update your personal details and preferences
          </CardDescription>
        </div>
      </div>
    </CardHeader>
  );
}
