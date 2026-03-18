import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireOwner } from "@/lib/auth";
import Field from "@/models/Field";

export async function GET(req: NextRequest) {
  try {
    const { id: ownerId } = requireOwner(req);
    await connectDB();
    const fields = await Field.find({ ownerId }).select("-__v").lean();
    return NextResponse.json({ fields });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { id: ownerId } = requireOwner(req);
    const body = await req.json();
    await connectDB();
    const field = await Field.create({ ...body, ownerId });
    return NextResponse.json({ field }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
