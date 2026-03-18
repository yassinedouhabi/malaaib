import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Field from "@/models/Field";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    const field = await Field.findById(id).select("-__v").lean();
    if (!field) return NextResponse.json({ error: "Field not found" }, { status: 404 });
    return NextResponse.json({ field });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
