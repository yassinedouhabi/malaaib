import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Field from "@/models/Field";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const city = searchParams.get("city");
    const date = searchParams.get("date");
    const type = searchParams.get("type");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const amenities = searchParams.getAll("amenities");

    await connectDB();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = { isActive: true };
    if (city) query.city = { $regex: city, $options: "i" };
    if (type) query.type = type;
    if (date) {
      const [y, m, d] = date.split("-").map(Number);
      const dayOfWeek = new Date(y, m - 1, d).getDay();
      query["workingHours.day"] = dayOfWeek;
    }
    if (minPrice || maxPrice) {
      query.pricePerHour = {};
      if (minPrice) query.pricePerHour.$gte = Number(minPrice);
      if (maxPrice) query.pricePerHour.$lte = Number(maxPrice);
    }
    if (amenities.length > 0) query.amenities = { $all: amenities };

    const fields = await Field.find(query).select("-__v").lean();
    return NextResponse.json({ fields });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
