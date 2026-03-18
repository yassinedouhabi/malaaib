"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Field {
  _id: string;
  name: string;
  city: string;
  type: string;
  pricePerHour: number;
  isActive: boolean;
}

export default function OwnerFieldsPage() {
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDeactivateId, setConfirmDeactivateId] = useState<string | null>(null);
  const [confirmReactivateId, setConfirmReactivateId] = useState<string | null>(null);
  const [deactivating, setDeactivating] = useState(false);
  const [reactivating, setReactivating] = useState(false);

  useEffect(() => {
    fetch("/api/owner/fields")
      .then((r) => r.json())
      .then((d) => setFields(d.fields ?? []))
      .finally(() => setLoading(false));
  }, []);

  async function confirmDeactivate() {
    if (!confirmDeactivateId) return;
    setDeactivating(true);
    const res = await fetch(`/api/owner/fields/${confirmDeactivateId}`, { method: "DELETE" });
    if (res.ok) {
      setFields((prev) => prev.map((f) => (f._id === confirmDeactivateId ? { ...f, isActive: false } : f)));
    }
    setDeactivating(false);
    setConfirmDeactivateId(null);
  }

  async function confirmReactivate() {
    if (!confirmReactivateId) return;
    setReactivating(true);
    const res = await fetch(`/api/owner/fields/${confirmReactivateId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: true }),
    });
    if (res.ok) {
      setFields((prev) => prev.map((f) => (f._id === confirmReactivateId ? { ...f, isActive: true } : f)));
    }
    setReactivating(false);
    setConfirmReactivateId(null);
  }

  const targetDeactivate = fields.find((f) => f._id === confirmDeactivateId);
  const targetReactivate = fields.find((f) => f._id === confirmReactivateId);

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div className="flex flex-col gap-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Fields</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {fields.length === 0 ? "No fields yet" : `${fields.length} field${fields.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Link href="/owner/fields/new" className={buttonVariants({ size: "sm" })}>
          Add Field
        </Link>
      </div>

      {fields.length === 0 ? (
        <Card className="bg-muted border-0">
          <CardContent className="pt-6 flex flex-col gap-2">
            <p className="font-medium">No fields yet</p>
            <p className="text-sm text-muted-foreground">
              <Link href="/owner/fields/new" className="underline underline-offset-4">Add your first field</Link> to start accepting bookings.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {fields.map((f) => (
            <Card key={f._id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{f.name}</CardTitle>
                  <div className="flex gap-1">
                    <Badge variant="secondary">{f.type}</Badge>
                    {f.isActive
                      ? <Badge className="bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">Active</Badge>
                      : <Badge className="bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">Inactive</Badge>
                    }
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{f.city} · {f.pricePerHour} MAD/hr</p>
              </CardHeader>
              <CardContent className="flex gap-2">
                <Link href={`/owner/fields/${f._id}/edit`} className={buttonVariants({ variant: "outline", size: "sm" })}>
                  Edit
                </Link>
                {f.isActive ? (
                  <Button variant="destructive" size="sm" onClick={() => setConfirmDeactivateId(f._id)}>
                    Deactivate
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => setConfirmReactivateId(f._id)}>
                    Reactivate
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!confirmDeactivateId} onOpenChange={(open) => { if (!open) setConfirmDeactivateId(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate field</DialogTitle>
            <DialogDescription>
              Are you sure you want to deactivate <span className="font-medium text-foreground">{targetDeactivate?.name}</span>? It will no longer appear in search results. You can reactivate it later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDeactivateId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDeactivate} disabled={deactivating}>
              {deactivating ? "Deactivating..." : "Deactivate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!confirmReactivateId} onOpenChange={(open) => { if (!open) setConfirmReactivateId(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reactivate field</DialogTitle>
            <DialogDescription>
              Are you sure you want to reactivate <span className="font-medium text-foreground">{targetReactivate?.name}</span>? It will appear again in search results.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmReactivateId(null)}>Cancel</Button>
            <Button onClick={confirmReactivate} disabled={reactivating}>
              {reactivating ? "Reactivating..." : "Reactivate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
