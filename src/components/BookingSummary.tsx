import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Booking Summary</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Field</span>
          <span className="font-medium">{fieldName}</span>
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
        <Separator />
        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span>{totalPrice} MAD</span>
        </div>
      </CardContent>
    </Card>
  );
}
