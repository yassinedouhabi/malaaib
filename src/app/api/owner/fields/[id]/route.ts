import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireOwner } from "@/lib/auth";
import Field from "@/models/Field";

async function getOwnedField(fieldId: string, ownerId: string) {
  const field = await Field.findOne({ _id: fieldId, ownerId });
  if (!field) return null;
  return field;
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: ownerId } = requireOwner(req);
    const { id } = await params;
    const body = await req.json();
    await connectDB();
    const field = await getOwnedField(id, ownerId);
    if (!field) return NextResponse.json({ error: "Not found" }, { status: 404 });
    Object.assign(field, body);
    await field.save();
    return NextResponse.json({ field });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: ownerId } = requireOwner(req);
    const { id } = await params;
    await connectDB();
    const field = await getOwnedField(id, ownerId);
    if (!field) return NextResponse.json({ error: "Not found" }, { status: 404 });
    field.isActive = false;
    await field.save();
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
