"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const AMENITIES = ["parking", "lighting", "changing rooms", "water"];

interface WorkingHour {
  day: number;
  open: string;
  close: string;
}

interface FieldData {
  name: string;
  description: string;
  type: string;
  city: string;
  neighborhood: string;
  address: string;
  pricePerHour: number;
  slotDuration: number;
  amenities: string[];
  workingHours: WorkingHour[];
}

interface FieldFormProps {
  initial?: Partial<FieldData>;
  onSubmit: (data: FieldData) => void;
  loading?: boolean;
}

const DEFAULT: FieldData = {
  name: "",
  description: "",
  type: "5v5",
  city: "",
  neighborhood: "",
  address: "",
  pricePerHour: 100,
  slotDuration: 60,
  amenities: [],
  workingHours: [],
};

export default function FieldForm({ initial, onSubmit, loading }: FieldFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<FieldData>({ ...DEFAULT, ...initial });
  const [errors, setErrors] = useState<Partial<Record<keyof FieldData | "workingHours", string>>>({});

  function set(key: keyof FieldData, value: unknown) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function toggleAmenity(a: string) {
    set("amenities", form.amenities.includes(a)
      ? form.amenities.filter((x) => x !== a)
      : [...form.amenities, a]
    );
  }

  function toggleDay(day: number) {
    const exists = form.workingHours.find((h) => h.day === day);
    if (exists) {
      set("workingHours", form.workingHours.filter((h) => h.day !== day));
    } else {
      set("workingHours", [...form.workingHours, { day, open: "09:00", close: "22:00" }].sort((a, b) => a.day - b.day));
    }
  }

  function updateHours(day: number, field: "open" | "close", value: string) {
    set("workingHours", form.workingHours.map((h) => h.day === day ? { ...h, [field]: value } : h));
  }

  function validate(): boolean {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = "Field name is required";
    if (!form.city.trim()) e.city = "City is required";
    if (!form.pricePerHour || form.pricePerHour < 1) e.pricePerHour = "Price must be at least 1 MAD";
    if (form.workingHours.length === 0) e.workingHours = "Select at least one working day";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">

      {/* Basic info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Basic Info</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Field Name</Label>
              <Input id="name" value={form.name} onChange={(e) => set("name", e.target.value)} />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="type">Type</Label>
              <Select value={form.type} onValueChange={(v) => set("type", v)}>
                <SelectTrigger id="type"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="5v5">5v5</SelectItem>
                  <SelectItem value="6v6">6v6</SelectItem>
                  <SelectItem value="7v7">7v7</SelectItem>
                  <SelectItem value="11v11">11v11</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Description <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Textarea id="description" rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Location</CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="city">City</Label>
            <Input id="city" value={form.city} onChange={(e) => set("city", e.target.value)} />
            {errors.city && <p className="text-xs text-destructive">{errors.city}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="neighborhood">Neighborhood <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Input id="neighborhood" value={form.neighborhood} onChange={(e) => set("neighborhood", e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="address">Address <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Input id="address" value={form.address} onChange={(e) => set("address", e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Pricing & Slots</CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="price">Price per hour (MAD)</Label>
            <Input id="price" type="number" min={1} value={form.pricePerHour} onChange={(e) => set("pricePerHour", Number(e.target.value))} />
            {errors.pricePerHour && <p className="text-xs text-destructive">{errors.pricePerHour}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="slot">Slot duration</Label>
            <Select value={String(form.slotDuration)} onValueChange={(v) => set("slotDuration", Number(v))}>
              <SelectTrigger id="slot"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 min</SelectItem>
                <SelectItem value="60">60 min</SelectItem>
                <SelectItem value="90">90 min</SelectItem>
                <SelectItem value="120">120 min</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Amenities */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Amenities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {AMENITIES.map((a) => (
              <div key={a} className="flex items-center gap-2">
                <Checkbox id={`am-${a}`} checked={form.amenities.includes(a)} onCheckedChange={() => toggleAmenity(a)} />
                <Label htmlFor={`am-${a}`} className="capitalize cursor-pointer font-normal">{a}</Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Working hours */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Working Hours</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {errors.workingHours && <p className="text-xs text-destructive">{errors.workingHours}</p>}
          {DAYS.map((dayName, i) => {
            const hours = form.workingHours.find((h) => h.day === i);
            return (
              <div key={i} className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 w-32">
                  <Checkbox id={`day-${i}`} checked={!!hours} onCheckedChange={() => toggleDay(i)} />
                  <Label htmlFor={`day-${i}`} className="cursor-pointer font-normal">{dayName}</Label>
                </div>
                {hours && (
                  <>
                    <Input type="time" value={hours.open} onChange={(e) => updateHours(i, "open", e.target.value)} className="w-28" />
                    <span className="text-sm text-muted-foreground">to</span>
                    <Input type="time" value={hours.close} onChange={(e) => updateHours(i, "close", e.target.value)} className="w-28" />
                  </>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Separator />

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Field"}</Button>
        <Button type="button" variant="outline" onClick={() => router.push("/owner/fields")}>Cancel</Button>
      </div>
    </form>
  );
}
