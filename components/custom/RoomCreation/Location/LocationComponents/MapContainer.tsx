"use client"

import { Button } from "@/components/ui/button"
import { AdvancedMarker, Circle, Map, useMap } from "@vis.gl/react-google-maps"
import { Loader2, LocateFixed } from "lucide-react"
import { useEffect, useMemo } from "react"

const DEFAULT_CENTER = { lat: 14.5995, lng: 120.9842 }
const SELECTED_LOCATION_ZOOM = 15

interface MapSelectorProps {
  latitude?: number
  longitude?: number
  radius: number
  onSelectLocation: (
    latitude:number,
    longitude:number
  ) => void
  onUseCurrentLocation: () => void
  isLocating: boolean
}

function MapCameraSync({ position }: { position?: google.maps.LatLngLiteral }) {
  const map = useMap()

  useEffect(() => {
    if (!map || !position) return

    map.panTo(position)
    if ((map.getZoom() ?? 0) < SELECTED_LOCATION_ZOOM) {
      map.setZoom(SELECTED_LOCATION_ZOOM)
    }
  }, [map, position])

  return null
}

export function MapSelector({ latitude, longitude, radius, onSelectLocation, onUseCurrentLocation, isLocating }: MapSelectorProps) {
  const hasSelectedLocation = typeof latitude === "number" && typeof longitude === "number"
  const position = useMemo(
    () => hasSelectedLocation ? { lat: latitude, lng: longitude } : undefined,
    [hasSelectedLocation, latitude, longitude]
  )

  return (
    <div className="relative h-60 overflow-hidden rounded-2xl">
      <Map
        mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID ?? "DEMO_MAP_ID"}
        defaultZoom={12}
        defaultCenter={DEFAULT_CENTER}
        gestureHandling="greedy"
        disableDefaultUI
        onClick={(event)=>{
          const latLng = event.detail.latLng
          if(!latLng) return
          onSelectLocation(
            latLng.lat,
            latLng.lng
          )
        }}
      >
        <MapCameraSync position={position} />

        {hasSelectedLocation ? (
          <>
            <Circle
              center={position}
              radius={radius}
              fillColor="#2563eb"
              fillOpacity={0.12}
              strokeColor="#2563eb"
              strokeOpacity={0.45}
              strokeWeight={2}
            />
            <AdvancedMarker
              position={position}
            />
          </>
        ) : null}

      </Map>

      {/* Loading Overlay */}
      {isLocating && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/30 backdrop-blur-xs">
          <div className="flex flex-col items-center gap-2 rounded-xl bg-background/90 px-4 py-3 shadow-lg">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
            <p className="text-sm font-medium">
              Getting your location...
            </p>
          </div>
        </div>
      )}

      <Button
        type="button"
        size="icon"
        variant="secondary"
        className="absolute right-3 top-3 h-9 w-9 rounded-full shadow-md"
        onClick={onUseCurrentLocation}
        aria-label="Use current location"
      >
        <LocateFixed className="h-4 w-4" aria-hidden="true" />
      </Button>

    </div>
  )
}
