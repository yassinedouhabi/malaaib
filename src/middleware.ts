import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "");
const PRO_URL = process.env.NEXT_PUBLIC_PRO_URL ?? "http://pro.localhost:3000";

async function getRole(req: NextRequest): Promise<"user" | "owner" | null> {
  const token = req.cookies.get("token")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return (payload.role as "user" | "owner") ?? null;
  } catch {
    return null;
  }
}

function isProDomain(req: NextRequest): boolean {
  const host = req.headers.get("host") ?? "";
  return host.startsWith("pro.");
}

const CLIENT_ROUTES = ["/search", "/fields", "/checkout", "/booking", "/my-bookings", "/my-account"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const role = await getRole(req);
  const pro = isProDomain(req);

  if (pro) {
    // Pro subdomain — owner space

    // Root → dashboard or login
    if (pathname === "/") {
      return NextResponse.redirect(new URL(role === "owner" ? "/owner/dashboard" : "/login", req.url));
    }

    // Block client routes
    const blocked = CLIENT_ROUTES.some((p) => pathname === p || pathname.startsWith(p + "/"));
    if (blocked) return NextResponse.redirect(new URL("/owner/dashboard", req.url));

    // Auth pages — redirect if already owner
    if (pathname === "/login" || pathname === "/register") {
      if (role === "owner") return NextResponse.redirect(new URL("/owner/dashboard", req.url));
    }

    // Owner routes — require owner auth
    if (pathname.startsWith("/owner")) {
      if (!role) return NextResponse.redirect(new URL("/login", req.url));
      if (role !== "owner") return NextResponse.redirect(new URL("/login", req.url));
    }
  } else {
    // Main domain — client space

    // Owner routes → redirect to pro subdomain
    if (pathname.startsWith("/owner")) {
      return NextResponse.redirect(new URL(pathname, PRO_URL));
    }

    // Auth pages
    if (pathname === "/login" || pathname === "/register") {
      if (role === "owner") return NextResponse.redirect(new URL("/owner/dashboard", PRO_URL));
      if (role === "user") return NextResponse.redirect(new URL("/", req.url));
    }

    // User-only routes
    if (pathname === "/my-bookings" || pathname === "/my-account") {
      if (!role) return NextResponse.redirect(new URL("/login", req.url));
      if (role !== "user") return NextResponse.redirect(new URL("/owner/dashboard", PRO_URL));
    }

    // Block owners from client pages entirely
    if (role === "owner") {
      return NextResponse.redirect(new URL("/owner/dashboard", PRO_URL));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/register",
    "/search",
    "/fields/:path*",
    "/checkout",
    "/booking/:path*",
    "/owner/:path*",
    "/my-bookings",
    "/my-account",
  ],
};
