import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireOwner } from "@/lib/auth";
import Field from "@/models/Field";
import Booking from "@/models/Booking";

export async function GET(req: NextRequest) {
  try {
    const { id: ownerId } = requireOwner(req);
    await connectDB();

    const fields = await Field.find({ ownerId }).select("_id").lean();
    const fieldIds = fields.map((f) => f._id);

    const [totalBookings, confirmedBookings] = await Promise.all([
      Booking.countDocuments({ fieldId: { $in: fieldIds } }),
      Booking.find({ fieldId: { $in: fieldIds }, status: "confirmed" }).lean(),
    ]);

    const revenue = confirmedBookings.reduce((sum, b) => sum + b.totalPrice, 0);

    return NextResponse.json({
      totalFields: fields.length,
      totalBookings,
      confirmedBookings: confirmedBookings.length,
      revenue,
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
