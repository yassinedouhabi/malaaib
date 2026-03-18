"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const AMENITIES = ["parking", "lighting", "changing rooms", "water"];

export default function FilterSidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
    searchParams.getAll("amenities")
  );

  function toggleAmenity(a: string) {
    setSelectedAmenities((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
    );
  }

  function applyFilters() {
    const params = new URLSearchParams(searchParams.toString());
    if (minPrice) params.set("minPrice", minPrice); else params.delete("minPrice");
    if (maxPrice) params.set("maxPrice", maxPrice); else params.delete("maxPrice");
    params.delete("amenities");
    selectedAmenities.forEach((a) => params.append("amenities", a));
    router.push(`/search?${params.toString()}`);
  }

  function clearFilters() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("minPrice");
    params.delete("maxPrice");
    params.delete("amenities");
    setMinPrice("");
    setMaxPrice("");
    setSelectedAmenities([]);
    router.push(`/search?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-medium">Filters</h3>
      <Separator />
      <div className="flex flex-col gap-2">
        <Label>Price per hour (MAD)</Label>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Min"
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-20"
          />
          <span className="text-sm text-muted-foreground">–</span>
          <Input
            placeholder="Max"
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-20"
          />
        </div>
      </div>
      <Separator />
      <div className="flex flex-col gap-2">
        <Label>Amenities</Label>
        {AMENITIES.map((a) => (
          <div key={a} className="flex items-center gap-2">
            <Checkbox
              id={a}
              checked={selectedAmenities.includes(a)}
              onCheckedChange={() => toggleAmenity(a)}
            />
            <Label htmlFor={a} className="capitalize cursor-pointer font-normal">
              {a}
            </Label>
          </div>
        ))}
      </div>
      <Separator />
      <Button onClick={applyFilters}>Apply</Button>
      <Button variant="ghost" onClick={clearFilters}>Clear</Button>
    </div>
  );
}
