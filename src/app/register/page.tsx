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

const schema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().regex(/^\+?[0-9\s]{7,15}$/, "Invalid phone number"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
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
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, role }),
    });
    const json = await res.json();
    if (!res.ok) {
      const msg: string = json.error ?? "Registration failed";
      if (msg.toLowerCase().includes("email")) setError("email", { message: msg });
      else if (msg.toLowerCase().includes("phone")) setError("phone", { message: msg });
      else if (msg.toLowerCase().includes("password")) setError("password", { message: msg });
      else setServerError(msg);
      return;
    }
    router.push(isPro ? "/owner/fields" : "/");
    router.refresh();
  }

  return (
    <div className="flex min-h-[75vh] items-center justify-center py-12">
      <div className="flex flex-col gap-6 w-full max-w-sm">

        {/* Header */}
        <div className="text-center flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">
            {isPro ? "Create Owner Account" : "Create an account"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isPro ? "List your field and start accepting bookings" : "Join Malaaib and book fields near you"}
          </p>
        </div>

        {/* Form */}
        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name">{isPro ? "Your name" : "Name"}</Label>
                <Input id="name" autoComplete="name" {...register("name")} />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" autoComplete="email" {...register("email")} />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="phone">{isPro ? "WhatsApp number" : "Phone (WhatsApp)"}</Label>
                <Input id="phone" placeholder="+212..." autoComplete="tel" {...register("phone")} />
                {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="pr-16"
                    autoComplete="new-password"
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

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  {...register("confirmPassword")}
                />
                {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
              </div>

              {serverError && (
                <div className="rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 px-4 py-3 text-sm text-red-700 dark:text-red-400">
                  {serverError}
                </div>
              )}

              <Button type="submit" disabled={isSubmitting} className="w-full mt-1">
                {isSubmitting ? "Creating account..." : isPro ? "Create Owner Account" : "Create Account"}
              </Button>

            </form>
          </CardContent>
        </Card>

        {/* Footer link */}
        <p className="text-sm text-center text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-foreground underline underline-offset-4 hover:text-foreground/80">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  );
}
