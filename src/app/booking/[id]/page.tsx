"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
    <div className="flex flex-col gap-8 max-w-md">

      {/* Success header */}
      <section className="bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/40 rounded-xl px-6 py-8 flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-green-800 dark:text-green-300">Booking Confirmed</h1>
        <p className="text-sm text-green-700/80 dark:text-green-400/80">
          A WhatsApp confirmation has been sent to {booking.clientPhone}.
        </p>
      </section>

      {/* Booking details */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{booking.fieldId.name}</CardTitle>
            <Badge className={booking.status === "confirmed"
              ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
              : "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
            }>
              {booking.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{booking.fieldId.city} — {booking.fieldId.type}</p>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Client</span>
            <span>{booking.clientName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Date</span>
            <span>{booking.date}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Time</span>
            <span>{booking.startTime} – {booking.endTime}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>{booking.totalPrice} MAD</span>
          </div>
        </CardContent>
      </Card>

      <Link
        href="/"
        className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 h-9 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors"
      >
        Back to Home
      </Link>

    </div>
  );
}
