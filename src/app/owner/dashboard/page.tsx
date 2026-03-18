"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Stats {
  totalFields: number;
  totalBookings: number;
  confirmedBookings: number;
  revenue: number;
}

interface Booking {
  _id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  totalPrice: number;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  fieldId: { name: string; city: string; type: string };
}

const PREVIOUS_LIMIT = 3;

function statusBadgeClass(status: string) {
  return status === "confirmed"
    ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
    : "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800";
}

function BookingCard({
  booking,
  onClick,
}: {
  booking: Booking;
  onClick: (b: Booking) => void;
}) {
  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onClick(booking)}
    >
      <CardHeader className="pb-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">{booking.fieldId.name}</CardTitle>
          <Badge className={statusBadgeClass(booking.status)}>
            {booking.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="text-sm">
        <p>{booking.clientName} · {booking.startTime} – {booking.endTime}</p>
        <p className="text-muted-foreground">{booking.date} · {booking.totalPrice} MAD</p>
      </CardContent>
    </Card>
  );
}

function BookingDetailsDialog({
  booking,
  onClose,
  onCancel,
  cancelling,
}: {
  booking: Booking | null;
  onClose: () => void;
  onCancel: (id: string) => void;
  cancelling: boolean;
}) {
  return (
    <Dialog open={!!booking} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {booking?.fieldId.name}
            <Badge variant="secondary">{booking?.fieldId.type}</Badge>
          </DialogTitle>
          <p className="text-sm text-muted-foreground">{booking?.fieldId.city}</p>
        </DialogHeader>

        {booking && (
          <div className="flex flex-col gap-4">
            {/* Status */}
            <Badge className={`${statusBadgeClass(booking.status)} w-fit`}>
              {booking.status}
            </Badge>

            <Separator />

            {/* Slot details */}
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">{booking.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time</span>
                <span className="font-medium">{booking.startTime} – {booking.endTime}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{booking.totalPrice} MAD</span>
              </div>
            </div>

            <Separator />

            {/* Client details */}
            <div className="flex flex-col gap-2 text-sm">
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Client</p>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name</span>
                <span>{booking.clientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phone</span>
                <a href={`tel:${booking.clientPhone}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                  {booking.clientPhone}
                </a>
              </div>
              {booking.clientEmail && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <a href={`mailto:${booking.clientEmail}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                    {booking.clientEmail}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
          {booking?.status === "confirmed" && (
            <Button
              variant="destructive"
              onClick={() => onCancel(booking._id)}
              disabled={cancelling}
            >
              {cancelling ? "Cancelling..." : "Cancel Booking"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function OwnerDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllPrevious, setShowAllPrevious] = useState(false);
  const [showCancelled, setShowCancelled] = useState(false);
  const [detailBooking, setDetailBooking] = useState<Booking | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [clearingAll, setClearingAll] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetch("/api/owner/stats").then((r) => r.json()).then((d) => setStats(d));
    fetch("/api/owner/bookings")
      .then((r) => r.json())
      .then((d) => setBookings(d.bookings ?? []))
      .finally(() => setLoading(false));
  }, []);

  async function handleCancel(id: string) {
    setCancelling(true);
    const res = await fetch(`/api/owner/bookings/${id}/cancel`, { method: "PATCH" });
    if (res.ok) {
      setBookings((prev) => prev.map((b) => b._id === id ? { ...b, status: "cancelled" } : b));
      setDetailBooking((prev) => prev && prev._id === id ? { ...prev, status: "cancelled" } : prev);
    }
    setCancelling(false);
  }

  async function clearAll() {
    setClearingAll(true);
    const res = await fetch("/api/owner/bookings/cancel-all", { method: "PATCH" });
    if (res.ok) setBookings([]);
    setClearingAll(false);
    setConfirmClearAll(false);
  }

  const visible = showCancelled ? bookings : bookings.filter((b) => b.status !== "cancelled");
  const previous = visible.filter((b) => b.date < today).sort((a, b) => b.date.localeCompare(a.date) || b.startTime.localeCompare(a.startTime));
  const todayBookings = visible.filter((b) => b.date === today);
  const upcoming = visible.filter((b) => b.date > today).sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));
  const visiblePrevious = showAllPrevious ? previous : previous.slice(0, PREVIOUS_LIMIT);

  return (
    <div className="flex flex-col gap-8">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Overview of your fields and bookings</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {bookings.some((b) => b.status === "cancelled") && (
            <div className="flex items-center gap-2">
              <Label htmlFor="show-cancelled" className="text-sm text-muted-foreground">Show cancelled</Label>
              <Switch id="show-cancelled" checked={showCancelled} onCheckedChange={setShowCancelled} />
            </div>
          )}
          {bookings.length > 0 && (
            <Button variant="destructive" size="sm" onClick={() => setConfirmClearAll(true)}>
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Fields", value: stats.totalFields },
            { label: "Total Bookings", value: stats.totalBookings },
            { label: "Confirmed", value: stats.confirmedBookings },
            { label: "Revenue (MAD)", value: stats.revenue },
          ].map(({ label, value }) => (
            <Card key={label} className="bg-muted border-0">
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
                <p className="text-3xl font-bold mt-1">{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Separator />

      {/* Bookings */}
      {loading ? (
        <p className="text-muted-foreground text-sm">Loading bookings...</p>
      ) : (
        <div className="flex flex-col gap-10">

          <section className="flex flex-col gap-3">
            <h2 className="font-semibold">Today</h2>
            {todayBookings.length === 0 ? (
              <p className="text-sm text-muted-foreground">No bookings today.</p>
            ) : (
              todayBookings.map((b) => <BookingCard key={b._id} booking={b} onClick={setDetailBooking} />)
            )}
          </section>

          <Separator />

          <section className="flex flex-col gap-3">
            <h2 className="font-semibold">Upcoming</h2>
            {upcoming.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming bookings.</p>
            ) : (
              upcoming.map((b) => <BookingCard key={b._id} booking={b} onClick={setDetailBooking} />)
            )}
          </section>

          <Separator />

          <section className="flex flex-col gap-3">
            <h2 className="font-semibold">Previous</h2>
            {previous.length === 0 ? (
              <p className="text-sm text-muted-foreground">No previous bookings.</p>
            ) : (
              <>
                {visiblePrevious.map((b) => <BookingCard key={b._id} booking={b} onClick={setDetailBooking} />)}
                {previous.length > PREVIOUS_LIMIT && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="self-start"
                    onClick={() => setShowAllPrevious((s) => !s)}
                  >
                    {showAllPrevious ? "Show less" : `See all ${previous.length} previous bookings`}
                  </Button>
                )}
              </>
            )}
          </section>

        </div>
      )}

      {/* Booking details dialog */}
      <BookingDetailsDialog
        booking={detailBooking}
        onClose={() => setDetailBooking(null)}
        onCancel={handleCancel}
        cancelling={cancelling}
      />

      {/* Clear all dialog */}
      <Dialog open={confirmClearAll} onOpenChange={(open) => { if (!open) setConfirmClearAll(false); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear all bookings</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will permanently delete all bookings. This cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmClearAll(false)}>Cancel</Button>
            <Button variant="destructive" onClick={clearAll} disabled={clearingAll}>
              {clearingAll ? "Clearing..." : "Clear All"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
