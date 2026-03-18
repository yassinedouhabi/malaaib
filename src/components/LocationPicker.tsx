"use client";

import { useEffect, useState } from "react";
import { APIProvider, Map, AdvancedMarker, MapMouseEvent, useMap } from "@vis.gl/react-google-maps";
import { Button } from "@/components/ui/button";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!;
const MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID!;
const DEFAULT_CENTER = { lat: 33.5731, lng: -7.5898 };

interface LocationPickerProps {
  value?: { lat: number; lng: number };
  onChange: (loc: { lat: number; lng: number } | null) => void;
}

function PickerInner({ value, onChange }: LocationPickerProps) {
  const map = useMap();
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (map && value) map.panTo(value);
  }, [map, value]);

  function handleMapClick(e: MapMouseEvent) {
    if (e.detail.latLng) onChange({ lat: e.detail.latLng.lat, lng: e.detail.latLng.lng });
  }

  function handleUseMyLocation() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => setLocating(false)
    );
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {value
            ? `${value.lat.toFixed(5)}, ${value.lng.toFixed(5)}`
            : "Click on the map to drop a pin"}
        </p>
        <div className="flex gap-2">
          {value && (
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>
              Clear
            </Button>
          )}
          <Button type="button" variant="outline" size="sm" onClick={handleUseMyLocation} disabled={locating}>
            {locating ? "Locating..." : "Use my location"}
          </Button>
        </div>
      </div>

      <div className="h-64 w-full rounded-lg overflow-hidden border">
        <Map
          defaultCenter={value ?? DEFAULT_CENTER}
          defaultZoom={value ? 15 : 12}
          mapId={MAP_ID}
          disableDefaultUI
          zoomControl
          clickableIcons={false}
          gestureHandling="greedy"
          onClick={handleMapClick}
          cursor="crosshair"
        >
          {value && (
            <AdvancedMarker
              position={value}
              draggable
              onDragEnd={(e) => {
                if (e.latLng) setPin({ lat: e.latLng.lat(), lng: e.latLng.lng() });
              }}
            >
              <div className="flex flex-col items-center">
                <div className="w-4 h-4 bg-black rounded-full border-2 border-white shadow-lg" />
                <div className="w-0.5 h-3 bg-black" />
              </div>
            </AdvancedMarker>
          )}
        </Map>
      </div>
    </>
  );
}

export default function LocationPicker(props: LocationPickerProps) {
  return (
    <APIProvider apiKey={API_KEY}>
      <div className="flex flex-col gap-2">
        <PickerInner {...props} />
      </div>
    </APIProvider>
  );
}
