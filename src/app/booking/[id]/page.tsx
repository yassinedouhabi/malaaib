"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface Booking {
  _id: string;
  date: string;
  startTime: string;
  endTime: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  status: string;
  totalPrice: number;
  fieldId: { name: string; city: string; type: string };
}

export default function BookingConfirmationPage() {
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/bookings/${id}`)
      .then((r) => r.json())
      .then((d) => setBooking(d.booking))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-muted-foreground">Loading...</p>;
  if (!booking) return <p>Booking not found.</p>;

  return (
    <div className="flex flex-col gap-6 max-w-md">
      <div>
        <h1 className="text-2xl font-bold">Booking Confirmed</h1>
        <p className="text-muted-foreground text-sm">A WhatsApp confirmation has been sent to {booking.clientPhone}.</p>
      </div>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{booking.fieldId.name}</CardTitle>
            <Badge variant={booking.status === "confirmed" ? "default" : "destructive"}>{booking.status}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{booking.fieldId.city} — {booking.fieldId.type}</p>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Date</span>
            <span>{booking.date}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Time</span>
            <span>{booking.startTime} – {booking.endTime}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Client</span>
            <span>{booking.clientName}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>{booking.totalPrice} MAD</span>
          </div>
        </CardContent>
      </Card>
      <Link href="/" className={buttonVariants({ variant: "outline" })}>Back to Home</Link>
    </div>
  );
}
