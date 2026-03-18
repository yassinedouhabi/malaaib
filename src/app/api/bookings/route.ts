import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getTokenFromRequest } from "@/lib/auth";
import Field from "@/models/Field";
import Booking from "@/models/Booking";
import Owner from "@/models/Owner";
import { notifyBookingConfirmed } from "@/lib/whatsapp";
import { generateSlots } from "@/lib/slots";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fieldId, date, startTime, endTime, clientName, clientPhone, clientEmail } = body;

    if (!fieldId || !date || !startTime || !endTime || !clientName || !clientPhone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectDB();

    // Reject past dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [y, mo, d] = date.split("-").map(Number);
    const bookingDate = new Date(y, mo - 1, d);
    if (bookingDate < today) {
      return NextResponse.json({ error: "Cannot book a past date" }, { status: 400 });
    }

    const field = await Field.findById(fieldId).lean();
    if (!field || !field.isActive) {
      return NextResponse.json({ error: "Field not found" }, { status: 404 });
    }

    // Validate slot exists in field's working hours
    const dayOfWeek = new Date(y, mo - 1, d).getDay();
    const hours = field.workingHours.find((h) => h.day === dayOfWeek);
    if (!hours) {
      return NextResponse.json({ error: "Field is closed on this day" }, { status: 400 });
    }
    const validSlots = generateSlots(hours.open, hours.close, field.slotDuration);
    const slotExists = validSlots.some((s) => s.startTime === startTime && s.endTime === endTime);
    if (!slotExists) {
      return NextResponse.json({ error: "Invalid time slot" }, { status: 400 });
    }

    // Calculate price
    const [sh, sm] = startTime.split(":").map(Number);
    const [eh, em] = endTime.split(":").map(Number);
    let durationMinutes = (eh * 60 + em) - (sh * 60 + sm);
    if (durationMinutes <= 0) durationMinutes += 1440;
    const totalPrice = Math.round((durationMinutes / 60) * field.pricePerHour);

    // Get userId if logged in as user
    const token = getTokenFromRequest(req);
    const userId = token?.role === "user" ? token.id : undefined;

    const conflict = await Booking.exists({ fieldId, date, startTime, status: "confirmed" });
    if (conflict) {
      return NextResponse.json({ error: "This slot is already booked" }, { status: 409 });
    }

    const booking = await Booking.create({
      fieldId,
      date,
      startTime,
      endTime,
      clientName,
      clientPhone,
      clientEmail,
      ...(userId ? { userId } : {}),
      totalPrice,
    });

    // Send WhatsApp notifications
    const owner = await Owner.findById(field.ownerId).lean();
    if (owner) {
      await notifyBookingConfirmed({
        clientPhone,
        ownerPhone: owner.phone,
        clientName,
        fieldName: field.name,
        date,
        startTime,
        endTime,
        totalPrice,
      });
    }

    return NextResponse.json({ booking }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes("duplicate key")) {
      return NextResponse.json({ error: "This slot is already booked" }, { status: 409 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
