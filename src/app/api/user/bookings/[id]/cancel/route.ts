import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import Booking from "@/models/Booking";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = requireUser(req);
    const { id } = await params;
    await connectDB();

    const booking = await Booking.findOne({ _id: id, userId });
    if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (booking.status === "cancelled") return NextResponse.json({ error: "Already cancelled" }, { status: 400 });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [y, m, d] = booking.date.split("-").map(Number);
    if (new Date(y, m - 1, d) < today) {
      return NextResponse.json({ error: "Cannot cancel a past booking" }, { status: 400 });
    }

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
