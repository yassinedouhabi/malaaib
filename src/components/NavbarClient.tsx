"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const PRO_URL = process.env.NEXT_PUBLIC_PRO_URL ?? "http://pro.localhost:3000";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

interface NavbarClientProps {
  role: "user" | "owner" | null;
  isPro: boolean;
}

export default function NavbarClient({ role, isPro }: NavbarClientProps) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    if (isPro) {
      window.location.href = `${PRO_URL}/login`;
    } else {
      router.push("/");
      router.refresh();
    }
  }

  const logoHref = isPro ? `${PRO_URL}/owner/dashboard` : APP_URL;

  return (
    <header className="border-b">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <a href={logoHref} className="font-semibold text-lg">
          {isPro ? "Malaaib Pro" : "Malaaib"}
        </a>

        <nav className="flex items-center gap-2">
          <ThemeToggle />
          {!role && (
            <>
              <Link href="/login" className={buttonVariants({ variant: "ghost", size: "sm" })}>Login</Link>
              <Link href="/register" className={buttonVariants({ variant: "ghost", size: "sm" })}>Register</Link>
            </>
          )}

          {role === "user" && (
            <DropdownMenu>
              <DropdownMenuTrigger className={buttonVariants({ variant: "outline", size: "sm" })}>
                My Account
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => router.push("/my-bookings")}>
                    My Bookings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/my-account")}>
                    Account Settings
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {role === "owner" && (
            <DropdownMenu>
              <DropdownMenuTrigger className={buttonVariants({ variant: "outline", size: "sm" })}>
                My Account
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => router.push("/owner/dashboard")}>
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/owner/fields")}>
                    My Fields
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </nav>
      </div>
      <Separator />
    </header>
  );
}
