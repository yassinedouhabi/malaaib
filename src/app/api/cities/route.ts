import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Field from "@/models/Field";

export async function GET() {
  try {
    await connectDB();
    const cities = await Field.distinct("city", { isActive: true });
    return NextResponse.json({ cities: cities.sort() });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
