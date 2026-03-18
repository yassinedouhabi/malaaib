"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import SearchBar from "@/components/SearchBar";
import FieldCard from "@/components/FieldCard";
import FilterSidebar from "@/components/FilterSidebar";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

// Load map only on client (no SSR)
const FieldMap = dynamic(() => import("@/components/FieldMap"), { ssr: false });

interface Field {
  _id: string;
  name: string;
  city: string;
  neighborhood?: string;
  type: string;
  pricePerHour: number;
  amenities: string[];
  slotDuration: number;
  distance?: number;
  location?: { lat: number; lng: number };
}

function SearchResults() {
  const searchParams = useSearchParams();
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [view, setView] = useState<"list" | "map">("list");

  const city = searchParams.get("city") ?? "";
  const date = searchParams.get("date") ?? "";
  const type = searchParams.get("type") ?? "";
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const isNearMe = !!(lat && lng);

  const userLocation = isNearMe ? { lat: Number(lat), lng: Number(lng) } : undefined;

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams(searchParams.toString());
    fetch(`/api/fields/search?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => setFields(data.fields ?? []))
      .finally(() => setLoading(false));
  }, [searchParams]);

  useEffect(() => {
    setSheetOpen(false);
  }, [searchParams]);

  // Auto-switch to map when searching by location
  useEffect(() => {
    if (isNearMe) setView("map");
  }, [isNearMe]);

  return (
    <div className="flex flex-col gap-8">

      {/* Search header */}
      <section className="bg-muted rounded-xl px-6 py-8 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {isNearMe ? "Fields near you" : "Find a field"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {loading
                ? "Searching..."
                : fields.length === 0
                ? "No fields found — try adjusting your search"
                : `${fields.length} field${fields.length !== 1 ? "s" : ""} found${isNearMe ? " nearby" : ""}`}
            </p>
          </div>

          {/* Map / List toggle */}
          {!loading && fields.length > 0 && (
            <div className="flex rounded-md border overflow-hidden shrink-0">
              <button
                onClick={() => setView("list")}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  view === "list"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground hover:bg-muted"
                }`}
              >
                List
              </button>
              <button
                onClick={() => setView("map")}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  view === "map"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground hover:bg-muted"
                }`}
              >
                Map
              </button>
            </div>
          )}
        </div>

        <SearchBar defaultCity={city} defaultDate={date} defaultType={type} />
      </section>

      {/* Mobile filter button */}
      <div className="sm:hidden">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger className={buttonVariants({ variant: "outline", size: "sm" })}>
            Filters
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader className="mb-4">
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <FilterSidebar />
          </SheetContent>
        </Sheet>
      </div>

      {/* Results */}
      <div className="flex gap-8">
        <aside className="w-48 shrink-0 hidden sm:block">
          <FilterSidebar />
        </aside>

        <div className="flex-1 min-w-0">
          {!loading && fields.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No fields match your filters. Try a different city, date, or remove some filters.
            </p>
          ) : view === "map" ? (
            <FieldMap fields={fields} userLocation={userLocation} date={date} />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {fields.map((f) => (
                <FieldCard key={f._id} field={f} date={date} />
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchResults />
    </Suspense>
  );
}
