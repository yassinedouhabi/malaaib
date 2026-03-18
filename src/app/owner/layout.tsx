"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

const NAV = [
  { label: "Dashboard", href: "/owner/dashboard" },
  { label: "My Fields", href: "/owner/fields" },
];

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  const currentLabel = NAV.find((n) => pathname === n.href || pathname.startsWith(n.href))?.label ?? "Owner Panel";

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="px-4 py-3 border-b">
          <span className="font-semibold text-base">Malaaib Pro</span>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {NAV.map(({ label, href }) => {
                  const active = pathname === href || (href !== "/owner/dashboard" && pathname.startsWith(href));
                  return (
                    <SidebarMenuItem key={href}>
                      <SidebarMenuButton isActive={active} onClick={() => router.push(href)}>
                        {label}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t px-3 py-3 flex flex-col gap-2">
          <a href={APP_URL} className="text-xs text-muted-foreground hover:underline">
            Go to Malaaib
          </a>
          <Button variant="ghost" size="sm" className="justify-start px-2 text-destructive hover:text-destructive" onClick={logout}>
            Logout
          </Button>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-12 items-center gap-2 px-4 border-b">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-4" />
          <span className="text-sm text-muted-foreground">{currentLabel}</span>
        </header>
        <div className="p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
