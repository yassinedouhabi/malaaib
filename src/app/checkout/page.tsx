"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import BookingForm from "@/components/BookingForm";
import BookingSummary from "@/components/BookingSummary";

interface Field {
  _id: string;
  name: string;
  city: string;
  pricePerHour: number;
  slotDuration: number;
}

interface Profile {
  name: string;
  phone: string;
  email: string;
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const fieldId = searchParams.get("fieldId") ?? "";
  const date = searchParams.get("date") ?? "";
  const startTime = searchParams.get("startTime") ?? "";
  const endTime = searchParams.get("endTime") ?? "";

  const [field, setField] = useState<Field | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (fieldId) {
      fetch(`/api/fields/${fieldId}`).then((r) => r.json()).then((d) => setField(d.field));
    }
    // Try to pre-fill from logged-in user profile (cookie sent automatically)
    fetch("/api/user/profile")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d?.user) setProfile(d.user); });
  }, [fieldId]);

  async function handleSubmit(data: { clientName: string; clientPhone: string; clientEmail: string }) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fieldId, date, startTime, endTime, ...data }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Failed to book"); return; }
      router.push(`/booking/${json.booking._id}`);
    } finally {
      setLoading(false);
    }
  }

  if (!fieldId || !date || !startTime || !endTime) {
    return <p>Invalid checkout state. Please go back and select a slot.</p>;
  }

  return (
    <div className="flex flex-col gap-6 max-w-lg">
      <h1 className="text-2xl font-bold">Checkout</h1>
      {field && (
        <BookingSummary
          fieldName={field.name}
          city={field.city}
          date={date}
          startTime={startTime}
          endTime={endTime}
          pricePerHour={field.pricePerHour}
          slotDuration={field.slotDuration}
        />
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
      <BookingForm
        defaultName={profile?.name}
        defaultPhone={profile?.phone}
        defaultEmail={profile?.email}
        onSubmit={handleSubmit}
        loading={loading}
      />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense>
      <CheckoutContent />
    </Suspense>
  );
}
