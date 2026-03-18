import { cookies, headers } from "next/headers";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import NavbarClient from "./NavbarClient";

export default async function Navbar() {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const host = headerStore.get("host") ?? "";
  const isPro = host.startsWith("pro.");

  let role: "user" | "owner" | null = null;
  if (token) {
    try {
      role = verifyToken(token).role;
    } catch { /* expired or invalid */ }
  }

  return <NavbarClient role={role} isPro={isPro} />;
}
