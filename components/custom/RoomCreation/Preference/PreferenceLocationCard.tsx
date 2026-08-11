"use client"

import { SelectedAddress } from "./LocationComponents/SelectedAddress"
import { LocationRadius } from "./LocationComponents/LocationRadius"
import { useCreateRoomStore } from "@/lib/room/create/stores/create-room-store"
import { LocationSearch, SelectedPlace } from "./LocationComponents/LocationSearch"
import { MapSelector } from "./LocationComponents/MapContainer"
import { useMapsLibrary } from "@vis.gl/react-google-maps"
import { useCallback, useEffect, useState } from "react"

function formatCoordinates(latitude: number, longitude: number) {
  return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`
}

function PreferenceLocationCard() {
  const latitude = useCreateRoomStore((s) => s.latitude)
  const longitude = useCreateRoomStore((s) => s.longitude)

  const setLocation = useCreateRoomStore((s) => s.setLocation)
  const setCoordinates = useCreateRoomStore((s) => s.setCoordinates)

  const locationStatus = useCreateRoomStore((state) => state.locationStatus)
  const address = useCreateRoomStore((state) => state.address)
  const radius = useCreateRoomStore((state) => state.radius)
  const setRadius = useCreateRoomStore((state) => state.setRadius)
  const geocoding = useMapsLibrary("geocoding")
  const [isLocating, setIsLocating] = useState(false)

  // Get Address
  const getAddressFromCoordinates = useCallback(async( latitude: number, longitude: number) => {
    if (!geocoding) return formatCoordinates(latitude, longitude)

    try {
      const geocoder = new geocoding.Geocoder()
      const response = await geocoder.geocode({
        location: { lat: latitude, lng: longitude },
      })

      return response.results[0]?.formatted_address ?? formatCoordinates(latitude, longitude)
    } catch {
      return formatCoordinates(latitude, longitude)
    }
  }, [geocoding])

  // Fetch Selected Place
  const handlePlaceSelect = useCallback((place: SelectedPlace) => {
    setLocation("custom", {
      placeId: place.placeId,
      placeName: place.placeName,
      address: place.address,
      latitude: place.latitude,
      longitude: place.longitude,
    })
  }, [setLocation])

  // Map Selection
  const handleMapSelect = useCallback(async (latitude: number, longitude: number) => {
    const selectedAddress = await getAddressFromCoordinates(latitude, longitude)

    setCoordinates(latitude, longitude, {
      status: "custom",
      placeId: undefined,
      placeName: undefined,
      address: selectedAddress,
    })
  }, [getAddressFromCoordinates, setCoordinates])

  // Current Location Button
  const handleUseCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) return

    setIsLocating(true)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords

          const selectedAddress = await getAddressFromCoordinates(
            latitude,
            longitude
          )

          setCoordinates(latitude, longitude, {
            status: "current",
            placeId: undefined,
            placeName: undefined,
            address: selectedAddress,
          })
        } finally {
          setIsLocating(false)
        }
      },
      () => {
        setIsLocating(false)
      }
    )
  }, [getAddressFromCoordinates, setCoordinates])

  // Automatic Current Location
  useEffect(() => {
    if (!geocoding) return
    if (latitude != null && longitude != null) return

    const currentLocationTimeOut = setTimeout(() => {
      handleUseCurrentLocation()
    }, 0)

    return () => clearTimeout(currentLocationTimeOut)
  }, [geocoding, latitude, longitude, handleUseCurrentLocation])

  return (
    <section className="space-y-4" aria-labelledby="preference-location-title">
      <div className="space-y-1">
        <h2 id="preference-location-title" className="text-base font-semibold">
          Location
        </h2>

        <p className="text-sm text-muted-foreground">
          Choose where you&apos;d like to search for recommendations.
        </p>
      </div>

      <div className="space-y-4 rounded-2xl border bg-background p-4">

        {/* Search Component */}
        <LocationSearch onSelect={handlePlaceSelect} />

        {/* Map Component */}
        <MapSelector
          latitude={latitude}
          longitude={longitude}
          radius={radius}
          onSelectLocation={handleMapSelect}
          onUseCurrentLocation={handleUseCurrentLocation}
          isLocating={isLocating}
        />

        <SelectedAddress
          status={locationStatus}
          address={address}
        />

        <LocationRadius
          radius={radius}
          onChange={setRadius}
        />

      </div>
    </section>
  )
}

export default PreferenceLocationCard
