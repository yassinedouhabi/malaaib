import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import FieldCard from "@/components/FieldCard";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { connectDB } from "@/lib/db";
import Field from "@/models/Field";

async function getRecentFields() {
  try {
    await connectDB();
    const fields = await Field.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(6)
      .select("-__v")
      .lean();
    return fields;
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const recentFields = await getRecentFields();

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-4 py-8">
        <h1 className="text-3xl font-bold">Find a Football Field</h1>
        <p className="text-muted-foreground">Search available fields by city, date, and type.</p>
        <SearchBar />
      </section>

      <Separator />

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">How it works</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { step: "1", title: "Search", desc: "Enter your city, pick a date and field type." },
            { step: "2", title: "Choose a slot", desc: "Browse available time slots and pick one." },
            { step: "3", title: "Book instantly", desc: "Fill in your details and get a WhatsApp confirmation." },
          ].map(({ step, title, desc }) => (
            <Card key={step}>
              <CardContent className="pt-6 flex flex-col gap-2">
                <span className="text-2xl font-bold text-muted-foreground">{step}</span>
                <h3 className="font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {recentFields.length > 0 && (
        <>
          <Separator />
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Recently Added</h2>
              <Link href="/search" className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline">
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
        </>
      )}
    </div>
  );
}
