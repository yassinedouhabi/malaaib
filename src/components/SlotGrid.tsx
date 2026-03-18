"use client";

import { Button } from "@/components/ui/button";

interface Slot {
  startTime: string;
  endTime: string;
  available?: boolean;
}

interface SlotGridProps {
  slots: Slot[];
  selected: Slot | null;
  onSelect: (slot: Slot) => void;
}

export default function SlotGrid({ slots, selected, onSelect }: SlotGridProps) {
  if (slots.length === 0) {
    return <p className="text-sm text-muted-foreground">No available slots for this date.</p>;
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
      {slots.map((slot) => {
        const isSelected = selected?.startTime === slot.startTime;
        const available = slot.available !== false;
        return (
          <Button
            key={slot.startTime}
            variant={isSelected ? "default" : "outline"}
            size="sm"
            onClick={() => available && onSelect(slot)}
            disabled={!available}
            className="flex flex-col h-auto py-2"
          >
            <span className="text-xs font-medium">{slot.startTime}</span>
            <span className="text-xs text-muted-foreground">{slot.endTime}</span>
          </Button>
        );
      })}
    </div>
  );
}
