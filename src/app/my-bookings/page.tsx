"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Bookings</h1>
        {bookings.length > 0 && (
          <Button variant="destructive" size="sm" onClick={() => setConfirmClearAll(true)}>
            Clear All
          </Button>
        )}
      </div>
      {bookings.length === 0 && (
        <p className="text-muted-foreground">No bookings yet. <Link href="/" className="underline">Find a field</Link>.</p>
      )}
      <div className="flex flex-col gap-4">
        {bookings.map((b) => {
          const canCancel = b.status === "confirmed" && b.date >= today;
          return (
            <Card key={b._id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{b.fieldId.name}</CardTitle>
                  <Badge variant={b.status === "confirmed" ? "default" : "destructive"}>{b.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{b.fieldId.city} — {b.fieldId.type}</p>
              </CardHeader>
              <CardContent className="text-sm flex items-center justify-between">
                <div>
                  <p>{b.date} — {b.startTime} to {b.endTime}</p>
                  <p className="text-muted-foreground">{b.totalPrice} MAD</p>
                </div>
                {canCancel && (
                  <Button variant="destructive" size="sm" onClick={() => setConfirmId(b._id)}>
                    Cancel
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={confirmClearAll} onOpenChange={(open) => { if (!open) setConfirmClearAll(false); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear all bookings</DialogTitle>
            <DialogDescription>
              This will permanently delete all your bookings from the database. This cannot be undone.
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
