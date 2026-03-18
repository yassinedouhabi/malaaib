import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Booking from "@/models/Booking";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    const booking = await Booking.findById(id).populate("fieldId", "name city type pricePerHour").lean();
    if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    return NextResponse.json({ booking });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
