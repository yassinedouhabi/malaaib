import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireOwner } from "@/lib/auth";
import Field from "@/models/Field";
import Booking from "@/models/Booking";

export async function GET(req: NextRequest) {
  try {
    const { id: ownerId } = requireOwner(req);
    const date = req.nextUrl.searchParams.get("date");
    await connectDB();

    const fields = await Field.find({ ownerId }).select("_id").lean();
    const fieldIds = fields.map((f) => f._id);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = { fieldId: { $in: fieldIds } };
    if (date) query.date = date;

    const bookings = await Booking.find(query)
      .populate("fieldId", "name city type")
      .sort({ date: 1, startTime: 1 })
      .lean();

    return NextResponse.json({ bookings });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
