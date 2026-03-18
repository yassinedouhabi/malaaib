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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
    <div className="flex justify-center pt-10">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{isPro ? "Create Owner Account" : "Register"}</CardTitle>
          {isPro && <CardDescription>List your field and start accepting bookings</CardDescription>}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">{isPro ? "Your name" : "Name"}</Label>
              <Input id="name" {...register("name")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone">{isPro ? "WhatsApp number" : "Phone (WhatsApp)"}</Label>
              <Input id="phone" placeholder="+212..." {...register("phone")} />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="pr-16"
                  {...register("password")}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2"
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
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
            </div>
            {serverError && <p className="text-sm text-destructive">{serverError}</p>}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating account..." : isPro ? "Create Owner Account" : "Register"}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Have an account? <Link href="/login" className="underline">Login</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
