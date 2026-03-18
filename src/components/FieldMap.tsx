"use client";

import { useState } from "react";
import Link from "next/link";
import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";

interface Field {
  _id: string;
  name: string;
  city: string;
  neighborhood?: string;
  type: string;
  pricePerHour: number;
  distance?: number;
  location?: { lat: number; lng: number };
}

interface FieldMapProps {
  fields: Field[];
  userLocation?: { lat: number; lng: number };
  date?: string;
}

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!;
const MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID!;
const DEFAULT_CENTER = { lat: 33.5731, lng: -7.5898 }; // Casablanca

export default function FieldMap({ fields, userLocation, date }: FieldMapProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fieldsWithLocation = fields.filter((f) => f.location?.lat && f.location?.lng);
  const selectedField = fieldsWithLocation.find((f) => f._id === selectedId) ?? null;

  const center =
    userLocation ??
    (fieldsWithLocation[0]?.location
      ? { lat: fieldsWithLocation[0].location.lat, lng: fieldsWithLocation[0].location.lng }
      : DEFAULT_CENTER);

  return (
    <APIProvider apiKey={API_KEY}>
      <div className="relative h-[520px] w-full rounded-xl overflow-hidden border border-border">

        <Map
          defaultCenter={center}
          defaultZoom={userLocation ? 13 : 12}
          mapId={MAP_ID}
          disableDefaultUI
          zoomControl
          clickableIcons={false}
          gestureHandling="greedy"
          onClick={() => setSelectedId(null)}
        >
          {/* User location — pulsing blue dot */}
          {userLocation && (
            <AdvancedMarker position={userLocation} zIndex={10}>
              <div className="relative flex items-center justify-center">
                <div className="absolute w-10 h-10 bg-blue-400/30 rounded-full animate-ping" />
                <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-md z-10" />
              </div>
            </AdvancedMarker>
          )}

          {/* Field markers */}
          {fieldsWithLocation.map((f) => {
            const isSelected = selectedId === f._id;
            return (
              <AdvancedMarker
                key={f._id}
                position={{ lat: f.location!.lat, lng: f.location!.lng }}
                onClick={(e) => { e.stop(); setSelectedId(f._id); }}
                zIndex={isSelected ? 5 : 1}
              >
                <div
                  className={`
                    flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold
                    shadow-md cursor-pointer select-none
                    transition-all duration-150
                    ${isSelected
                      ? "bg-black text-white scale-110 shadow-lg"
                      : "bg-white text-black border border-black/10 hover:scale-105"
                    }
                  `}
                >
                  {f.pricePerHour} <span className="font-normal opacity-70">MAD</span>
                </div>
              </AdvancedMarker>
            );
          })}
        </Map>

        {/* Floating bottom card — InDrive style */}
        {selectedField && (
          <div className="absolute bottom-4 left-4 right-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-4 flex items-center justify-between gap-4 border border-black/5 dark:border-white/10 animate-in slide-in-from-bottom-2 duration-200">
            <div className="flex flex-col gap-0.5 min-w-0">
              <p className="font-semibold text-sm truncate">{selectedField.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {selectedField.neighborhood ? `${selectedField.neighborhood}, ` : ""}{selectedField.city}
              </p>
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground text-sm">{selectedField.pricePerHour} MAD/hr</span>
                <span className="bg-muted text-foreground px-1.5 py-0.5 rounded text-[10px] font-medium">{selectedField.type}</span>
                {selectedField.distance !== undefined && (
                  <span>
                    {selectedField.distance < 1
                      ? `${Math.round(selectedField.distance * 1000)} m away`
                      : `${selectedField.distance.toFixed(1)} km away`}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setSelectedId(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-muted/80 text-sm"
              >
                ✕
              </button>
              <Link
                href={date ? `/fields/${selectedField._id}?date=${date}` : `/fields/${selectedField._id}`}
                className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-xs font-semibold rounded-full hover:opacity-90 transition-opacity"
              >
                Book
              </Link>
            </div>
          </div>
        )}

        {/* No location fields message */}
        {fieldsWithLocation.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
            <p className="text-sm text-muted-foreground bg-background px-4 py-2 rounded-lg shadow">
              No fields with location data in this area.
            </p>
          </div>
        )}
      </div>
    </APIProvider>
  );
}
