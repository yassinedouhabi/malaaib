import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Field from "@/models/Field";
import Booking from "@/models/Booking";
import { generateSlots } from "@/lib/slots";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const date = req.nextUrl.searchParams.get("date");
    if (!date) return NextResponse.json({ error: "date is required" }, { status: 400 });

    await connectDB();

    const field = await Field.findById(id).lean();
    if (!field) return NextResponse.json({ error: "Field not found" }, { status: 404 });

    const [y, m, d] = date.split("-").map(Number);
    const dayOfWeek = new Date(y, m - 1, d).getDay();
    const hours = field.workingHours.find((h) => h.day === dayOfWeek);
    if (!hours) return NextResponse.json({ slots: [] });

    const allSlots = generateSlots(hours.open, hours.close, field.slotDuration);

    const bookings = await Booking.find({ fieldId: id, date, status: "confirmed" }).lean();
    const bookedSet = new Set(bookings.map((b) => b.startTime));

    const slots = allSlots.map((s) => ({ ...s, available: !bookedSet.has(s.startTime) }));
    return NextResponse.json({ slots });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
