"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface BookingFormProps {
  defaultName?: string;
  defaultPhone?: string;
  defaultEmail?: string;
  onSubmit: (data: { clientName: string; clientPhone: string; clientEmail: string }) => void;
  loading?: boolean;
}

export default function BookingForm({ defaultName = "", defaultPhone = "", defaultEmail = "", onSubmit, loading }: BookingFormProps) {
  const [clientName, setClientName] = useState(defaultName);
  const [clientPhone, setClientPhone] = useState(defaultPhone);
  const [clientEmail, setClientEmail] = useState(defaultEmail);
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!clientName || !clientPhone) {
      setError("Name and phone are required.");
      return;
    }
    setError("");
    onSubmit({ clientName, clientPhone, clientEmail });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="clientName">Name</Label>
        <Input id="clientName" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Your name" required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="clientPhone">Phone (WhatsApp)</Label>
        <Input id="clientPhone" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder="+212..." required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="clientEmail">Email (optional)</Label>
        <Input id="clientEmail" type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="you@email.com" />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={loading}>{loading ? "Booking..." : "Confirm Booking"}</Button>
    </form>
  );
}
