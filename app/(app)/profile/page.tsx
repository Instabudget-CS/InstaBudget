"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { useApp } from '@/lib/store';
// import { toast } from '@/hooks/use-toast';
import { User, Wallet, Calendar, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
// import { useAuthGuard } from '@/hooks/use-auth-guard';

export default function ProfilePage() {
  // useAuthGuard();
  const router = useRouter();
  const user = {
    full_name: "John Doe",
    email: "john.doe@example.com",
    preferred_currency: "USD",
    timezone: "America/Los_Angeles",
  };

  const budget = {
    cycle: "monthly",
    cycleAnchor: "2025-10-01",
    startingBalance: 0,
  };
  // const { user, budget, updateUser, updateBudget } = useApp();

  const [fullName, setFullName] = useState(user.full_name);
  const [email, setEmail] = useState(user.email);
  const [currency, setCurrency] = useState(user.preferred_currency);
  const [timezone, setTimezone] = useState(user.timezone);

  const [cycle, setCycle] = useState(budget.cycle);
  const [cycleAnchor, setCycleAnchor] = useState(budget.cycleAnchor);
  const [startingBalance, setStartingBalance] = useState(
    budget.startingBalance.toString()
  );

  const handleSaveProfile = () => {};

  const handleSaveBudget = () => {};

  const handleLogout = () => {
    router.push("/auth");
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 mb-20">
      <div className="">
        <h1 className="text-3xl font-bold text-green-500">
          Profile & Settings
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your account and budget preferences
        </p>
      </div>

      {/* Profile Section */}
      <Card className="relative rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="/placeholder.svg?height=64&width=64" />
              <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                {fullName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-green-500">
                Account Information
              </CardTitle>
              <CardDescription className="">
                Update your personal details
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 px-6 py-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="currency">Preferred Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger id="timezone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/New_York">Eastern Time</SelectItem>
                  <SelectItem value="America/Chicago">Central Time</SelectItem>
                  <SelectItem value="America/Los_Angeles">
                    Pacific Time
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              onClick={handleSaveProfile}
              className="hover:bg-green-500 bg-green-400 text-white"
            >
              <User className="mr-2 h-4 w-4" />
              Save Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Budget Settings */}
      <Card className="relative rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="text-green-500">Budget Configuration</CardTitle>
          <CardDescription>
            Set up your budget cycle and starting balance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cycle">Budget Cycle</Label>
              <Select
                value={cycle}
                onValueChange={(v) =>
                  setCycle(v as "weekly" | "biweekly" | "monthly")
                }
              >
                <SelectTrigger id="cycle">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Bi-weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cycleAnchor">Cycle Start Date</Label>
              <Input
                id="cycleAnchor"
                type="date"
                value={cycleAnchor}
                onChange={(e) => setCycleAnchor(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="startingBalance">Starting Balance</Label>
            <Input
              id="startingBalance"
              type="number"
              step="0.01"
              value={startingBalance}
              onChange={(e) => setStartingBalance(e.target.value)}
              placeholder="0.00"
            />
            <p className="text-xs text-muted-foreground">
              This is your account balance at the start of the budget cycle
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              onClick={handleSaveBudget}
              className="hover:bg-green-500 bg-green-400 text-white"
            >
              <Wallet className="mr-2 h-4 w-4 " />
              Save Budget Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Budget Info Card */}
      <Card className="relative rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="flex items-start gap-3 py-4">
          <Calendar className="mt-0.5 h-5 w-5 text-primary" />
          <div className="flex-1">
            <p className="font-medium text-green-500">Current Budget Cycle</p>
            <p className="text-sm text-muted-foreground">
              Your {cycle} budget cycle started on{" "}
              {new Date(cycleAnchor).toLocaleDateString()} with a starting
              balance of ${Number.parseFloat(startingBalance).toFixed(2)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Logout */}
      <Button
        variant="destructive"
        onClick={handleLogout}
        className="w-full justify-center bg-green-400 hover:bg-green-500"
      >
        {/* <LogOut className="mr-2 h-4 w-4" /> */}
        Sign Out
      </Button>
    </div>
  );
}
