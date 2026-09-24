"use client"

import { useMapsLibrary } from "@vis.gl/react-google-maps"
import { LocateFixed, Search } from "lucide-react"
import { useEffect, useRef } from "react"

export interface SelectedPlace {
  placeId?: string
  placeName?: string
  address: string
  latitude: number
  longitude: number
}

interface LocationSearchProps {
  onSelect: (place: SelectedPlace) => void
}

export function LocationSearch({ onSelect }: LocationSearchProps) {

  const containerRef = useRef<HTMLDivElement>(null)
  const places = useMapsLibrary("places")


  useEffect(() => {
    if (!places || !containerRef.current)
      return

    const autocompleteElement = new places.PlaceAutocompleteElement({
      includedRegionCodes: ["ph"],
      placeholder: "Search address or place...",
    })

    autocompleteElement.noInputIcon = true
    autocompleteElement.className = "block h-11 w-full rounded-2xl border border-input bg-background pl-9 pr-3 text-sm shadow-xs outline-none transition-[color,box-shadow] "

    const handleSelect: EventListener = async (event) => {
      const selectEvent = event as google.maps.places.PlacePredictionSelectEvent
      const place = selectEvent.placePrediction.toPlace()

      await place.fetchFields({
        fields: ["id", "displayName", "formattedAddress", "location"],
      })

      if (!place.location) return

      onSelect({
        placeId: place.id,
        placeName: place.displayName ?? undefined,
        address: place.formattedAddress ?? place.displayName ?? "",
        latitude: place.location.lat(),
        longitude: place.location.lng(),
      })
    }

    autocompleteElement.addEventListener("gmp-select", handleSelect)
    containerRef.current.appendChild(autocompleteElement)

    return () => {
      autocompleteElement.removeEventListener("gmp-select", handleSelect)
      autocompleteElement.remove()
    }

  },[places,onSelect])


  return (
    <div className="space-y-1.5">
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        />

        <div ref={containerRef} />
      </div>

      <p className="text-xs text-muted-foreground px-1 leading-relaxed">
        Tap the{" "}
        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-secondary border border-border/80 shadow-2xs align-middle -mt-0.5 mx-0.5">
          <LocateFixed className="h-2.5 w-2.5 text-foreground" aria-hidden="true" />
        </span>{" "}
        button on the map to use your current location.
      </p>
    </div>
  )
}
