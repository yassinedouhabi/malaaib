import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireOwner } from "@/lib/auth";
import Field from "@/models/Field";
import Booking from "@/models/Booking";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: ownerId } = requireOwner(req);
    const { id } = await params;
    await connectDB();

    const booking = await Booking.findById(id).populate<{ fieldId: { ownerId: string } }>("fieldId", "ownerId");
    if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const field = await Field.findOne({ _id: booking.fieldId, ownerId });
    if (!field) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    booking.status = "cancelled";
    await booking.save();
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
