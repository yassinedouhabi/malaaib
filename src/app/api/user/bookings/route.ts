import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import Booking from "@/models/Booking";

export async function GET(req: NextRequest) {
  try {
    const { id: userId } = requireUser(req);
    await connectDB();
    const bookings = await Booking.find({ userId })
      .populate("fieldId", "name city type")
      .sort({ date: -1, startTime: -1 })
      .lean();
    return NextResponse.json({ bookings });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
