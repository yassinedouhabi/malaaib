import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { connectDB } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    const { id } = requireUser(req);
    await connectDB();
    const user = await User.findById(id).select("-password -__v").lean();
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id } = requireUser(req);
    const { name, phone, password } = await req.json();
    await connectDB();
    const user = await User.findById(id);
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (password) user.password = await bcrypt.hash(password, 12);
    await user.save();
    return NextResponse.json({ user: { id: user._id, name: user.name, phone: user.phone, email: user.email } });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
