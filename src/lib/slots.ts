export interface Slot {
  startTime: string;
  endTime: string;
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function generateSlots(
  open: string,
  close: string,
  slotDuration: number
): Slot[] {
  const slots: Slot[] = [];
  let start = timeToMinutes(open);
  // Handle midnight close (00:00 = 1440 minutes)
  let end = timeToMinutes(close);
  if (end === 0) end = 1440;
  // If close is before open (crosses midnight), treat as next day
  if (end <= start) end += 1440;

  while (start + slotDuration <= end) {
    slots.push({
      startTime: minutesToTime(start),
      endTime: minutesToTime(start + slotDuration),
    });
    start += slotDuration;
  }
  return slots;
}

export function filterAvailableSlots(
  slots: Slot[],
  bookedStartTimes: string[]
): Slot[] {
  const bookedSet = new Set(bookedStartTimes);
  return slots.filter((s) => !bookedSet.has(s.startTime));
}
