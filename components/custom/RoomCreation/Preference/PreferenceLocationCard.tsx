"use client"

import { useCallback } from "react"
import { LocateFixed } from "lucide-react"
import { useMapsLibrary } from "@vis.gl/react-google-maps"

import { Button } from "@/components/ui/button"
import { RadiusSelector } from "./Location/LocationRadius"
import { MapSelector } from "./Location/LocationMap"
import { LocationSearch, SelectedPlace } from "./Location/LocationSearch"
import { SelectedAddress } from "./Location/LocationAddress"
import { useCreateRoomStore } from "@/lib/room/create/stores/create-room-store"

export function PreferenceLocationCard() {
  const geocoding = useMapsLibrary("geocoding")
  const locationStatus = useCreateRoomStore((state) => state.locationStatus )
  const address = useCreateRoomStore((state) => state.address )
  const latitude = useCreateRoomStore((state) => state.latitude )
  const longitude = useCreateRoomStore( (state) => state.longitude)
  const radius = useCreateRoomStore((state) => state.radius)
  const setLocation = useCreateRoomStore( (state) => state.setLocation)
  const setRadius = useCreateRoomStore( (state) => state.setRadius)
  const setCoordinates = useCreateRoomStore((state) => state.setCoordinates)

  const reverseGeocode = useCallback(
    async (latitude: number, longitude: number) => {
      const fallbackAddress = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`

      if (!geocoding) {
        return {
          address: fallbackAddress,
          placeId: undefined,
        }
      }

      const geocoder = new geocoding.Geocoder()

      try {
        const response = await geocoder.geocode({
          location: { lat: latitude, lng: longitude },
        })
        const result = response.results[0]

        return {
          address: result?.formatted_address ?? fallbackAddress,
          placeId: result?.place_id,
        }
      } catch (error) {
        console.error(error)
        return {
          address: fallbackAddress,
          placeId: undefined,
        }
      }
    },
    [geocoding]
  )

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.")
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        const resolvedLocation = await reverseGeocode(latitude, longitude)

        setLocation(
          "current",
          {
            placeId: resolvedLocation.placeId,
            address: resolvedLocation.address,
            latitude,
            longitude,
          }
        )
      },
      (error) => {
        console.error(error)
        alert("Unable to retrieve your location.")
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  }

  const handleConfirmLocation = () => {
    if (typeof latitude !== "number" || typeof longitude !== "number") {
      alert("Please select a location first")
      return
    }
  }

  const handlePlaceSelect = useCallback((place: SelectedPlace) => {
    setLocation(
      "custom",
      {
        placeId: place.placeId,
        placeName: place.placeName,
        address: place.address,
        latitude: place.latitude,
        longitude: place.longitude,
      }
    )
  }, [setLocation])

  const handleMapSelect = async ( latitude:number, longitude:number ) => {
    const resolvedLocation = await reverseGeocode(latitude, longitude)

    setCoordinates(
      latitude,
      longitude,
      {
        status: "custom",
        placeId: resolvedLocation.placeId,
        placeName: undefined,
        address: resolvedLocation.address,
      }
    )
  }

  return (
    <section className="space-y-3" aria-labelledby="preference-location-title">
      <div className="space-y-1">
        <h2 id="preference-location-title" className="text-base font-semibold">
          Location
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Use your current location to find nearby places.
        </p>
      </div>

      <div className="space-y-4 rounded-2xl border bg-background/80 p-3">
        {/* Input Search Location */}
        <LocationSearch
          onSelect={handlePlaceSelect}
        />
        {/* Current Location Button */}
        <Button
          type="button"
          variant="ghost"
          className="w-fit px-0 text-primary"
          onClick={handleUseCurrentLocation}
        >
          <LocateFixed className="mr-2 h-4 w-4" aria-hidden="true" />
          Use Current Location
        </Button>

        {/* Embedded Map */}
        <MapSelector
          latitude={latitude}
          longitude={longitude}
          onSelectLocation={handleMapSelect}
        />

        <SelectedAddress
          status={locationStatus}
          address={address}
        />
        {/* Radius Selector */}
        <RadiusSelector
          radius={radius}
          onChange={setRadius}
        />

        {/* Confirm Location */}
        <Button
          type="button"
          className="w-full rounded-xl"
          onClick={handleConfirmLocation}
        >
          Confirm Location
        </Button>
      </div>
    </section>
  )
}
