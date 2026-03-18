import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { connectDB } from "@/lib/db";
import { signToken, COOKIE_NAME, COOKIE_OPTIONS } from "@/lib/auth";
import Owner from "@/models/Owner";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    const { email, password, role } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    await connectDB();

    let token: string;
    let user: object;

    if (role === "owner") {
      const owner = await Owner.findOne({ email });
      if (!owner) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      const match = await bcrypt.compare(password, owner.password);
      if (!match) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      token = signToken({ id: owner._id.toString(), email, role: "owner" });
      user = { id: owner._id, name: owner.name, email, phone: owner.phone, role: "owner" };
    } else {
      const u = await User.findOne({ email });
      if (!u) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      const match = await bcrypt.compare(password, u.password);
      if (!match) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      token = signToken({ id: u._id.toString(), email, role: "user" });
      user = { id: u._id, name: u.name, email, phone: u.phone, role: "user" };
    }

    const res = NextResponse.json({ user });
    res.cookies.set(COOKIE_NAME, token, COOKIE_OPTIONS);
    return res;
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
