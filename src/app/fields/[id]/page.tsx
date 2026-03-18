"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import SlotGrid from "@/components/SlotGrid";

interface Field {
  _id: string;
  name: string;
  city: string;
  neighborhood?: string;
  description?: string;
  type: string;
  pricePerHour: number;
  amenities: string[];
  slotDuration: number;
}

interface Slot {
  startTime: string;
  endTime: string;
  available?: boolean;
}

export default function FieldPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [field, setField] = useState<Field | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [date, setDate] = useState(searchParams.get("date") ?? new Date().toISOString().split("T")[0]);
  const [loadingField, setLoadingField] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    fetch(`/api/fields/${id}`)
      .then((r) => r.json())
      .then((d) => setField(d.field))
      .finally(() => setLoadingField(false));
  }, [id]);

  useEffect(() => {
    if (!date) return;
    setLoadingSlots(true);
    setSelectedSlot(null);
    fetch(`/api/fields/${id}/slots?date=${date}`)
      .then((r) => r.json())
      .then((d) => setSlots(d.slots ?? []))
      .finally(() => setLoadingSlots(false));
  }, [id, date]);

  function goToCheckout() {
    if (!selectedSlot || !field) return;
    const params = new URLSearchParams({
      fieldId: field._id,
      date,
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
    });
    router.push(`/checkout?${params.toString()}`);
  }

  if (loadingField) return <p className="text-muted-foreground">Loading...</p>;
  if (!field) return <p>Field not found.</p>;

  return (
    <div className="flex flex-col gap-8 max-w-2xl">

      {/* Field header */}
      <section className="bg-muted rounded-xl px-6 py-8 flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight">{field.name}</h1>
            <Badge variant="secondary">{field.type}</Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            {field.neighborhood ? `${field.neighborhood}, ` : ""}{field.city}
          </p>
        </div>

        {field.description && (
          <p className="text-sm text-muted-foreground">{field.description}</p>
        )}

        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">{field.pricePerHour}</span>
          <span className="text-sm text-muted-foreground">MAD / hr · {field.slotDuration} min slots</span>
        </div>

        {field.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {field.amenities.map((a) => (
              <Badge key={a} variant="outline">{a}</Badge>
            ))}
          </div>
        )}
      </section>

      {/* Slot picker */}
      <Card>
        <CardContent className="pt-6 flex flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="date">Select Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="w-48"
            />
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="font-semibold">Available Slots</h3>
            {loadingSlots ? (
              <p className="text-sm text-muted-foreground">Loading slots...</p>
            ) : (
              <SlotGrid slots={slots} selected={selectedSlot} onSelect={setSelectedSlot} />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Selected slot CTA */}
      {selectedSlot && (
        <Card className="bg-muted border-0">
          <CardContent className="pt-6 flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold">{date}</p>
              <p className="text-sm text-muted-foreground">{selectedSlot.startTime} – {selectedSlot.endTime}</p>
            </div>
            <Button onClick={goToCheckout}>Book Now</Button>
          </CardContent>
        </Card>
      )}

    </div>
  );
}
