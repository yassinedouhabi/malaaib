import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import Booking from "@/models/Booking";

export async function PATCH(req: NextRequest) {
  try {
    const { id: userId } = requireUser(req);
    await connectDB();

    await Booking.deleteMany({ userId });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
