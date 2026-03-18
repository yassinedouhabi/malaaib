"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SlotGrid from "@/components/SlotGrid";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

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
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">{field.name}</h1>
          <Badge variant="secondary">{field.type}</Badge>
        </div>
        <p className="text-muted-foreground">{field.neighborhood ? `${field.neighborhood}, ` : ""}{field.city}</p>
      </div>

      {field.description && <p className="text-sm">{field.description}</p>}

      <div className="flex gap-4 text-sm">
        <span className="font-medium">{field.pricePerHour} MAD / hr</span>
        <span className="text-muted-foreground">{field.slotDuration} min slots</span>
      </div>

      {field.amenities.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {field.amenities.map((a) => (
            <Badge key={a} variant="outline">{a}</Badge>
          ))}
        </div>
      )}

      <Separator />

      <div className="flex flex-col gap-3">
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
        <h3 className="font-medium">Available Slots</h3>
        {loadingSlots ? (
          <p className="text-sm text-muted-foreground">Loading slots...</p>
        ) : (
          <SlotGrid slots={slots} selected={selectedSlot} onSelect={setSelectedSlot} />
        )}
      </div>

      {selectedSlot && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Selected Slot</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-sm">{date} — {selectedSlot.startTime} to {selectedSlot.endTime}</span>
            <Button onClick={goToCheckout} size="sm">Book Now</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
