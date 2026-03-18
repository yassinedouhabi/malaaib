"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SearchBarProps {
  defaultCity?: string;
  defaultDate?: string;
  defaultType?: string;
}

export default function SearchBar({ defaultCity = "", defaultDate = "", defaultType = "" }: SearchBarProps) {
  const router = useRouter();
  const [city, setCity] = useState(defaultCity);
  const [date, setDate] = useState(defaultDate || new Date().toISOString().split("T")[0]);
  const [type, setType] = useState(defaultType);
  const [locating, setLocating] = useState(false);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (date) params.set("date", date);
    if (type && type !== "all") params.set("type", type);
    router.push(`/search?${params.toString()}`);
  }

  function handleNearMe() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const params = new URLSearchParams();
        params.set("lat", String(pos.coords.latitude));
        params.set("lng", String(pos.coords.longitude));
        params.set("radius", "10");
        if (date) params.set("date", date);
        if (type && type !== "all") params.set("type", type);
        router.push(`/search?${params.toString()}`);
        setLocating(false);
      },
      () => setLocating(false)
    );
  }

  return (
    <form onSubmit={handleSearch} className="flex flex-col gap-4 sm:flex-row sm:items-end sm:flex-wrap">
      <div className="flex flex-col gap-1.5 flex-1 min-w-36">
        <Label htmlFor="city">City</Label>
        <Input
          id="city"
          placeholder="e.g. Casablanca"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          min={new Date().toISOString().split("T")[0]}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="type">Type</Label>
        <Select value={type || "all"} onValueChange={(v) => setType(v === "all" ? "" : v)}>
          <SelectTrigger id="type" className="w-32">
            <SelectValue placeholder="Any" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any</SelectItem>
            <SelectItem value="5v5">5v5</SelectItem>
            <SelectItem value="6v6">6v6</SelectItem>
            <SelectItem value="7v7">7v7</SelectItem>
            <SelectItem value="11v11">11v11</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-2">
        <Button type="submit">Search</Button>
        <Button type="button" variant="outline" onClick={handleNearMe} disabled={locating}>
          {locating ? "Locating..." : "Near me"}
        </Button>
      </div>
    </form>
  );
}
