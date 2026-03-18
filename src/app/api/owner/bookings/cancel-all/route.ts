import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireOwner } from "@/lib/auth";
import Field from "@/models/Field";
import Booking from "@/models/Booking";

export async function PATCH(req: NextRequest) {
  try {
    const { id: ownerId } = requireOwner(req);
    await connectDB();

    const fields = await Field.find({ ownerId }).select("_id").lean();
    const fieldIds = fields.map((f) => f._id);

    await Booking.deleteMany({ fieldId: { $in: fieldIds } });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
