import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET!;

export interface JWTPayload {
  id: string;
  email: string;
  role: "owner" | "user";
}

export const COOKIE_NAME = "token";

export const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  maxAge: 60 * 60 * 24 * 7, // 7 days
  path: "/",
};

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
}

export function getTokenFromRequest(req: NextRequest): JWTPayload | null {
  // Cookie first (browser requests)
  const cookieToken = req.cookies.get(COOKIE_NAME)?.value;
  if (cookieToken) {
    try { return verifyToken(cookieToken); } catch { /* fall through */ }
  }
  // Fallback: Authorization header (programmatic/API clients)
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    try { return verifyToken(authHeader.slice(7)); } catch { /* fall through */ }
  }
  return null;
}

export function requireOwner(req: NextRequest): JWTPayload {
  const payload = getTokenFromRequest(req);
  if (!payload || payload.role !== "owner") throw new Error("Unauthorized");
  return payload;
}

export function requireUser(req: NextRequest): JWTPayload {
  const payload = getTokenFromRequest(req);
  if (!payload || payload.role !== "user") throw new Error("Unauthorized");
  return payload;
}
