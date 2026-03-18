"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Booking {
  _id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  totalPrice: number;
  fieldId: { name: string; city: string; type: string };
}

function BookingCard({
  booking,
  canCancel,
  onCancel,
}: {
  booking: Booking;
  canCancel: boolean;
  onCancel: (id: string) => void;
}) {
  return (
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
      <CardContent className="text-sm flex items-center justify-between">
        <div>
          <p>{booking.date} · {booking.startTime} – {booking.endTime}</p>
          <p className="text-muted-foreground">{booking.totalPrice} MAD</p>
        </div>
        {canCancel && (
          <Button variant="destructive" size="sm" onClick={() => onCancel(booking._id)}>
            Cancel
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [clearingAll, setClearingAll] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetch("/api/user/bookings")
      .then((r) => r.json())
      .then((d) => setBookings(d.bookings ?? []))
      .finally(() => setLoading(false));
  }, []);

  async function confirmCancel() {
    if (!confirmId) return;
    setCancelling(true);
    const res = await fetch(`/api/user/bookings/${confirmId}/cancel`, { method: "PATCH" });
    if (res.ok) {
      setBookings((prev) => prev.map((b) => b._id === confirmId ? { ...b, status: "cancelled" } : b));
    }
    setCancelling(false);
    setConfirmId(null);
  }

  async function clearAll() {
    setClearingAll(true);
    const res = await fetch("/api/user/bookings/cancel-all", { method: "PATCH" });
    if (res.ok) setBookings([]);
    setClearingAll(false);
    setConfirmClearAll(false);
  }

  const targetBooking = bookings.find((b) => b._id === confirmId);
  const upcoming = bookings.filter((b) => b.date >= today && b.status === "confirmed").sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));
  const past = bookings.filter((b) => b.date < today || b.status !== "confirmed").sort((a, b) => b.date.localeCompare(a.date) || b.startTime.localeCompare(a.startTime));

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div className="flex flex-col gap-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Bookings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {bookings.length === 0 ? "No bookings yet" : `${bookings.length} booking${bookings.length !== 1 ? "s" : ""} total`}
          </p>
        </div>
        {bookings.length > 0 && (
          <Button variant="destructive" size="sm" onClick={() => setConfirmClearAll(true)}>
            Clear All
          </Button>
        )}
      </div>

      {bookings.length === 0 && (
        <Card className="bg-muted border-0">
          <CardContent className="pt-6 flex flex-col gap-2">
            <p className="font-medium">No bookings yet</p>
            <p className="text-sm text-muted-foreground">
              <Link href="/" className="underline underline-offset-4">Find a field</Link> and book your first slot.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="font-semibold text-base">Upcoming</h2>
          {upcoming.map((b) => (
            <BookingCard
              key={b._id}
              booking={b}
              canCancel={true}
              onCancel={setConfirmId}
            />
          ))}
        </section>
      )}

      {upcoming.length > 0 && past.length > 0 && <Separator />}

      {/* Past & cancelled */}
      {past.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="font-semibold text-base">Past & Cancelled</h2>
          {past.map((b) => (
            <BookingCard key={b._id} booking={b} canCancel={false} onCancel={setConfirmId} />
          ))}
        </section>
      )}

      <Dialog open={confirmClearAll} onOpenChange={(open) => { if (!open) setConfirmClearAll(false); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear all bookings</DialogTitle>
            <DialogDescription>
              This will permanently delete all your bookings. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmClearAll(false)}>Cancel</Button>
            <Button variant="destructive" onClick={clearAll} disabled={clearingAll}>
              {clearingAll ? "Clearing..." : "Clear All"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!confirmId} onOpenChange={(open) => { if (!open) setConfirmId(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your booking at{" "}
              <span className="font-medium text-foreground">{targetBooking?.fieldId.name}</span> on{" "}
              <span className="font-medium text-foreground">{targetBooking?.date}</span> at{" "}
              <span className="font-medium text-foreground">{targetBooking?.startTime} – {targetBooking?.endTime}</span>?
              This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmId(null)}>Keep</Button>
            <Button variant="destructive" onClick={confirmCancel} disabled={cancelling}>
              {cancelling ? "Cancelling..." : "Cancel Booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
