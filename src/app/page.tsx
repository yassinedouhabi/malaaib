import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import FieldCard from "@/components/FieldCard";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { connectDB } from "@/lib/db";
import Field from "@/models/Field";

const PRO_URL = process.env.NEXT_PUBLIC_PRO_URL ?? "http://pro.localhost:3000";

async function getHomeData() {
  try {
    await connectDB();
    const [recentFields, totalFields, citiesRaw] = await Promise.all([
      Field.find({ isActive: true }).sort({ createdAt: -1 }).limit(6).select("-__v").lean(),
      Field.countDocuments({ isActive: true }),
      Field.distinct("city", { isActive: true }),
    ]);
    return { recentFields, totalFields, citiesCount: citiesRaw.length };
  } catch {
    return { recentFields: [], totalFields: 0, citiesCount: 0 };
  }
}

export default async function HomePage() {
  const { recentFields, totalFields, citiesCount } = await getHomeData();

  return (
    <div className="flex flex-col gap-16">

      {/* Hero */}
      <section
        className="relative rounded-xl overflow-hidden px-6 py-20 flex flex-col items-center gap-8 text-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?q=80&w=2070&auto=format&fit=crop')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/60 rounded-xl" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center gap-8">
          <div className="flex flex-col gap-3 max-w-xl">
            <h1 className="text-5xl font-bold tracking-tight leading-tight text-white">
              Book a football field, instantly
            </h1>
            <p className="text-white/70 text-lg">
              Search available fields across Morocco. Pick a time slot. Done.
            </p>
          </div>

          {totalFields > 0 && (
            <div className="flex gap-6 text-sm">
              <span>
                <span className="font-semibold text-white">{totalFields}</span>{" "}
                <span className="text-white/60">fields</span>
              </span>
              {citiesCount > 0 && (
                <span>
                  <span className="font-semibold text-white">{citiesCount}</span>{" "}
                  <span className="text-white/60">cities</span>
                </span>
              )}
            </div>
          )}

          <Card className="w-full max-w-2xl shadow-lg">
            <CardContent className="pt-6">
              <SearchBar />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Recently added */}
      {recentFields.length > 0 && (
        <section className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Recently added</h2>
              <p className="text-sm text-muted-foreground mt-1">Newly listed fields available for booking</p>
            </div>
            <Link
              href="/search"
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 h-8 text-xs font-medium shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              View all
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentFields.map((f) => (
              <FieldCard
                key={String(f._id)}
                field={{
                  _id: String(f._id),
                  name: f.name,
                  city: f.city,
                  neighborhood: f.neighborhood,
                  type: f.type,
                  pricePerHour: f.pricePerHour,
                  amenities: f.amenities,
                  slotDuration: f.slotDuration,
                }}
              />
            ))}
          </div>
        </section>
      )}

      <Separator />

      {/* How it works */}
      <section className="flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">How it works</h2>
          <p className="text-sm text-muted-foreground mt-1">Book a field in three simple steps</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { step: "01", title: "Search", desc: "Enter your city, pick a date and field type to see what's available." },
            { step: "02", title: "Choose a slot", desc: "Browse the available time slots and select the one that fits you." },
            { step: "03", title: "Book instantly", desc: "Fill in your details and receive a WhatsApp confirmation right away." },
          ].map(({ step, title, desc }) => (
            <Card key={step} className="relative overflow-hidden">
              <CardContent className="pt-6 flex flex-col gap-2">
                <span className="text-5xl font-black text-muted-foreground/20 leading-none select-none">{step}</span>
                <h3 className="font-semibold text-base mt-2">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Owner CTA */}
      <section>
        <Card className="bg-muted border-0">
          <CardContent className="pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h3 className="font-semibold text-base">Own a football field?</h3>
              <p className="text-sm text-muted-foreground">List your field on Malaaib and start accepting bookings today — it's free.</p>
            </div>
            <a
              href={`${PRO_URL}/register`}
              className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-3 h-8 text-xs font-medium shadow hover:bg-primary/90 transition-colors shrink-0"
            >
              List your field
            </a>
          </CardContent>
        </Card>
      </section>

    </div>
  );
}
