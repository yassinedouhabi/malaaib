import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Field from "@/models/Field";

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const city = searchParams.get("city");
    const date = searchParams.get("date");
    const type = searchParams.get("type");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const amenities = searchParams.getAll("amenities");
    const lat = searchParams.get("lat") ? Number(searchParams.get("lat")) : null;
    const lng = searchParams.get("lng") ? Number(searchParams.get("lng")) : null;
    const radius = searchParams.get("radius") ? Number(searchParams.get("radius")) : 10; // km

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

    // When searching by location, only return fields that have coordinates
    if (lat !== null && lng !== null) {
      query["location.lat"] = { $exists: true };
      query["location.lng"] = { $exists: true };
    }

    const fields = await Field.find(query).select("-__v").lean();

    // If location search — compute distance, filter by radius, sort
    if (lat !== null && lng !== null) {
      const withDistance = fields
        .map((f) => ({
          ...f,
          distance: haversineKm(lat, lng, f.location!.lat!, f.location!.lng!),
        }))
        .filter((f) => f.distance <= radius)
        .sort((a, b) => a.distance - b.distance);

      return NextResponse.json({ fields: withDistance });
    }

    return NextResponse.json({ fields });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
