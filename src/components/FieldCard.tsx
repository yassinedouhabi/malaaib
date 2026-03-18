"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FieldCardProps {
  field: {
    _id: string;
    name: string;
    city: string;
    neighborhood?: string;
    type: string;
    pricePerHour: number;
    amenities: string[];
    slotDuration: number;
    distance?: number;
  };
  date?: string;
}

export default function FieldCard({ field, date }: FieldCardProps) {
  const href = date ? `/fields/${field._id}?date=${date}` : `/fields/${field._id}`;
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{field.name}</CardTitle>
          <Badge variant="secondary">{field.type}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {field.neighborhood ? `${field.neighborhood}, ` : ""}{field.city}
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{field.pricePerHour} MAD / hr</span>
          <div className="flex items-center gap-2">
            {field.distance !== undefined && (
              <span className="text-xs text-muted-foreground">{field.distance < 1 ? `${Math.round(field.distance * 1000)}m` : `${field.distance.toFixed(1)}km`}</span>
            )}
            <span className="text-xs text-muted-foreground">{field.slotDuration} min slots</span>
          </div>
        </div>
        {field.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {field.amenities.map((a) => (
              <Badge key={a} variant="outline" className="text-xs">{a}</Badge>
            ))}
          </div>
        )}
        <Link href={href} className={cn(buttonVariants({ size: "sm" }), "w-full text-center")}>
          View & Book
        </Link>
      </CardContent>
    </Card>
  );
}
