"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FieldForm from "@/components/FieldForm";

export default function NewFieldPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(data: object) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/owner/fields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Failed to create field"); return; }
      router.push("/owner/fields");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Add New Field</h1>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <FieldForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}
