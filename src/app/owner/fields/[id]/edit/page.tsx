"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import FieldForm from "@/components/FieldForm";

interface FieldData {
  name: string;
  description: string;
  type: string;
  city: string;
  neighborhood: string;
  address: string;
  location?: { lat: number; lng: number };
  pricePerHour: number;
  slotDuration: number;
  amenities: string[];
  workingHours: { day: number; open: string; close: string }[];
}

export default function EditFieldPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [initial, setInitial] = useState<FieldData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/fields/${id}`)
      .then((r) => r.json())
      .then((d) => setInitial(d.field));
  }, [id]);

  async function handleSubmit(data: object) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/owner/fields/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Failed to update field"); return; }
      router.push("/owner/fields");
    } finally {
      setLoading(false);
    }
  }

  if (!initial) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Edit Field</h1>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <FieldForm initial={initial} onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}
