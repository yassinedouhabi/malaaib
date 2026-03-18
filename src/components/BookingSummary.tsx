import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface BookingSummaryProps {
  fieldName: string;
  city: string;
  date: string;
  startTime: string;
  endTime: string;
  pricePerHour: number;
  slotDuration: number;
}

export default function BookingSummary({
  fieldName, city, date, startTime, endTime, pricePerHour, slotDuration,
}: BookingSummaryProps) {
  const totalPrice = Math.round((slotDuration / 60) * pricePerHour);

  return (
    <Card className="bg-muted border-0">
      <CardContent className="pt-6 flex flex-col gap-3 text-sm">
        <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Booking Summary</p>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Field</span>
            <span className="font-medium text-right">{fieldName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">City</span>
            <span>{city}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Date</span>
            <span>{date}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Time</span>
            <span>{startTime} – {endTime}</span>
          </div>
        </div>
        <Separator />
        <div className="flex justify-between font-semibold text-base">
          <span>Total</span>
          <span>{totalPrice} MAD</span>
        </div>
      </CardContent>
    </Card>
  );
}
