"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useDomain } from "@/lib/domain-context";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { isPro } = useDomain();
  const role = isPro ? "owner" : "user";
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setServerError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, role }),
    });
    const json = await res.json();
    if (!res.ok) {
      const msg: string = json.error ?? "Login failed";
      if (msg.toLowerCase().includes("email") && !msg.toLowerCase().includes("credentials")) {
        setError("email", { message: msg });
      } else {
        setServerError(msg);
      }
      return;
    }
    router.push(isPro ? "/owner/dashboard" : "/");
    router.refresh();
  }

  return (
    <div className="flex min-h-[75vh] items-center justify-center py-12">
      <div className="flex flex-col gap-6 w-full max-w-sm">

        {/* Header */}
        <div className="text-center flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">
            {isPro ? "Owner Login" : "Welcome back"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isPro ? "Sign in to manage your fields" : "Sign in to your account to continue"}
          </p>
        </div>

        {/* Form */}
        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" autoComplete="email" {...register("email")} />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="pr-16"
                    autoComplete="current-password"
                    {...register("password")}
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
                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
              </div>

              {serverError && (
                <div className="rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 px-4 py-3 text-sm text-red-700 dark:text-red-400">
                  {serverError}
                </div>
              )}

              <Button type="submit" disabled={isSubmitting} className="w-full mt-1">
                {isSubmitting ? "Signing in..." : "Sign in"}
              </Button>

            </form>
          </CardContent>
        </Card>

        {/* Footer link */}
        <p className="text-sm text-center text-muted-foreground">
          No account?{" "}
          <Link href="/register" className="text-foreground underline underline-offset-4 hover:text-foreground/80">
            Create one
          </Link>
        </p>

      </div>
    </div>
  );
}
