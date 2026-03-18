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
  DialogDescription,
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
  fieldId: { name: string; city: string };
}

const PREVIOUS_LIMIT = 3;

function BookingCard({
  booking,
  onCancel,
}: {
  booking: Booking;
  onCancel?: (id: string) => void;
}) {
  return (
    <Card>
      <CardHeader className="pb-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">{booking.fieldId.name}</CardTitle>
          <Badge variant={booking.status === "confirmed" ? "default" : "destructive"}>
            {booking.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="text-sm flex items-center justify-between">
        <div>
          <p>{booking.clientName} — {booking.startTime} to {booking.endTime}</p>
          <p className="text-muted-foreground">{booking.date} · {booking.totalPrice} MAD</p>
        </div>
        {booking.status === "confirmed" && onCancel && (
          <Button variant="destructive" size="sm" onClick={() => onCancel(booking._id)}>
            Cancel
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default function OwnerDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllPrevious, setShowAllPrevious] = useState(false);
  const [showCancelled, setShowCancelled] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
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

  async function confirmCancel() {
    if (!confirmId) return;
    setCancelling(true);
    const res = await fetch(`/api/owner/bookings/${confirmId}/cancel`, { method: "PATCH" });
    if (res.ok) {
      setBookings((prev) => prev.map((b) => (b._id === confirmId ? { ...b, status: "cancelled" } : b)));
    }
    setCancelling(false);
    setConfirmId(null);
  }

  const visible = showCancelled ? bookings : bookings.filter((b) => b.status !== "cancelled");

  const previous = visible.filter((b) => b.date < today).sort((a, b) => b.date.localeCompare(a.date) || b.startTime.localeCompare(a.startTime));
  const todayBookings = visible.filter((b) => b.date === today);
  const upcoming = visible.filter((b) => b.date > today).sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));

  async function clearAll() {
    setClearingAll(true);
    const res = await fetch("/api/owner/bookings/cancel-all", { method: "PATCH" });
    if (res.ok) setBookings([]);
    setClearingAll(false);
    setConfirmClearAll(false);
  }

  const visiblePrevious = showAllPrevious ? previous : previous.slice(0, PREVIOUS_LIMIT);
  const targetBooking = bookings.find((b) => b._id === confirmId);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-3">
          {bookings.length > 0 && (
            <Button variant="destructive" size="sm" onClick={() => setConfirmClearAll(true)}>
              Clear All
            </Button>
          )}
          {bookings.some((b) => b.status === "cancelled") && (
            <div className="flex items-center gap-2">
              <Label htmlFor="show-cancelled" className="text-sm text-muted-foreground">Show cancelled</Label>
              <Switch id="show-cancelled" checked={showCancelled} onCheckedChange={setShowCancelled} />
            </div>
          )}
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Fields", value: stats.totalFields },
            { label: "Total Bookings", value: stats.totalBookings },
            { label: "Confirmed", value: stats.confirmedBookings },
            { label: "Revenue (MAD)", value: stats.revenue },
          ].map(({ label, value }) => (
            <Card key={label}>
              <CardContent className="pt-6">
                <p className="text-muted-foreground text-xs">{label}</p>
                <p className="text-2xl font-bold">{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Separator />

      {loading ? (
        <p className="text-muted-foreground text-sm">Loading bookings...</p>
      ) : (
        <div className="flex flex-col gap-8">

          {/* Today */}
          <section className="flex flex-col gap-3">
            <h2 className="font-semibold">Today</h2>
            {todayBookings.length === 0 ? (
              <p className="text-sm text-muted-foreground">No bookings today.</p>
            ) : (
              todayBookings.map((b) => (
                <BookingCard key={b._id} booking={b} onCancel={setConfirmId} />
              ))
            )}
          </section>

          <Separator />

          {/* Upcoming */}
          <section className="flex flex-col gap-3">
            <h2 className="font-semibold">Upcoming</h2>
            {upcoming.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming bookings.</p>
            ) : (
              upcoming.map((b) => (
                <BookingCard key={b._id} booking={b} onCancel={setConfirmId} />
              ))
            )}
          </section>

          <Separator />

          {/* Previous */}
          <section className="flex flex-col gap-3">
            <h2 className="font-semibold">Previous</h2>
            {previous.length === 0 ? (
              <p className="text-sm text-muted-foreground">No previous bookings.</p>
            ) : (
              <>
                {visiblePrevious.map((b) => (
                  <BookingCard key={b._id} booking={b} />
                ))}
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

      <Dialog open={confirmClearAll} onOpenChange={(open) => { if (!open) setConfirmClearAll(false); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear all bookings</DialogTitle>
            <DialogDescription>
              This will permanently delete all bookings from the database. This cannot be undone.
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
              Are you sure you want to cancel the booking for{" "}
              <span className="font-medium text-foreground">{targetBooking?.clientName}</span> on{" "}
              <span className="font-medium text-foreground">{targetBooking?.fieldId.name}</span> at{" "}
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
