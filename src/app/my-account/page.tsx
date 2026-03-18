"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().regex(/^\+?[0-9\s]{7,15}$/, "Invalid phone number"),
});

const passwordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ProfileData = z.infer<typeof profileSchema>;
type PasswordData = z.infer<typeof passwordSchema>;

function StatusMessage({ type, message }: { type: "success" | "error"; message: string }) {
  if (type === "success") {
    return (
      <div className="rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/40 px-4 py-3 text-sm text-green-700 dark:text-green-400">
        {message}
      </div>
    );
  }
  return (
    <div className="rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 px-4 py-3 text-sm text-red-700 dark:text-red-400">
      {message}
    </div>
  );
}

export default function MyAccountPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const profileForm = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "", phone: "" },
  });

  const passwordForm = useForm<PasswordData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  useEffect(() => {
    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) {
          profileForm.reset({ name: d.user.name, phone: d.user.phone });
          setEmail(d.user.email);
        }
      })
      .finally(() => setLoading(false));
  }, [profileForm]);

  async function onProfileSubmit(data: ProfileData) {
    setProfileError("");
    setProfileSuccess(false);
    const res = await fetch("/api/user/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) { setProfileError(json.error ?? "Update failed"); return; }
    setProfileSuccess(true);
  }

  async function onPasswordSubmit(data: PasswordData) {
    setPasswordError("");
    setPasswordSuccess(false);
    const res = await fetch("/api/user/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: data.password }),
    });
    const json = await res.json();
    if (!res.ok) { setPasswordError(json.error ?? "Update failed"); return; }
    setPasswordSuccess(true);
    passwordForm.reset();
  }

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Account</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your profile and password</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 items-start">

      {/* Profile */}
      <Card className="shadow-sm">
        <CardContent className="pt-4 flex flex-col gap-4">
          <div>
            <h2 className="font-semibold">Profile</h2>
            <p className="text-sm text-muted-foreground">Update your name and phone number.</p>
          </div>
          <Separator />
          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <Label>Email</Label>
              <Input value={email} disabled className="text-muted-foreground" />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="name">Name</Label>
              <Input id="name" autoComplete="name" {...profileForm.register("name")} />
              {profileForm.formState.errors.name && (
                <p className="text-xs text-destructive">{profileForm.formState.errors.name.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="phone">Phone (WhatsApp)</Label>
              <Input id="phone" autoComplete="tel" {...profileForm.register("phone")} />
              {profileForm.formState.errors.phone && (
                <p className="text-xs text-destructive">{profileForm.formState.errors.phone.message}</p>
              )}
            </div>
            {profileError && <StatusMessage type="error" message={profileError} />}
            {profileSuccess && <StatusMessage type="success" message="Profile updated successfully." />}
            <Button type="submit" disabled={profileForm.formState.isSubmitting}>
              {profileForm.formState.isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Password */}
      <Card className="shadow-sm">
        <CardContent className="pt-4 flex flex-col gap-4">
          <div>
            <h2 className="font-semibold">Change Password</h2>
            <p className="text-sm text-muted-foreground">Set a new password for your account.</p>
          </div>
          <Separator />
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="pr-16"
                  autoComplete="new-password"
                  {...passwordForm.register("password")}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs"
                >
                  {showPassword ? "Hide" : "Show"}
                </Button>
              </div>
              {passwordForm.formState.errors.password && (
                <p className="text-xs text-destructive">{passwordForm.formState.errors.password.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                {...passwordForm.register("confirmPassword")}
              />
              {passwordForm.formState.errors.confirmPassword && (
                <p className="text-xs text-destructive">{passwordForm.formState.errors.confirmPassword.message}</p>
              )}
            </div>
            {passwordError && <StatusMessage type="error" message={passwordError} />}
            {passwordSuccess && <StatusMessage type="success" message="Password changed successfully." />}
            <Button type="submit" disabled={passwordForm.formState.isSubmitting}>
              {passwordForm.formState.isSubmitting ? "Saving..." : "Change Password"}
            </Button>
          </form>
        </CardContent>
      </Card>

      </div>
    </div>
  );
}
