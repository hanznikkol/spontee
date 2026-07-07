"use client"

import {
  Map,
  AdvancedMarker,
} from "@vis.gl/react-google-maps"


interface MapSelectorProps {
  latitude?: number
  longitude?: number
  onSelectLocation: (
    latitude:number,
    longitude:number
  ) => void
}


export function MapSelector({
  latitude,
  longitude,
  onSelectLocation,
}: MapSelectorProps) {

  const hasSelectedLocation =
    typeof latitude === "number" && typeof longitude === "number"

  const position = {
    lat: latitude ?? 14.5995,
    lng: longitude ?? 120.9842,
  }


  return (
    <div className="h-60 overflow-hidden rounded-2xl">

      <Map
        mapId="DEMO_MAP_ID"
        center={position}
        zoom={15}
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

        {hasSelectedLocation ? (
          <AdvancedMarker
            position={position}
          />
        ) : null}

      </Map>

    </div>
  )
}
