"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import SearchBar from "@/components/SearchBar";
import FieldCard from "@/components/FieldCard";
import FilterSidebar from "@/components/FilterSidebar";
import { Separator } from "@/components/ui/separator";
import { buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface Field {
  _id: string;
  name: string;
  city: string;
  neighborhood?: string;
  type: string;
  pricePerHour: number;
  amenities: string[];
  slotDuration: number;
}

function SearchResults() {
  const searchParams = useSearchParams();
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);

  const city = searchParams.get("city") ?? "";
  const date = searchParams.get("date") ?? "";
  const type = searchParams.get("type") ?? "";

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams(searchParams.toString());
    fetch(`/api/fields/search?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => setFields(data.fields ?? []))
      .finally(() => setLoading(false));
  }, [searchParams]);

  // Close sheet when filters are applied (searchParams change)
  useEffect(() => {
    setSheetOpen(false);
  }, [searchParams]);

  return (
    <div className="flex flex-col gap-6">
      <SearchBar defaultCity={city} defaultDate={date} defaultType={type} />
      <Separator />

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

      <div className="flex gap-6">
        {/* Desktop sidebar */}
        <aside className="w-48 shrink-0 hidden sm:block">
          <FilterSidebar />
        </aside>

        <div className="flex-1 flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            {loading ? "Searching..." : `${fields.length} field${fields.length !== 1 ? "s" : ""} found`}
          </p>
          {!loading && fields.length === 0 && (
            <p className="text-muted-foreground">No fields found. Try a different city or date.</p>
          )}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {fields.map((f) => (
              <FieldCard key={f._id} field={f} date={date} />
            ))}
          </div>
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
