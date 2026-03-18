import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { connectDB } from "@/lib/db";
import { signToken, COOKIE_NAME, COOKIE_OPTIONS } from "@/lib/auth";
import Owner from "@/models/Owner";
import User from "@/models/User";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[0-9\s]{7,15}$/;

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, phone, role } = await req.json();

    if (!name || !email || !password || !phone) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }
    if (!PHONE_RE.test(phone.replace(/\s/g, ""))) {
      return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
    }

    await connectDB();

    const hashed = await bcrypt.hash(password, 12);

    let token: string;
    let user: object;

    if (role === "owner") {
      const existing = await Owner.findOne({ email });
      if (existing) return NextResponse.json({ error: "Email already registered" }, { status: 409 });
      const owner = await Owner.create({ name, email, password: hashed, phone });
      token = signToken({ id: owner._id.toString(), email, role: "owner" });
      user = { id: owner._id, name, email, phone, role: "owner" };
    } else {
      const existing = await User.findOne({ email });
      if (existing) return NextResponse.json({ error: "Email already registered" }, { status: 409 });
      const u = await User.create({ name, email, password: hashed, phone });
      token = signToken({ id: u._id.toString(), email, role: "user" });
      user = { id: u._id, name, email, phone, role: "user" };
    }

    const res = NextResponse.json({ user });
    res.cookies.set(COOKIE_NAME, token, COOKIE_OPTIONS);
    return res;
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
