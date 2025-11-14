"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, User } from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthGuard } from "@/hooks/use-auth-guard";

const CURRENCIES = [
  { value: "USD", label: "US Dollar (USD)" },
  { value: "EUR", label: "Euro (EUR)" },
  { value: "GBP", label: "British Pound (GBP)" },
  { value: "JPY", label: "Japanese Yen (JPY)" },
  { value: "CNY", label: "Chinese Yuan (CNY)" },
];

export default function SetupPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // Guard: require auth but not profile (since they're setting it up)
  const {
    user,
    profile,
    setProfile,
    loading: authLoading,
  } = useAuthGuard({
    requireAuth: true,
    requireProfile: false,
  });

  // Redirect users who already have a profile
  useEffect(() => {
    if (!authLoading && user && profile) {
      router.push("/profile");
    }
  }, [user, profile, authLoading, router]);

  const [formData, setFormData] = useState({
    full_name: "",
    preferred_currency: "USD",
    occupation: "",
    age: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.full_name.trim()) {
      setError("Name is required");
      return;
    }

    if (
      formData.age &&
      (isNaN(Number(formData.age)) ||
        Number(formData.age) < 13 ||
        Number(formData.age) > 120)
    ) {
      setError("Please enter a valid age between 13 and 120");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/auth");
        return;
      }

      // Call Edge Function to upsert profile
      const { data, error } = await supabase.functions.invoke(
        "upsert-profile",
        {
          body: {
            full_name: formData.full_name,
            preferred_currency: formData.preferred_currency,
            occupation: formData.occupation || null,
            age: formData.age ? parseInt(formData.age) : null,
          },
        }
      );

      if (error) {
        throw new Error(error.message || "Failed to save profile");
      }
      setProfile({ ...data.profile });
      router.push("/dashboard");
    } catch (err) {
      console.error("Setup error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 to-background">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 to-background p-4">
      <Card className="w-full max-w-md bg-[#fcfcfc]">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary">
            <User className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Complete your profile</CardTitle>
          <CardDescription>Tell us a bit about yourself.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="full_name"
                type="text"
                placeholder="John Doe"
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
                disabled={loading}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferred_currency">
                Preferred Currency <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.preferred_currency}
                onValueChange={(value) =>
                  setFormData({ ...formData, preferred_currency: value })
                }
                disabled={loading}
              >
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((currency) => (
                    <SelectItem key={currency.value} value={currency.value}>
                      {currency.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="occupation">Occupation (optional)</Label>
              <Input
                id="occupation"
                type="text"
                placeholder="e.g., Software Engineer, Teacher, etc."
                value={formData.occupation}
                onChange={(e) =>
                  setFormData({ ...formData, occupation: e.target.value })
                }
                disabled={loading}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Age (optional)</Label>
              <Input
                id="age"
                type="number"
                placeholder="e.g., 25"
                value={formData.age}
                onChange={(e) =>
                  setFormData({ ...formData, age: e.target.value })
                }
                disabled={loading}
                min="13"
                max="120"
                className="h-11"
              />
            </div>

            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Setting up...
                </>
              ) : (
                "Complete setup"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
