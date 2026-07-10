"use client"

import { Map, AdvancedMarker } from "@vis.gl/react-google-maps"


interface MapSelectorProps {
  latitude?: number
  longitude?: number
  onSelectLocation: (
    latitude:number,
    longitude:number
  ) => void
}

export function MapSelector({ latitude, longitude, onSelectLocation }: MapSelectorProps) {

  const hasSelectedLocation = typeof latitude === "number" && typeof longitude === "number"

  return (
    <div className="h-60 overflow-hidden rounded-2xl">

      <Map
        mapId="MAP_ID"
        zoom={15}
        gestureHandling="greedy"
        onClick={(event)=>{

          const latLng = event.detail.latLng

          if(!latLng) return

          onSelectLocation(
            latLng.lat,
            latLng.lng
          )

        }}
      >

        {hasSelectedLocation ? (
          <AdvancedMarker
            position={position}
          />
        ) : null}

      </Map>

    </div>
  )
}
