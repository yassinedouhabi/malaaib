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
    <div className="flex justify-center pt-10">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{isPro ? "Owner Login" : "Login"}</CardTitle>
          {isPro && <CardDescription>Sign in to manage your fields</CardDescription>}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
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
            {serverError && <p className="text-sm text-destructive">{serverError}</p>}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Logging in..." : "Login"}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              No account? <Link href="/register" className="underline">Register</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
